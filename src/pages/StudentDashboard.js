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
        {/* 🌟 ACTION HUB: WELCOME, FLASHCARDS & GOAL TRACKER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Badge className="mb-4 bg-[#002147]/5 dark:bg-slate-100/5 text-[#002147] dark:text-slate-200 border-none px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] w-fit">
              Active Student Session
            </Badge>
            <h2 className="font-serif text-5xl sm:text-6xl font-black text-[#002147] dark:text-white mb-6 tracking-tighter leading-[0.9]">
              Hello, <span className="text-[#002147]/40 dark:text-white/40">{user?.name?.split(" ")[0]}!</span>
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#002147] dark:text-slate-400" />
                {user?.department}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#002147] dark:text-slate-400" />
                {stats.last_active ? formatDistanceToNow(new Date(stats.last_active), { addSuffix: true }) : 'Just now'}
              </span>
            </div>
          </div>

          {/* Alumni Tips Flashcard (Center) */}
          <div className="lg:col-span-4 h-full">
            <div className="h-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
              <Quote className="absolute -top-2 -left-2 w-20 h-20 text-slate-200/40 dark:text-slate-800/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alumni Pro-Tip</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[100px]"
                  >
                    <p className="text-lg font-bold text-[#002147] dark:text-slate-200 leading-tight mb-4 tracking-tight italic">
                      "{proTips[tipIndex]?.text}"
                    </p>
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">— {proTips[tipIndex]?.author_name || proTips[tipIndex]?.author}</p>
                       {proTips[tipIndex]?.tip_id && (
                         <button 
                          onClick={() => handleHighFive(proTips[tipIndex]?.tip_id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${proTips[tipIndex]?.has_applauded ? 'bg-orange-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-orange-50 hover:text-orange-500 shadow-sm'}`}
                         >
                            <Hand className={`w-3.5 h-3.5 ${proTips[tipIndex]?.has_applauded ? 'fill-white' : ''}`} />
                            <span className="text-[10px] font-black">{proTips[tipIndex]?.applauds_count || 0}</span>
                         </button>
                       )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex gap-1.5 mt-4">
                {proTips.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === tipIndex ? 'w-6 bg-[#002147] dark:bg-slate-200' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Goal Streak Widget (Right) */}
          <Card className="lg:col-span-3 bg-[#002147] dark:bg-[#001529] text-white border-none shadow-2xl shadow-[#002147]/30 dark:shadow-black/50 p-8 rounded-[2rem] relative overflow-hidden group">
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Mission Tracker</p>
                <Badge className="bg-white/10 text-white border-none text-[10px]">{acceptedCount}/{MENTOR_GOAL} Goal</Badge>
              </div>
              <h3 className="text-2xl font-serif font-black mb-2">Connect Streak</h3>
              <div className="w-full h-3 bg-white/10 rounded-full mb-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                />
              </div>
              <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                {acceptedCount === 0 ? "Ready to spark your first conversation?" : `You've locked in ${acceptedCount} expert sessions. Keep pushing!`}
              </p>
            </div>
          </Card>
        </section>

        {/* 🏆 TROPHY ROOM BAND */}
        <section className="mb-12">
           <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Achievement Shelf</h3>
           </div>
           <div className="flex flex-wrap gap-4">
              {achievements.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 ${item.unlocked 
                    ? 'bg-white dark:bg-slate-900 border-yellow-500/30 dark:border-yellow-500/20 shadow-lg shadow-yellow-500/5' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-40 grayscale'}`}
                >
                  <div className={`p-2 rounded-xl ${item.unlocked ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.unlocked ? 'text-[#002147] dark:text-slate-200' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">{item.desc}</p>
                  </div>
                  {item.unlocked && <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />}
                </div>
              ))}
           </div>
        </section>

        {/* 📊 PULSE & STATS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatMiniCard title="Active" val={pendingCount} tint="bg-yellow-500" icon={Clock} />
          <StatMiniCard title="Meetings" val={acceptedCount} tint="bg-green-500" icon={TrendingUp} />
          <StatMiniCard title="Network" val={stats.verified_alumni_count} tint="bg-[#002147]" icon={Users} />
          
          {/* Department Leaderboard Card */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Campus Pulse</p>
            </div>
            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div key={item.program} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">#{idx + 1} {item.program}</span>
                  <span className="text-[10px] font-black text-[#002147] dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">{item.count} Alums</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          {/* 📅 REQUESTS TRACKER (MAIN COLUMN) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <h3 className="text-3xl font-serif font-black text-[#002147] dark:text-white flex items-center gap-4 tracking-tighter">
                <BookOpen className="w-8 h-8 opacity-20 dark:opacity-40" />
                Requests Log
              </h3>
              <Button onClick={() => navigate("/directory")} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl h-10 px-6 font-bold text-xs hover:bg-[#002147] dark:hover:bg-white transition-all">
                New Outreach
              </Button>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-20 text-center border-4 border-dashed border-slate-50 dark:border-slate-800/50 relative group">
                <Search className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-[#002147] dark:text-white mb-2">The log is empty</h4>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-8">Reach out to mentors to see them tracked here.</p>
              </div>
            ) : (
              <div className="space-y-10">
                <AnimatePresence mode="popLayout">
                  {requests.map((request, idx) => (
                    <motion.div
                      key={request.request_id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
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
          <aside className="space-y-10">
            <h3 className="text-xl font-serif font-black text-[#002147] dark:text-white tracking-tight">Growth Kit</h3>
            <div className="space-y-4">
              <ResourceCard 
                title="IIPS Placement Wiki" 
                desc="Cracking campus interviews with alumni notes."
                icon={FileText}
                color="text-blue-500"
              />
              <ResourceCard 
                title="Email Like a Pro" 
                desc="3 templates to get mentors to say YES."
                icon={Lightbulb}
                color="text-yellow-500"
              />
              <ResourceCard 
                title="Mock Interview prep" 
                desc="Top 50 technical questions by department."
                icon={Rocket}
                color="text-purple-500"
              />
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
    </div>
  );
};

// Internal Mini-Components
const StatMiniCard = ({ title, val, tint, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${tint.replace('bg-', 'text-')}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
    </div>
    <p className="text-3xl font-black text-[#002147] dark:text-white tracking-tighter">{val}</p>
  </div>
);

const ResourceCard = ({ title, desc, icon: Icon, color }) => (
  <button className="w-full text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#002147] dark:hover:border-white hover:shadow-lg transition-all group flex gap-4">
    <div className={`mt-1 ${color} group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-sm font-black text-[#002147] dark:text-white mb-1">{title}</h4>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default StudentDashboard;
