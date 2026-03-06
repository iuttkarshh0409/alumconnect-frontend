import React, { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import MentorshipRequestCard from "@/components/MentorshipRequestCard";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ verified_alumni_count: 0, last_active: null });
  const [leaderboard, setLeaderboard] = useState([]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
        <Rocket className="w-10 h-10 text-[#002147] animate-bounce mb-4" />
        <p className="text-[#002147] font-bold tracking-widest uppercase text-xs animate-pulse">Syncing with Campus...</p>
      </div>
    );
  }

  const acceptedCount = requests.filter((r) => r.status === "accepted").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  
  // Mission Tracker Logic
  const MENTOR_GOAL = 5;
  const progressPercent = Math.min((acceptedCount / MENTOR_GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-slate-900 pb-20">
      {/* 🚀 HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#002147] tracking-tight">
              AlumConnect
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* 🌟 ACTION HUB: WELCOME & GOAL TRACKER */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-start">
          <div className="lg:col-span-2">
            <Badge className="mb-4 bg-[#002147]/5 text-[#002147] border-none px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px]">
              Active Student Session
            </Badge>
            <h2 className="font-serif text-5xl sm:text-6xl font-black text-[#002147] mb-6 tracking-tighter leading-[0.9]">
              Hello, <span className="text-[#002147]/40">{user?.name?.split(" ")[0]}!</span>
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#002147]" />
                {user?.department}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#002147]" />
                {stats.last_active ? formatDistanceToNow(new Date(stats.last_active), { addSuffix: true }) : 'Just now'}
              </span>
            </div>
          </div>

          {/* Goal Streak Widget */}
          <Card className="bg-[#002147] text-white border-none shadow-2xl shadow-[#002147]/30 p-8 rounded-[2rem] relative overflow-hidden group">
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Mission Tracker</p>
                <Badge className="bg-white/10 text-white border-none text-[10px]">{acceptedCount}/{MENTOR_GOAL} Chat Goal</Badge>
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

        {/* 📊 PULSE & STATS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatMiniCard title="Active" val={pendingCount} tint="bg-yellow-500" icon={Clock} />
          <StatMiniCard title="Meetings" val={acceptedCount} tint="bg-green-500" icon={TrendingUp} />
          <StatMiniCard title="Network" val={stats.verified_alumni_count} tint="bg-[#002147]" icon={Users} />
          
          {/* Department Leaderboard Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-[#002147]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Campus Pulse</p>
            </div>
            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div key={item.program} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">#{idx + 1} {item.program}</span>
                  <span className="text-[10px] font-black text-[#002147] bg-white px-2 py-0.5 rounded-full shadow-sm">{item.count} Alums</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          {/* 📅 REQUESTS TRACKER (MAIN COLUMN) */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-3xl font-serif font-black text-[#002147] flex items-center gap-4 tracking-tighter">
                <BookOpen className="w-8 h-8 opacity-20" />
                Requests Log
              </h3>
              <Button onClick={() => navigate("/directory")} className="bg-slate-900 text-white rounded-xl h-10 px-6 font-bold text-xs hover:bg-[#002147] transition-all">
                New Outreach
              </Button>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border-4 border-dashed border-slate-50 relative group">
                <Search className="w-12 h-12 text-slate-100 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-[#002147] mb-2">The log is empty</h4>
                <p className="text-slate-400 text-sm font-medium mb-8">Reach out to mentors to see them tracked here.</p>
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
            <h3 className="text-xl font-serif font-black text-[#002147] tracking-tight">Growth Kit</h3>
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

            <div className="p-8 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 mt-12">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Users className="w-6 h-6 text-[#002147]" />
              </div>
              <h4 className="font-bold text-[#002147] mb-2">Need a Specific Intro?</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 italic">
                Our network grows daily. Can't find who you're looking for? Reach out to your Campus Rep.
              </p>
              <Button variant="link" className="p-0 text-[#002147] font-black uppercase tracking-widest text-[10px]">Support Portal →</Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

// Internal Mini-Components
const StatMiniCard = ({ title, val, tint, icon: Icon }) => (
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-xl bg-slate-50 ${tint.replace('bg-', 'text-')}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
    </div>
    <p className="text-3xl font-black text-[#002147] tracking-tighter">{val}</p>
  </div>
);

const ResourceCard = ({ title, desc, icon: Icon, color }) => (
  <button className="w-full text-left p-5 rounded-2xl bg-white border border-slate-100 hover:border-[#002147] hover:shadow-lg transition-all group flex gap-4">
    <div className={`mt-1 ${color} group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="text-sm font-black text-[#002147] mb-1">{title}</h4>
      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{desc}</p>
    </div>
  </button>
);

export default StudentDashboard;
