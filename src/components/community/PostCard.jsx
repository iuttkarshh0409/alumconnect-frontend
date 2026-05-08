import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreVertical, Flag, Zap, Award, Globe, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { usePost } from '../../hooks/community/usePost';
import CommentSection from './CommentSection';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { toggleLike, reportPost } = usePost();

  const handleLike = () => {
    toggleLike({ postId: post.id, isLiked: post.has_liked });
  };

  const handleReport = () => {
    reportPost(post.id);
    setShowMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border-b-4 border-b-blue-600/10"
    >
      <div className="p-8">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover/avatar:opacity-20 blur-sm transition-opacity" />
              <div className="relative w-12 h-12 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <Avatar className="w-full h-full rounded-[0.9rem] overflow-hidden border border-white/10">
                  <AvatarImage src={post.author.picture} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-sm">
                    {getInitials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-lg" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-slate-900 dark:text-white tracking-tight hover:text-blue-600 cursor-pointer transition-colors">
                  {post.author.name}
                </h4>
                {post.author.role === 'alumni' && (
                  <Badge className="bg-blue-600/10 text-blue-600 border-none px-2 py-0 h-4 text-[8px] font-black uppercase">Elite Alum</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1"><Globe size={10} /> Public Network</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <MoreVertical size={18} />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-20 backdrop-blur-xl"
                >
                  <button 
                    onClick={handleReport}
                    className="w-full text-left px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                  >
                    <Flag size={14} />
                    Report Content
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-10">
          <p className="text-slate-800 dark:text-slate-200 text-lg leading-[1.6] font-medium tracking-tight whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {post.content}
          </p>
        </div>

        {/* Post Actions & Stats */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={clsx(
                "flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all font-black text-[11px] uppercase tracking-tighter group",
                post.has_liked 
                  ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 shadow-sm" 
                  : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600"
              )}
            >
              <Heart 
                size={18} 
                fill={post.has_liked ? "currentColor" : "none"} 
                className={clsx(post.has_liked && "animate-bounce-short")} 
              />
              <span>{post.likes_count} <span className="opacity-40">Reacts</span></span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className={clsx(
                "flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all font-black text-[11px] uppercase tracking-tighter group",
                showComments 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm" 
                  : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600"
              )}
            >
              <MessageSquare 
                size={18} 
                fill={showComments ? "currentColor" : "none"} 
              />
              <span>{post.comments_count} <span className="opacity-40">Threads</span></span>
            </button>
          </div>

          <button 
            className="p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-90"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
              toast.success('Link copied to dashboard!', { icon: '🔗' });
            }}
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50 overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
