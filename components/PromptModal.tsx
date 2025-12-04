import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import { X, Copy, Check, Terminal, User, Tag, Layers } from 'lucide-react';

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ prompt, onClose }) => {
  const [editablePrompt, setEditablePrompt] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt) {
      setEditablePrompt(prompt.content);
    }
  }, [prompt]);

  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up max-h-[90vh]">
        
        {/* Left Sidebar: Metadata */}
        <div className="w-full md:w-80 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          {/* Image Header */}
          <div className="h-48 w-full relative shrink-0">
             <img 
              src={prompt.imageUrl} 
              alt={prompt.title}
              className="w-full h-full object-cover grayscale opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
            <div className="absolute top-4 left-4">
               <span className="px-2 py-1 text-[10px] font-bold text-black bg-white rounded uppercase tracking-wider shadow-sm">
                {prompt.type}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Author */}
            <div>
               <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <User size={12} /> Author
               </h4>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <span className="text-xs font-bold text-zinc-400">{prompt.author.substring(0, 2).toUpperCase()}</span>
                 </div>
                 <span className="text-sm font-medium text-zinc-200">{prompt.author}</span>
               </div>
            </div>

            {/* Category */}
            <div>
               <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Layers size={12} /> Category
               </h4>
               <span className="inline-block px-3 py-1 text-xs text-zinc-300 border border-zinc-800 rounded-full bg-zinc-900">
                  {prompt.category}
               </span>
            </div>

            {/* Tags */}
            <div>
               <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Tag size={12} /> Tags
               </h4>
               <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 rounded hover:text-zinc-300 hover:border-zinc-700 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Title, Desc, Editor */}
        <div className="flex-1 flex flex-col bg-black min-w-0">
           {/* Header */}
           <div className="flex items-start justify-between p-6 border-b border-zinc-900">
             <div className="pr-8">
                <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                  {prompt.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {prompt.description}
                </p>
             </div>
             <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors shrink-0"
              >
                <X size={20} />
              </button>
           </div>

           {/* Toolbar */}
           <div className="px-6 py-3 flex items-center justify-between bg-zinc-950/30 border-b border-zinc-900/50">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                <Terminal size={14} />
                <span>Prompt Content</span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  copied 
                    ? 'bg-white text-black' 
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
           </div>

           {/* Editor Area */}
           <div className="flex-1 p-0 overflow-hidden relative group">
             <textarea 
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                className="w-full h-full bg-black p-6 text-zinc-300 focus:outline-none font-mono text-sm leading-relaxed resize-none selection:bg-zinc-800"
                placeholder="Prompt content..."
                spellCheck={false}
              />
           </div>
        </div>

      </div>
    </div>
  );
};

export default PromptModal;