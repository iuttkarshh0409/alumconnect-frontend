import React, { useState } from 'react';
import { useComments } from '../../hooks/community/useComments';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CommentSection = ({ postId }) => {
  const [content, setContent] = useState('');
  const { comments, isLoading, addComment, isAdding } = useComments(postId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    addComment(content, {
      onSuccess: () => {
        setContent('');
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="relative group/input">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-focus-within/input:opacity-10 blur-sm transition-opacity" />
        <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-1 shadow-sm">
          <input
            type="text"
            className="flex-1 bg-transparent border-none py-3 px-5 text-sm font-medium focus:ring-0 placeholder-slate-400 dark:text-white"
            placeholder="Contribute to this thread..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isAdding}
          />
          <button 
            type="submit"
            disabled={isAdding || !content.trim()}
            className="bg-[#002147] dark:bg-blue-600 text-white p-3 rounded-xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 px-10 bg-slate-100/30 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">The thread is quiet. Lead the conversation.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {comments.map((comment, idx) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={clsx("flex gap-4 group", comment.isOptimistic && "opacity-50")}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5">
                      <Avatar className="w-full h-full rounded-[0.5rem] overflow-hidden">
                         <AvatarFallback className="text-[10px] font-black text-slate-500">
                           {getInitials(comment.author_name)}
                         </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* Thread Line */}
                    {idx !== comments.length - 1 && (
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-full bg-slate-100 dark:bg-slate-800" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2 pb-6">
                    <div className="flex items-center gap-3">
                      <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{comment.author_name}</h5>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">
                        {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'transmitting...'}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm group-hover:shadow-md transition-shadow">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium tracking-tight">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
