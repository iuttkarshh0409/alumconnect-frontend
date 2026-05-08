import React from 'react';
import { Users, TrendingUp, Zap, MessageSquare, ShieldCheck, Award, Globe, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreatePost from '../components/community/CreatePost';
import Feed from '../components/community/Feed';
import { useSocket } from '../hooks/community/useSocket';
import { Badge } from '@/components/ui/badge';

const CommunityPage = () => {
  useSocket();

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      {/* 🚀 ELITE HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002147] dark:bg-slate-200 rounded-xl flex items-center justify-center text-white dark:text-[#002147] font-bold shadow-lg shadow-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black text-[#002147] dark:text-white tracking-tight">
                Nexus <span className="text-blue-600">Feed</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Network Active</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Network Strength</p>
                <div className="flex items-center gap-1.5 justify-end">
                   <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                   <span className="text-sm font-black tracking-tighter">Level 4: Master</span>
                </div>
             </div>
             <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
             <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-slate-400" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT SIDEBAR: STATS & DISCOVERY */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32 space-y-8"
            >
              {/* Community Pulse Card */}
              <div className="bg-[#001529] dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group border border-white/5">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Nexus Pulse</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black tracking-tighter leading-none">1,204</h3>
                      <p className="text-[10px] font-bold text-white/30 uppercase">Active Conversations</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-600" 
                       />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trending Now</p>
                </div>
                <div className="space-y-4">
                  {['#Hiring2026', '#FAANGPrep', '#IIPS_Alumni', '#Web3'].map((tag) => (
                    <div key={tag} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors">{tag}</span>
                      <Badge variant="outline" className="text-[8px] font-black opacity-50 border-slate-200 dark:border-slate-700">24 posts</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* MAIN FEED: CENTER */}
          <div className="lg:col-span-6 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-serif font-black text-[#002147] dark:text-white tracking-tighter leading-none">
                  The <span className="text-blue-600">Digital</span> Lounge
                </h2>
                <p className="text-sm text-slate-400 font-medium tracking-tight">High-frequency updates from your alma mater's global network.</p>
              </div>

              <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-5 group-hover:opacity-10 transition duration-1000 group-hover:duration-200" />
                 <CreatePost />
              </div>

              <Feed />
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR: ACTIVE ALUMS & ACTION */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
             <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32 space-y-8"
            >
               {/* Discovery Card */}
               <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-black text-[#002147] dark:text-white mb-2 leading-tight tracking-tight">Verified Connections</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 italic uppercase tracking-tighter">
                    Access high-density professional insights from verified alumni only.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 group-hover:gap-4 transition-all">
                    Expand Directory <Zap size={10} className="fill-blue-600" />
                  </button>
               </div>

               {/* Activity Widget */}
               <div className="p-8 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Contributors</p>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse group-hover:bg-blue-100 transition-colors" />
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded group-hover:bg-blue-200 transition-colors" />
                          <div className="h-2 w-16 bg-slate-100 dark:bg-slate-900 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          </aside>
          
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;
