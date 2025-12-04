'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Prompt, PromptCategory, PromptType } from '../types';
import { INITIAL_PROMPTS } from '../constants';
import PromptCard from './PromptCard';
import PromptDetail from './PromptDetail';
import Toast from './Toast';
import { Search, Sparkles, Github, ArrowLeft, Code, Terminal, Image as ImageIcon, Video, Layers, Heart, ArrowDownUp, Search as SearchIcon, Clock, Sun, Moon } from 'lucide-react';

type ViewState = 'landing' | 'library' | 'detail';
type SortOption = 'newest' | 'alphabetical';
type Theme = 'dark' | 'light';

function MainApp() {
  const [view, setView] = useState<ViewState>('landing');
  const [activeType, setActiveType] = useState<PromptType>(PromptType.WEBAPP);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>(PromptCategory.ALL);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Toast State
  const [toast, setToast] = useState({ message: '', visible: false });

  // Favorites System
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('prompt_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Recently Viewed System
  const [recentPrompts, setRecentPrompts] = useState<Prompt[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('prompt_recents');
    if (saved) {
      const ids = JSON.parse(saved) as string[];
      // Map IDs back to full prompt objects
      return ids.map(id => INITIAL_PROMPTS.find(p => p.id === id)).filter(Boolean) as Prompt[];
    }
    return [];
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('prompt_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const ids = recentPrompts.map(p => p.id);
    localStorage.setItem('prompt_recents', JSON.stringify(ids));
  }, [recentPrompts]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const filteredPrompts = useMemo(() => {
    let result = INITIAL_PROMPTS.filter(prompt => {
      // Filter by Type
      if (prompt.type !== activeType) return false;

      // Filter by Favorites
      if (showFavoritesOnly && !favorites.includes(prompt.id)) return false;

      // Filter by Search
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by Category
      const matchesCategory = selectedCategory === PromptCategory.ALL || prompt.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      // 'newest' - Assuming higher ID or array order is newer for this mock
      return 0; 
    });
  }, [searchQuery, selectedCategory, activeType, sortBy, showFavoritesOnly, favorites]);

  const handleEnterLibrary = (type: PromptType) => {
    setActiveType(type);
    setView('library');
    setSelectedCategory(PromptCategory.ALL);
    setSearchQuery('');
    window.scrollTo(0, 0);
  };

  const handleOpenPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setView('detail');
    window.scrollTo(0, 0);

    // Add to recents
    setRecentPrompts(prev => {
      const filtered = prev.filter(p => p.id !== prompt.id);
      return [prompt, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isAdding = !favorites.includes(id);
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
    if (isAdding) {
      showToast("Added to favorites");
    } else {
      showToast("Removed from favorites");
    }
  };

  const handleTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setView('library');
  };

  const getTypeIcon = (type: PromptType) => {
    switch (type) {
      case PromptType.WEBAPP: return <Code size={20} />;
      case PromptType.SYSTEM: return <Terminal size={20} />;
      case PromptType.IMAGE: return <ImageIcon size={20} />;
      case PromptType.VIDEO: return <Video size={20} />;
      default: return <Layers size={20} />;
    }
  };

  const getTypeDescription = (type: PromptType) => {
    switch (type) {
      case PromptType.WEBAPP: return "Building modern web applications, React components, and frontend logic.";
      case PromptType.SYSTEM: return "Defining AI personas, behavioral instructions, and complex reasoning tasks.";
      case PromptType.IMAGE: return "Generative art prompts for Midjourney, DALL-E, and Stable Diffusion.";
      case PromptType.VIDEO: return "Cinematic descriptions for video generation models like Sora and Veo.";
    }
  };

  if (view === 'detail' && selectedPrompt) {
    return (
      <>
        <PromptDetail 
          prompt={selectedPrompt} 
          onBack={() => setView('library')} 
          isFavorite={favorites.includes(selectedPrompt.id)}
          onToggleFavorite={(e) => toggleFavorite(e, selectedPrompt.id)}
          allPrompts={INITIAL_PROMPTS}
          onOpenRelated={handleOpenPrompt}
          onShowToast={showToast}
          onSearchTag={handleTagSearch}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Toast message={toast.message} isVisible={toast.visible} onClose={handleCloseToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <Toast message={toast.message} isVisible={toast.visible} onClose={handleCloseToast} />
      
      {/* Main Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-xl h-16 animate-fade-in transition-colors duration-300">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              {view === 'library' && (
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              {view === 'library' && <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block" />}
              <div className="flex items-center gap-2" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                  <Sparkles size={18} className="text-white dark:text-black fill-white dark:fill-black" />
                </div>
                <span className="font-bold text-xl tracking-tight text-black dark:text-white hidden sm:block">PromptsMuseum</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </header>

        {view === 'landing' ? (
          /* Landing Page Content */
           <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden pt-20 pb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 via-zinc-50 to-zinc-50 dark:from-zinc-900/40 dark:via-black dark:to-black opacity-50 animate-pulse-slow pointer-events-none" />
            
            <div className="relative z-10 text-center max-w-5xl mx-auto space-y-12 mb-16">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black dark:text-white animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                  CRAFT.
                  <span className="text-zinc-400 dark:text-zinc-800"> CREATE.</span>
                </h1>
                <p className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                  Select a domain to explore curated high-performance AI prompts.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-7xl px-4">
              {Object.values(PromptType).map((type, idx) => (
                <button
                  key={type}
                  onClick={() => handleEnterLibrary(type)}
                  className="group relative h-64 md:h-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 flex flex-col justify-between hover:border-black dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-500 ease-out text-left animate-slide-up opacity-0 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5"
                  style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
                >
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-black dark:text-white group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                    {getTypeIcon(type)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{type}</h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 leading-relaxed">
                      {getTypeDescription(type)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </main>
        ) : (
          /* Library View */
          <>
            <div className="sticky top-16 md:top-16 z-30 bg-white/95 dark:bg-black/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-900 py-4 animate-fade-in transition-colors duration-300" style={{ animationDelay: '0.1s' }}>
              <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                
                <nav className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-w-full no-scrollbar">
                  {Object.values(PromptType).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveType(type);
                        setSelectedCategory(PromptCategory.ALL);
                        setSearchQuery('');
                      }}
                      className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap ${
                        activeType === type
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm scale-105'
                          : 'text-zinc-500 hover:text-black dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </nav>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Sorting & Filter Controls */}
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 rounded-full border border-zinc-200 dark:border-zinc-800 p-1">
                     <button 
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`p-2 rounded-full transition-all ${showFavoritesOnly ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                        title="Show Favorites Only"
                     >
                       <Heart size={16} className={showFavoritesOnly ? "fill-white" : ""} />
                     </button>
                     <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-1" />
                     <button
                        onClick={() => setSortBy(prev => prev === 'newest' ? 'alphabetical' : 'newest')}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                     >
                        {sortBy === 'newest' ? 'Newest' : 'A-Z'}
                        <ArrowDownUp size={14} />
                     </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" size={16} />
                    <input 
                      type="text" 
                      placeholder={`Search ${activeType}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8">
              
              {/* Recently Viewed Section */}
              {recentPrompts.length > 0 && !searchQuery && !showFavoritesOnly && (
                <div className="mb-12 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-2 mb-4 text-zinc-500">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Jump back in</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                    {recentPrompts.map((prompt, idx) => (
                      <div key={prompt.id} className="snap-start shrink-0 w-72">
                         <PromptCard 
                           prompt={prompt} 
                           onOpen={handleOpenPrompt} 
                           index={idx}
                           isFavorite={favorites.includes(prompt.id)}
                           onToggleFavorite={(e) => toggleFavorite(e, prompt.id)}
                         />
                      </div>
                    ))}
                  </div>
                  <div className="h-px w-full bg-zinc-200 dark:bg-zinc-900 mt-4" />
                </div>
              )}

              <div className="mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2">{activeType} Prompts</h2>
                <p className="text-zinc-500">{getTypeDescription(activeType)}</p>
              </div>

              {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPrompts.map((prompt, index) => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onOpen={handleOpenPrompt} 
                      index={index}
                      isFavorite={favorites.includes(prompt.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, prompt.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-[2rem] bg-zinc-100/50 dark:bg-zinc-900/10 animate-scale-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-900 mb-4 text-zinc-500">
                    <SearchIcon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No prompts found</h3>
                  <p className="text-zinc-500 max-w-sm mx-auto">
                    We couldn't find any {activeType.toLowerCase()} prompts matching your criteria.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(PromptCategory.ALL);
                      setShowFavoritesOnly(false);
                    }}
                    className="mt-6 px-6 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-800 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-zinc-500 dark:text-zinc-400"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </main>
          </>
        )}

        <footer className="border-t border-zinc-200 dark:border-zinc-900 py-12 mt-12 bg-zinc-50 dark:bg-black animate-fade-in opacity-0 transition-colors duration-300" style={{ animationDelay: '0.8s' }}>
          <div className="container mx-auto px-4 text-center">
            <p className="text-zinc-500 dark:text-zinc-600 text-sm">
              © {new Date().getFullYear()} PromptsMuseum. Minimalist Prompt Library.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MainApp;