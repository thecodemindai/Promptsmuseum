import React, { useState } from 'react';
import { Prompt, PromptType } from '../types';
import { Copy, Maximize2, Check, Heart, Code, Terminal, Sparkles, AlertCircle } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onOpen: (prompt: Prompt) => void;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onOpen, index, isFavorite, onToggleFavorite }) => {
  const [imgSrc, setImgSrc] = useState(prompt.imageUrl);
  const [imgError, setImgError] = useState(false);

  const isVisual = prompt.type === PromptType.IMAGE || prompt.type === PromptType.VIDEO;
  const isNew = index < 3; 

  const handleImageError = () => {
    setImgError(true);
    setImgSrc('https://images.unsplash.com/photo-1620641788421-7f1c338e420a?auto=format&fit=crop&w=800&q=80');
  };

  return (
    <div 
      className="group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[2rem] overflow-hidden hover:border-black dark:hover:border-white/20 hover:shadow-2xl transition-all duration-500 cursor-pointer animate-slide-up opacity-0 flex flex-col h-full"
      onClick={() => onOpen(prompt)}
      style={{ animationDelay: `${0.05 * index}s` }}
    >
      {/* Favorite Button */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110 duration-300"
      >
        <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
      </button>

      {/* New Badge */}
      {isNew && (
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider shadow-lg">
          New
        </div>
      )}

      {/* Image Section (Only for Visual Prompts) */}
      {isVisual ? (
         <div className="h-48 md:h-56 w-full relative overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900">
            <img 
              src={imgSrc} 
              alt={prompt.title}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 ${imgError ? 'grayscale opacity-50' : 'grayscale group-hover:grayscale-0'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-950 dark:via-zinc-950/20 dark:to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
               <span className="px-2 py-1 text-[10px] font-bold text-black dark:text-white/90 bg-white/50 dark:bg-black/50 backdrop-blur rounded uppercase tracking-wider border border-black/10 dark:border-white/10">
                 {prompt.type}
               </span>
            </div>
         </div>
      ) : (
          <div className={`p-6 pb-0 flex items-center justify-between ${isNew ? 'pt-14' : ''}`}>
              <span className={`px-2 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5`}>
                 {prompt.type === PromptType.WEBAPP ? <Code size={12} /> : <Terminal size={12} />}
                 {prompt.type}
              </span>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">{prompt.category}</span>
          </div>
      )}

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-tight group-hover:text-black dark:group-hover:text-zinc-200 transition-colors line-clamp-2">
          {prompt.title}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
          {prompt.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900/50 mt-auto">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                {prompt.author.substring(0, 1)}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-medium truncate max-w-[80px]">{prompt.author}</span>
           </div>

           <button className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1 group/btn">
              View Details 
              <Maximize2 size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;