import React, { useState, useRef, useEffect } from 'react';
import { Prompt, PromptType } from '../types';
import { ArrowLeft, Copy, Check, User, Tag, Layers, Sparkles, ZoomIn, ZoomOut, RefreshCcw, Heart, Link, Maximize, Minimize, Star, Code, Terminal, Sun, Moon } from 'lucide-react';

interface PromptDetailProps {
  prompt: Prompt;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  allPrompts: Prompt[];
  onOpenRelated: (prompt: Prompt) => void;
  onShowToast: (msg: string) => void;
  onSearchTag: (tag: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const PromptDetail: React.FC<PromptDetailProps> = ({ prompt, onBack, isFavorite, onToggleFavorite, allPrompts, onOpenRelated, onShowToast, onSearchTag, theme, onToggleTheme }) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(prompt.imageUrl);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(prompt.content);
  const [fontSize, setFontSize] = useState(16); // px

  // Zoom & Pan State
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isVisual = prompt.type === PromptType.IMAGE || prompt.type === PromptType.VIDEO;
  
  // Load local rating
  useEffect(() => {
    const savedRating = localStorage.getItem(`rating_${prompt.id}`);
    if (savedRating) setUserRating(parseInt(savedRating, 10));
  }, [prompt.id]);

  // Update content state when prompt changes
  useEffect(() => {
    setContent(prompt.content);
  }, [prompt]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
      if (e.key.toLowerCase() === 'f' && !isEditing) setIsFocusMode(prev => !prev);
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !isEditing) {
        e.preventDefault();
        handleCopy();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, isEditing]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onShowToast("Prompt copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}?id=${prompt.id}`; 
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    onShowToast("Link copied to clipboard");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    localStorage.setItem(`rating_${prompt.id}`, rating.toString());
    onShowToast(`Rated ${rating} stars`);
  };

  const handleExportJson = () => {
    const data = JSON.stringify({ ...prompt, content }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("Exported to JSON");
  };

  const handleImageError = () => {
    setImgSrc('https://images.unsplash.com/photo-1620641788421-7f1c338e420a?auto=format&fit=crop&w=800&q=80');
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Stats
  const wordCount = content.trim().split(/\s+/).length;
  const charCount = content.length;
  // Rough approximation for tokens
  const tokenCount = Math.ceil(charCount / 4);

  // Image Interaction Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (transform.scale > 1 || e.deltaY < 0) {
      e.preventDefault();
    }
    const scaleAmount = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(1, transform.scale + scaleAmount), 5);
    setTransform(prev => ({
      ...prev,
      scale: newScale,
      x: newScale === 1 ? 0 : prev.x,
      y: newScale === 1 ? 0 : prev.y
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (transform.scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && transform.scale > 1) {
      e.preventDefault();
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.5, 5) }));
  };

  const zoomOut = () => {
    setTransform(prev => {
        const newScale = Math.max(prev.scale - 0.5, 1);
        return { 
            ...prev, 
            scale: newScale,
            x: newScale === 1 ? 0 : prev.x,
            y: newScale === 1 ? 0 : prev.y
        };
    });
  };

  const resetZoom = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };

  const relatedPrompts = allPrompts
    .filter(p => p.id !== prompt.id && p.category === prompt.category && p.type === prompt.type)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col lg:flex-row animate-fade-in overflow-hidden selection:bg-black/10 dark:selection:bg-white/30 transition-colors duration-300">
      
      {/* Scroll Progress Bar (Top) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-900 z-[60]">
        <div 
          className="h-full bg-black dark:bg-white transition-all duration-300 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation - Floating */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-50 group flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-300 shadow-xl animate-scale-in opacity-0"
        style={{ animationDelay: '0.1s' }}
        title="Go Back (Esc)"
      >
        <ArrowLeft size={16} />
        <span className="font-bold text-xs uppercase tracking-wider">Back</span>
      </button>

      {/* Action Tools - Floating Right */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3 animate-scale-in opacity-0" style={{ animationDelay: '0.1s' }}>
        
        {/* Toggle Theme */}
        <button 
             onClick={onToggleTheme}
             className="p-2.5 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
             title="Toggle Theme"
        >
             {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Share Button */}
        <button 
            onClick={handleShare}
            className="p-2.5 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            title="Share Link"
        >
            {linkCopied ? <Check size={16} /> : <Link size={16} />}
        </button>

        {/* Export JSON */}
        <button 
            onClick={handleExportJson}
            className="p-2.5 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors hidden sm:block"
            title="Export JSON"
        >
            <Code size={16} />
        </button>

        {/* Focus Mode Toggle */}
        <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-2.5 backdrop-blur-md border rounded-full transition-colors ${isFocusMode ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white/50 dark:bg-black/50 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title={isFocusMode ? "Exit Focus Mode (F)" : "Enter Focus Mode (F)"}
        >
            {isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>

        {/* Favorite Toggle */}
        <button 
            onClick={onToggleFavorite}
            className="p-2.5 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors group"
        >
             <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500 group-hover:text-white group-hover:fill-white" : ""} />
        </button>
      </div>

      {/* Left Column: Image View */}
      {isVisual && !isFocusMode && (
        <div className="relative w-full lg:w-[50%] h-[40vh] lg:h-full shrink-0 bg-zinc-50 dark:bg-black flex items-center justify-center overflow-hidden select-none animate-fade-in transition-all duration-500">
          
          <div 
              ref={imageRef}
              className="w-full h-full flex items-center justify-center cursor-zoom-in active:cursor-grabbing p-8"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{ 
                  cursor: transform.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' 
              }}
          >
              <div 
                  className="relative transition-transform duration-300 ease-out will-change-transform flex items-center justify-center w-full h-full"
                  style={{ 
                      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` 
                  }}
              >
                  {/* Skeleton Loader */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 rounded-[3rem] bg-zinc-200 dark:bg-zinc-900 animate-pulse border border-zinc-300 dark:border-zinc-800" />
                  )}

                  <img 
                      src={imgSrc} 
                      alt={prompt.title}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className={`max-w-full max-h-full object-contain drop-shadow-2xl animate-scale-in opacity-0 rounded-[3rem] ${
                        transform.scale === 1 
                          ? 'transition-all duration-700 ease-in-out hover:scale-[1.02] hover:rotate-1' 
                          : ''
                      } ${!imageLoaded ? 'invisible' : 'visible'}`}
                      style={{ animationDelay: '0.2s' }}
                      draggable={false}
                  />
              </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2 animate-scale-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <button onClick={zoomIn} className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-lg active:scale-90 duration-200"><ZoomIn size={20} /></button>
              <button onClick={zoomOut} className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-lg active:scale-90 duration-200"><ZoomOut size={20} /></button>
              <button onClick={resetZoom} className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-lg active:scale-90 duration-200"><RefreshCcw size={20} /></button>
          </div>
          
          <div className="absolute bottom-8 left-8 hidden lg:flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xl animate-scale-in opacity-0 z-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>
             <Sparkles size={14} className="text-black dark:text-white" />
             <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">{prompt.type} Prompt</span>
          </div>
        </div>
      )}

      {/* Right Column: Scrollable Content */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className={`flex-1 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-black relative border-t lg:border-t-0 z-10 transition-all duration-500 ${isVisual && !isFocusMode ? 'lg:border-l border-zinc-200 dark:border-zinc-900' : 'w-full'}`}
      >
        <div className={`min-h-full flex flex-col p-6 md:p-12 ${isFocusMode ? 'max-w-3xl mx-auto pt-28' : (isVisual ? 'max-w-4xl lg:p-20 mx-auto' : 'max-w-5xl pt-24 md:pt-28 lg:pt-32 mx-auto')}`}>
            
            <div className={`mb-12 space-y-6 animate-slide-up opacity-0 ${isFocusMode ? 'text-center' : (isVisual ? 'pt-8 lg:pt-0' : '')}`} style={{ animationDelay: '0.3s' }}>
                 <div className={`flex items-center gap-2 mb-4 text-zinc-500 ${isFocusMode ? 'justify-center' : (isVisual ? 'lg:hidden' : '')}`}>
                    <Sparkles size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{prompt.type} Prompt</span>
                 </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-black dark:text-white leading-[0.95]">
                    {prompt.title}
                </h1>
                
                {!isFocusMode && (
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-xl border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 my-8">
                        {prompt.description}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur py-4 z-10 border-b border-zinc-200 dark:border-zinc-900 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 text-zinc-500">
                    <Layers size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Prompt Content</span>
                </div>
                 
                 <div className="flex items-center gap-2">
                     {/* Text Size Controls */}
                     <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 mr-2">
                        <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-1 hover:text-black dark:hover:text-white text-zinc-500 text-xs font-bold">A-</button>
                        <button onClick={() => setFontSize(prev => Math.min(24, prev + 2))} className="p-1 hover:text-black dark:hover:text-white text-zinc-500 text-xs font-bold">A+</button>
                     </div>

                     {/* Edit Mode Toggle */}
                     <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isEditing ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                     >
                        {isEditing ? 'Done' : 'Edit'}
                     </button>

                     <button
                        onClick={handleCopy}
                        title="Copy (Cmd+C)"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide transition-all active:scale-95 ${
                          copied 
                            ? 'bg-black text-white dark:bg-white dark:text-black scale-105 shadow-lg shadow-black/20 dark:shadow-white/20' 
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                 </div>
            </div>

            <div className="relative group mb-2 flex-1 animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 rounded-[2rem] opacity-20 blur group-hover:opacity-40 transition-opacity duration-500" />
                <div className={`relative bg-zinc-50 dark:bg-zinc-950 border rounded-[1.5rem] p-8 md:p-10 shadow-2xl overflow-hidden min-h-[200px] transition-all duration-700 border-zinc-200 dark:border-zinc-900`}>
                    {isEditing ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ fontSize: `${fontSize}px` }}
                            className="w-full h-[400px] bg-transparent font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed focus:outline-none resize-none"
                        />
                    ) : (
                        <pre 
                            style={{ fontSize: `${fontSize}px` }}
                            className="font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed selection:bg-black/10 dark:selection:bg-zinc-800"
                        >
                            {content}
                        </pre>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
             <div className="flex items-center justify-end gap-6 mb-16 px-4 text-[10px] font-medium text-zinc-400 uppercase tracking-wider animate-slide-up opacity-0" style={{ animationDelay: '0.55s' }}>
                 <span>{wordCount} Words</span>
                 <span>{charCount} Chars</span>
                 <span>~{tokenCount} Tokens</span>
             </div>

            {!isFocusMode && (
                <div className="mt-auto pt-12 border-t border-zinc-200 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
                     <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-4">
                            <User size={14} /> Creator
                        </h4>
                        <div className="flex items-center gap-3 group/author cursor-default">
                             <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 group-hover/author:border-zinc-400 dark:group-hover/author:border-zinc-600 transition-colors">
                                {prompt.author.substring(0, 2).toUpperCase()}
                             </div>
                             <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover/author:text-black dark:group-hover/author:text-white transition-colors">{prompt.author}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-4">
                            <Star size={14} /> Rate Prompt
                        </h4>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star 
                                        size={18} 
                                        className={`${star <= userRating ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-4">
                            <Tag size={14} /> Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {prompt.tags.map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => onSearchTag(tag)}
                                    className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-xs text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isFocusMode && relatedPrompts.length > 0 && (
                <div className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-900 animate-slide-up opacity-0" style={{ animationDelay: '0.7s' }}>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-6">More like this</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPrompts.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => onOpenRelated(p)}
                                className="text-left group/related p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="aspect-video w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 mb-3 overflow-hidden">
                                     {p.type === PromptType.IMAGE || p.type === PromptType.VIDEO ? (
                                        <img src={p.imageUrl} className="w-full h-full object-cover grayscale opacity-80 group-hover/related:scale-105 transition-transform duration-500" alt="" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-700">
                                            {p.type === PromptType.WEBAPP ? <Code /> : <Terminal />}
                                        </div>
                                     )}
                                </div>
                                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-300 group-hover/related:text-black dark:group-hover/related:text-white truncate">{p.title}</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-600 truncate mt-1">{p.author}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default PromptDetail;