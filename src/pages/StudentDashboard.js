import React, { useState, useEffect, useCallback } from "react";
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
  ExternalLink,
  Trash2,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import MentorshipRequestCard from "@/components/MentorshipRequestCard";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();

      const userRes = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);

      const requestsRes = await axios.get(
        `${API_URL}/api/mentorship/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(requestsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user data");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147] mb-4"></div>
        <p className="text-[#002147] font-medium animate-pulse">Prepping your dashboard...</p>
      </div>
    );
  }

  const activeRequests = requests.filter((r) => r.status === "pending").length;
  const acceptedRequests = requests.filter((r) => r.status === "accepted").length;

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#002147] tracking-tight">
              AlumConnect
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* WELCOME SECTION */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Badge variant="outline" className="mb-4 bg-[#002147]/5 text-[#002147] border-none px-3 py-1 font-semibold uppercase tracking-widest text-[10px]">
                  Student Dashboard
                </Badge>
                <h2 className="font-serif text-5xl font-extrabold text-[#002147] mb-4 tracking-tight">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </h2>
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {user?.department}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Last active: Today
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate("/directory")}
                className="bg-[#002147] hover:bg-[#003366] text-white rounded-xl px-8 py-6 h-auto text-lg font-bold shadow-xl shadow-[#002147]/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Find Mentors
                <ChevronRight className="w-5 h-5 ml-2 opacity-30 group-hover:opacity-100 transition-all" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* STATS TILES */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 hover:border-[#002147]/30 transition-all duration-300 group bg-white shadow-sm hover:shadow-lg">
              <CardContent className="p-8 pb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                  <h3 className="text-4xl font-extrabold text-[#002147]">{activeRequests}</h3>
                </div>
                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
              </CardContent>
              <div className="px-8 pb-4">
                <p className="text-xs text-slate-500 font-medium italic">Awaiting response from Alumni</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-200 hover:border-green-200 transition-all duration-300 group bg-white shadow-sm hover:shadow-lg">
              <CardContent className="p-8 pb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Accepted</p>
                  <h3 className="text-4xl font-extrabold text-[#002147]">{acceptedRequests}</h3>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </CardContent>
              <div className="px-8 pb-4">
                <p className="text-xs text-slate-500 font-medium italic">Ongoing mentorship sessions</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-slate-200 hover:border-[#002147]/30 transition-all duration-300 group bg-white shadow-sm hover:shadow-lg">
              <CardContent className="p-8 pb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Network</p>
                  <h3 className="text-4xl font-extrabold text-[#002147]">50+</h3>
                </div>
                <div className="w-14 h-14 bg-[#002147]/5 rounded-2xl flex items-center justify-center text-[#002147] group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
              </CardContent>
              <div className="px-8 pb-4">
                <p className="text-xs text-slate-500 font-medium italic">Verified Alumni ready to mentor</p>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* REQUESTS LIST */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-serif font-bold text-[#002147] flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              My Mentorship Tracker
            </h3>
            <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold">
              {requests.length} Overall
            </Badge>
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 shadow-sm"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-2xl font-bold text-[#002147] mb-2">No active requests</h4>
              <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                You haven't reached out to any alumni yet. Start by browsing the directory to find a mentor who matches your goals.
              </p>
              <Button
                onClick={() => navigate("/directory")}
                className="bg-[#002147] hover:bg-[#003366] text-white rounded-xl px-10 h-12 font-bold transition-all shadow-lg shadow-[#002147]/10"
              >
                Find your first Mentor
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8 pb-12">
              <AnimatePresence mode="popLayout">
                {requests.map((request, idx) => (
                  <motion.div
                    key={request.request_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <MentorshipRequestCard
                      request={request}
                      userRole="student"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-60">
            <div className="w-6 h-6 bg-[#002147] rounded flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="font-serif font-bold text-[#002147]">AlumConnect</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">© 2026 AlumConnect Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-[#002147] uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-[#002147] uppercase tracking-widest transition-colors">Terms</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-[#002147] uppercase tracking-widest transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
