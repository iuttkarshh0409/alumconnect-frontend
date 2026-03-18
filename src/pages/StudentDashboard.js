import React, { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import {
  Users,
  TrendingUp,
  BookOpen,
  MessageSquare,
  LogOut,
  Search,
  ChevronRight,
  Clock,
  GraduationCap,
  Sparkles,
  Trophy,
  Rocket,
  FileText,
  Lightbulb,
  Zap,
  Target,
  ShieldCheck,
  Award,
  Quote,
  Flame,
  Hand,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import MentorshipRequestCard from "@/components/MentorshipRequestCard";
import InboxSheet from "@/components/InboxSheet";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PRO_TIPS = [
  {
    text: "Focus on DSA, but don't ignore system design for top-tier roles.",
    author: "Sameer (SDE II @ Amazon)",
  },
  {
    text: "Building projects is better than just watching tutorials. Ship it!",
    author: "Yashvi (Fullstack @ Zomato)",
  },
  {
    text: "Networking is not just asking for jobs; it's asking for advice.",
    author: "Rahul (PM @ Razorpay)",
  },
  {
    text: "Master one language deeply rather than five at a surface level.",
    author: "Ankit (Sr. Engineer @ Microsoft)",
  },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ verified_alumni_count: 0, last_active: null });
  const [leaderboard, setLeaderboard] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [proTips, setProTips] = useState(PRO_TIPS);
  const [inboxOpen, setInboxOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();

      // 1. Fetch User Profile
      const userRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      // 2. Fetch Mentorship Requests
      const requestsRes = await axios.get(`${API_URL}/api/mentorship/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requestsRes.data);

      // 3. Fetch Personal & Network Stats
      const statsRes = await axios.get(`${API_URL}/api/student/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);

      // 4. Fetch Campus Leaderboard (Alumni by Program)
      const leaderboardRes = await axios.get(`${API_URL}/api/analytics/programs/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(leaderboardRes.data.slice(0, 3));
      // 5. Fetch Alumni Wisdom Tips
      const wisdomRes = await axios.get(`${API_URL}/api/student/wisdom`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (wisdomRes.data && wisdomRes.data.length > 0) {
        setProTips([...wisdomRes.data, ...PRO_TIPS]);
      }

    } catch (error) {
      console.error(error);
      toast.error("Session refresh failed");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchData();
  }, [isLoaded, isSignedIn, fetchData]);

  const handleHighFive = async (tipId) => {
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/wisdom/${tipId}/high-five`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh wisdom tips
      const wisdomRes = await axios.get(`${API_URL}/api/student/wisdom`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (wisdomRes.data && wisdomRes.data.length > 0) {
        setProTips([...wisdomRes.data, ...PRO_TIPS]);
      }
      toast.success("High-five sent!");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // Tip Slider Logic
  useEffect(() => {
    if (proTips.length <= 1) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % proTips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [proTips.length]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] dark:bg-slate-950">
        <Rocket className="w-10 h-10 text-[#002147] dark:text-slate-200 animate-bounce mb-4" />
        <p className="text-[#002147] dark:text-slate-200 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing with Campus...</p>
      </div>
    );
  }

  const acceptedCount = requests.filter((r) => r.status === "accepted").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  
  // Mission Tracker Logic
  const MENTOR_GOAL = 5;
  const progressPercent = Math.min((acceptedCount / MENTOR_GOAL) * 100, 100);

  // Achievement Logic
  const achievements = [
    { id: "ninja", label: "Outreach Ninja", icon: Target, unlocked: requests.length >= 5, desc: "Sent 5+ Requests" },
    { id: "connector", label: "Master Connector", icon: Award, unlocked: acceptedCount >= 3, desc: "3+ Sessions Locked" },
    { id: "pioneer", label: "Early Pioneer", icon: Zap, unlocked: requests.length >= 1, desc: "First Outreach Sent" },
    { id: "dark", label: "Dark Knight", icon: ShieldCheck, unlocked: theme === "dark", desc: "Using Dark Mode" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* 🚀 HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] dark:bg-slate-100 rounded-lg flex items-center justify-center text-white dark:text-[#002147] font-bold text-xl">
              A
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#002147] dark:text-white tracking-tight">
              AlumConnect
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setInboxOpen(true)}
              className="rounded-full w-8 h-8 border-slate-100 dark:border-slate-800 dark:bg-slate-800 flex items-center justify-center p-0"
            >
              <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-200" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-400 dark:text-slate-500 hover:text-red-500 font-bold text-xs uppercase tracking-widest"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* 🚀 ACTION HUB: WELCOME, FLASHCARDS & GOAL TRACKER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-stretch">
          <div className="lg:col-span-12 mb-4">
             <Badge className="mb-4 bg-[#002147]/5 dark:bg-slate-100/5 text-[#002147] dark:text-slate-200 border-none px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] w-fit">
              Academic Protocol Active
            </Badge>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="font-serif text-5xl sm:text-7xl font-black text-[#002147] dark:text-white mb-6 tracking-tighter leading-[0.85]">
              Welcome back, <br/>
              <span className="text-[#002147]/40 dark:text-white/40">{user?.name?.split(" ")[0]}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-8 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-[0.15em]">
              <span className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                {user?.department}
              </span>
              <span className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-orange-400" />
                {stats.last_active ? formatDistanceToNow(new Date(stats.last_active), { addSuffix: true }) : 'Active now'}
              </span>
            </div>
          </div>

          {/* Alumni Tips Flashcard (Center) */}
          <div className="lg:col-span-4 h-full">
            <div className="h-full bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-500">
              <Quote className="absolute -top-4 -left-4 w-24 h-24 text-slate-200/30 dark:text-slate-800/20 rotate-12" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Insight of the Week</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[120px]"
                  >
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-[1.4] mb-6 tracking-tight italic">
                      "{proTips[tipIndex]?.text}"
                    </p>
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#002147] dark:text-slate-400">
                         <span className="opacity-40">BY </span>{proTips[tipIndex]?.author_name || proTips[tipIndex]?.author}
                       </p>
                       {proTips[tipIndex]?.tip_id && (
                         <button 
                          onClick={() => handleHighFive(proTips[tipIndex]?.tip_id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-tighter ${proTips[tipIndex]?.has_applauded ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-orange-500 border border-slate-100 dark:border-slate-700'}`}
                         >
                            <Hand className={`w-3.5 h-3.5 ${proTips[tipIndex]?.has_applauded ? 'fill-white' : ''}`} />
                            {proTips[tipIndex]?.applauds_count || 0}
                         </button>
                       )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex gap-2 mt-6">
                {proTips.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === tipIndex ? 'w-8 bg-[#002147] dark:bg-blue-500' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Goal Streak Widget (Right) */}
          <Card className="lg:col-span-3 bg-[#002147] dark:bg-[#001529] text-white border-none shadow-2xl shadow-[#002147]/20 dark:shadow-black/40 p-10 rounded-[2.5rem] relative overflow-hidden group">
            <Sparkles className="absolute -top-8 -right-8 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Progression</p>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">{acceptedCount}/{MENTOR_GOAL} Target</div>
              </div>
              <h3 className="text-3xl font-serif font-black mb-4 tracking-tighter">Velocity</h3>
              <div className="mt-auto">
                <div className="w-full h-2.5 bg-white/10 rounded-full mb-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full relative"
                  >
                    <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 animate-shimmer" />
                  </motion.div>
                </div>
                <p className="text-[11px] font-bold text-white/50 leading-relaxed uppercase tracking-widest">
                  {acceptedCount === 0 ? "Initiate first Outreach" : `${progressPercent}% towards Milestone 1`}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 🏆 TROPHY ROOM BAND */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Distinction Shelf</h3>
              </div>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-8" />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((item) => (
                <div 
                  key={item.id} 
                  className={`group flex items-center gap-5 px-8 py-6 rounded-3xl border transition-all duration-500 ${item.unlocked 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1' 
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-60'}`}
                >
                  <div className={`p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${item.unlocked ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-[0.1em] mb-1 ${item.unlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* 📊 PULSE & STATS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <StatMiniCard title="Active Flux" val={pendingCount} tint="text-orange-500" icon={Clock} />
          <StatMiniCard title="Engagement" val={acceptedCount} tint="text-blue-500" icon={TrendingUp} />
          <StatMiniCard title="Alumni Index" val={stats.verified_alumni_count} tint="text-emerald-500" icon={Users} />
          
          {/* Department Leaderboard Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Campus Pulse</p>
            </div>
            <div className="space-y-4">
              {leaderboard.map((item, idx) => (
                <div key={item.program} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-tight">#{idx + 1} {item.program}</span>
                  <Badge variant="outline" className="text-[10px] font-black border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-2 shadow-none">{item.count} Active</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          {/* 📅 REQUESTS TRACKER (MAIN COLUMN) */}
          <div className="xl:col-span-2 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
              <div className="space-y-1">
                <h3 className="text-4xl font-serif font-black text-[#002147] dark:text-white tracking-tighter">
                  Outreach Ledger
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Coordinate your professional connections and session intents.</p>
              </div>
              <Button onClick={() => navigate("/directory")} className="bg-[#002147] dark:bg-blue-600 text-white rounded-2xl h-12 px-8 font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                Initiate Outreach
              </Button>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-24 text-center border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50/50 dark:bg-blue-500/5 rounded-full blur-3xl" />
                <div className="relative z-10 max-w-xs mx-auto">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h4 className="text-2xl font-serif font-black text-slate-800 dark:text-white mb-4 tracking-tight">Clear Ledger</h4>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium leading-relaxed mb-10">Your mentorship queue is empty. Access the Alumni Directory to begin your outreach strategy.</p>
                  <Button variant="outline" onClick={() => navigate("/directory")} className="rounded-xl px-10 border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest">Open Directory</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {requests.map((request, idx) => (
                    <motion.div
                      key={request.request_id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <MentorshipRequestCard
                        request={request}
                        userRole="student"
                        onUpdate={fetchData}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick-Drop Resource Library (Sidebar) */}
          <aside className="space-y-12">
            <div>
              <h3 className="text-2xl font-serif font-black text-[#002147] dark:text-white tracking-tight mb-8">Strategic Kit</h3>
              <div className="space-y-5">
                <ResourceCard 
                  title="Placement Manual" 
                  desc="High-density interview blueprints."
                  icon={FileText}
                  color="text-blue-500"
                />
                <ResourceCard 
                  title="Communication Suite" 
                  desc="High-response email architectures."
                  icon={Lightbulb}
                  color="text-orange-500"
                />
                <ResourceCard 
                  title="Tactical Mockups" 
                  desc="Departmental stress-test simulations."
                  icon={Rocket}
                  color="text-indigo-500"
                />
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 mt-12">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Users className="w-6 h-6 text-[#002147] dark:text-slate-200" />
              </div>
              <h4 className="font-bold text-[#002147] dark:text-white mb-2">Need a Specific Intro?</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mb-6 italic">
                Our network grows daily. Can't find who you're looking for? Reach out to your Campus Rep.
              </p>
              <Button variant="link" className="p-0 text-[#002147] dark:text-slate-200 font-black uppercase tracking-widest text-[10px]">Support Portal →</Button>
            </div>
          </aside>
        </div>
      </main>
      <InboxSheet open={inboxOpen} onOpenChange={setInboxOpen} />
    </div>
  );
};

// Internal Mini-Components
const StatMiniCard = ({ title, val, tint, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-colors duration-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 ${tint}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</p>
    </div>
    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{val}</p>
  </div>
);

const ResourceCard = ({ title, desc, icon: Icon, color }) => (
  <button className="w-full text-left p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400 group flex gap-5 transition-all duration-300 hover:shadow-lg shadow-blue-500/5 hover:-translate-x-1">
    <div className={`mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 transition-all duration-500 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 ${color}`}>
      <Icon className="w-5 h-5 outline-none" />
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="text-[13px] font-black text-slate-900 dark:text-slate-100 mb-1 leading-tight">{title}</h4>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default StudentDashboard;
