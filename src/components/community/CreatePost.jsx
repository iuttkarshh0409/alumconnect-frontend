import React, { useState } from 'react';
import { Send, Image, Smile, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { usePost } from '../../hooks/community/usePost';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const { createPost, isCreating } = usePost();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createPost(content, {
      onSuccess: () => {
        setContent('');
        toast.success('Your insight has been broadcasted!', {
          icon: <Zap className="text-yellow-500 fill-yellow-500" size={14} />,
        });
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden group"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 font-black shadow-inner">
                <Sparkles size={24} className="text-blue-500 opacity-40" />
             </div>
             <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 rounded-full opacity-50" />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-blue-500" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Network Broadcast</p>
              </div>
              <p className={clsx("text-[10px] font-black tracking-widest", content.length > 250 ? "text-rose-500" : "text-slate-300")}>
                {content.length} / 500
              </p>
            </div>

            <textarea
              className="w-full bg-transparent border-none rounded-2xl p-0 text-slate-800 dark:text-slate-200 text-xl font-medium placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 min-h-[120px] resize-none transition-all leading-relaxed"
              placeholder="Broadcast an update, job lead, or insight..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isCreating}
              maxLength={500}
            />
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all active:scale-90"
                  onClick={() => toast.info('Media attachment coming soon!')}
                >
                  <Image size={20} />
                </button>
                <button 
                  type="button" 
                  className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all active:scale-90"
                  onClick={() => toast.info('Mentions system coming soon!')}
                >
                  <Smile size={20} />
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isCreating || !content.trim()}
                className="bg-[#002147] dark:bg-blue-600 hover:bg-[#003366] dark:hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 group/btn"
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Broadcast</span>
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

// Helper for conditional classes
const clsx = (...classes) => classes.filter(Boolean).join(' ');

export default CreatePost;
