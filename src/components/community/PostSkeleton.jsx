import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-8 animate-pulse shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-2 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
      
      <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex justify-between">
        <div className="flex gap-4">
          <div className="h-10 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
          <div className="h-10 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
        </div>
        <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
      </div>
    </div>
  );
};

export default PostSkeleton;
