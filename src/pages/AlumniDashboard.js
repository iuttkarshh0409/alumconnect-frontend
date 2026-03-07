import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import {
  Users,
  BookOpen,
  LogOut,
  Edit,
  CheckCircle,
  Clock,
  Briefcase,
  GraduationCap,
  Mail,
  Linkedin,
  Plus,
  ArrowUpRight,
  User,
  ShieldCheck,
  RefreshCw,
  Zap,
  Flame,
  MessageSquareQuote,
  TrendingUp,
  Star,
  Activity,
  CalendarDays,
  Target,
  Search,
  Camera,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import MentorshipRequestCard from "@/components/MentorshipRequestCard";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileUpdate, setProfileUpdate] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  
  // New Expert Bomb States
  const [isOpenToRefer, setIsOpenToRefer] = useState(false);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [alumniStats, setAlumniStats] = useState({
    total_high_fives: 0,
    accepted_sessions: 0,
    pending_requests: 0,
    is_live: false
  });
  const [radarStudents, setRadarStudents] = useState([]);
  const [wisdomText, setWisdomText] = useState("");
  const [isPostingWisdom, setIsPostingWisdom] = useState(false);
  
  // Availability Heatmap State (Mocked)
  const [availability, setAvailability] = useState([true, true, false, true, false, true, true]); // 7 days (S, M, T, W, T, F, S)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 1MB for base64 storage in this prototype)
    if (file.size > 1024 * 1024) {
      toast.error("File is too large! Please choose an image under 1MB.");
      return;
    }

    setIsSyncing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        const token = await getToken();
        const response = await axios.post(
          `${API_URL}/api/alumni/update-photo`,
          { picture: base64Image },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === "success") {
          setUser({ ...user, picture: response.data.picture });
          toast.success("Profile photo updated!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update photo");
      } finally {
        setIsSyncing(false);
      }
    };
  };

  const fetchAllData = useCallback(async () => {
    try {
      const token = await getToken();

      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userResponse.data);

      const profileResponse = await axios.get(
        `${API_URL}/api/alumni/${userResponse.data.user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pData = profileResponse.data;
      setProfile(pData);
      setIsOpenToRefer(pData.open_to_refer || false);

      setProfileUpdate({
        company: pData.company || "",
        job_domain: pData.job_domain || "",
        job_title: pData.job_title || "",
        skills: pData.skills?.join(", ") || "",
        bio: pData.bio || "",
        linkedin_url: pData.linkedin_url || "",
      });

      const requestsResponse = await axios.get(`${API_URL}/api/mentorship/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enrichedRequests = requestsResponse.data.map(req => ({
        ...req,
        isPriority: req.topic.toLowerCase().includes('interview') || req.description.toLowerCase().includes('faang') || req.description.length > 100
      }));

      setRequests(enrichedRequests);

      // Fetch personal stats
      const statsResponse = await axios.get(`${API_URL}/api/alumni/stats/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumniStats(statsResponse.data);
      setIsLiveNow(statsResponse.data.is_live);

      // Fetch radar data (Resilient fetch to prevent dashboard crash if backend not yet updated)
      try {
        const radarResponse = await axios.get(`${API_URL}/api/alumni/talent-radar`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRadarStudents(radarResponse.data);
      } catch (err) {
        console.warn("Talent Radar endpoint not available yet. Please push backend changes.");
        setRadarStudents([]); // Fallback to empty
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetchAllData();
  }, [isLoaded, isSignedIn, fetchAllData]);

  const fetchRequests = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/api/mentorship/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const enrichedRequests = response.data.map(req => ({
        ...req,
        isPriority: req.topic.toLowerCase().includes('interview') || req.description.toLowerCase().includes('faang') || req.description.length > 100
      }));
      setRequests(enrichedRequests);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await getToken();

      const updateData = {
        ...profileUpdate,
        skills: profileUpdate.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      await axios.put(
        `${API_URL}/api/alumni/${user.user_id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully!");
      setEditMode(false);
      fetchAllData();

      if (updateData.linkedin_url) {
        handleSyncLinkedIn();
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleToggleLive = async () => {
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/api/alumni/toggle-live`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiveNow(response.data.is_live);
      toast.success(response.data.is_live ? "You are now LIVE!" : "Live session ended");
    } catch (error) {
      toast.error("Failed to toggle live status");
    }
  };

  const handleToggleRefer = async (checked) => {
    setIsOpenToRefer(checked);
    try {
      const token = await getToken();
      await axios.put(
        `${API_URL}/api/alumni/${user.user_id}`,
        { open_to_refer: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(checked ? "Now Open to Referrals" : "Referrals Turned Off");
    } catch (error) {
      setIsOpenToRefer(!checked);
      toast.error("Failed to update referral status");
    }
  };

  const postWisdom = async () => {
    if (!wisdomText.trim()) return;
    setIsPostingWisdom(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API_URL}/api/alumni/wisdom`,
        { wisdom: wisdomText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Wisdom saved to cloud DB!");
      setWisdomText("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save wisdom");
    } finally {
      setIsPostingWisdom(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch {
      toast.error("Logout failed");
    }
  };


  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] dark:bg-slate-950">
        <Zap className="w-10 h-10 text-[#002147] dark:text-slate-200 animate-bounce mb-4" />
        <p className="text-[#002147] dark:text-slate-200 font-bold tracking-widest uppercase text-xs animate-pulse">Synchronizing your dashboard...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted').length;

  // Influence Meter Logic
  const IMPACT_LEVEL_GOAL = 50;
  const currentImpactCount = (alumniStats.accepted_sessions * 5) + (alumniStats.total_high_fives * 2) + alumniStats.pending_requests; 
  const impactProgress = Math.min((currentImpactCount / IMPACT_LEVEL_GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] dark:bg-slate-200 rounded-lg flex items-center justify-center text-white dark:text-[#002147] font-bold text-xl">
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
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase font-bold text-[10px] tracking-widest"
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
                <h2 className="font-serif text-5xl font-extrabold text-[#002147] dark:text-white mb-4 tracking-tight">
                  Hello, {user?.name?.split(" ")[0]}!
                </h2>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#002147] dark:text-slate-500" />
                    {profile?.job_title} at {profile?.company}
                  </span>
                </div>
              </div>

              <Dialog open={editMode} onOpenChange={setEditMode}>
                <DialogTrigger asChild>
                  <Button className="bg-[#002147] dark:bg-slate-200 dark:text-[#002147] hover:bg-[#003366] dark:hover:bg-white text-white rounded-2xl px-8 py-6 h-auto text-lg font-black shadow-2xl shadow-[#002147]/30 dark:shadow-black/60 transition-all hover:scale-[1.05] hover:rotate-1 active:scale-95 group border border-white/10">
                    <Edit className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Master Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#000a12]">
                  <DialogHeader className="p-10 bg-gradient-to-br from-[#002147] via-[#0a3d62] to-[#001529] text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <DialogTitle className="text-3xl font-serif font-black tracking-tighter flex items-center gap-3 relative z-10">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      Expert Persona
                    </DialogTitle>
                    <DialogDescription className="text-white/50 font-bold tracking-tight text-sm mt-2 relative z-10">
                      Sync your professional identity with the campus network.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-10 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                           <Briefcase className="w-3 h-3" /> Company
                        </Label>
                        <Input
                          value={profileUpdate.company}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, company: e.target.value })}
                          className="rounded-2xl border-slate-100 dark:border-white/5 dark:bg-slate-900/50 h-12 font-bold px-4 focus-visible:ring-orange-500/50"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div className="space-y-3 px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                          <User className="w-3 h-3" /> Job Title
                        </Label>
                        <Input
                          value={profileUpdate.job_title}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, job_title: e.target.value })}
                          className="rounded-2xl border-slate-100 dark:border-white/5 dark:bg-slate-900/50 h-12 font-bold px-4 focus-visible:ring-blue-500/50"
                          placeholder="SDE II"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 px-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                          <Linkedin className="w-3 h-3 text-[#0077B5]" /> LinkedIn Professional URL
                        </Label>
                        <Input
                          value={profileUpdate.linkedin_url}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, linkedin_url: e.target.value })}
                          className="rounded-2xl border-slate-100 dark:border-white/5 dark:bg-slate-900/50 h-12 font-bold px-4 focus-visible:ring-[#0077B5]/50"
                          placeholder="linkedin.com/in/username"
                        />
                    </div>

                    <div className="space-y-3 px-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                        <Target className="w-3 h-3 text-orange-500" /> Core Disciplines (Expertise)
                      </Label>
                      <Input
                        value={profileUpdate.skills}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, skills: e.target.value })}
                        className="rounded-2xl border-slate-100 dark:border-white/5 dark:bg-slate-900/50 h-12 font-bold px-4"
                        placeholder="React, AWS, Python..."
                      />
                    </div>

                    <div className="space-y-3 px-1 pb-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                         <MessageSquareQuote className="w-3 h-3 text-blue-500" /> Professional Legacy (Bio)
                      </Label>
                      <Textarea
                        value={profileUpdate.bio}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, bio: e.target.value })}
                        rows={4}
                        className="rounded-[2rem] border-slate-100 dark:border-white/5 dark:bg-slate-900/50 p-6 font-bold text-sm tracking-tight leading-relaxed italic resize-none"
                        placeholder="Share a glimpse of your journey..."
                      />
                    </div>
                  </div>

                  <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5">
                    <Button
                      onClick={handleUpdateProfile}
                      className="w-full bg-[#002147] dark:bg-white dark:text-[#002147] hover:bg-[#003366] dark:hover:bg-slate-200 text-white rounded-[1.5rem] h-14 text-lg font-black shadow-xl shadow-[#002147]/20 dark:shadow-black/40 group relative overflow-hidden transition-all duration-300 active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                         Update Expert Persona
                         <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </section>

        {/* STATS TILES */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
            <StatMiniCard title="New Requests" val={pendingRequests} icon={BookOpen} color="bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-500" />
            <StatMiniCard title="Active Sessions" val={acceptedRequests} icon={Users} color="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500" />
          </div>

          {/* Bomb 2: Improvised Influence Meter */}
          <div className="md:col-span-4 h-full">
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full border-none bg-[#001529] dark:bg-slate-950 text-white shadow-2xl shadow-[#002147]/40 dark:shadow-black/60 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 border border-white/5">
                {/* Dynamic Ambient Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-colors duration-700" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px]" />
                
                <TrendingUp className="absolute top-6 right-6 w-12 h-12 text-white/10 group-hover:text-white/20 group-hover:rotate-12 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Influence Meter</p>
                        <div className="h-0.5 w-8 bg-orange-500 rounded-full" />
                      </div>
                      <Badge className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] uppercase font-black tracking-widest px-3 py-1 backdrop-blur-md">
                        Level 4: Master
                      </Badge>
                    </div>
                    
                    <h3 className="text-3xl font-serif font-black mb-2 tracking-tight">Impact <span className="text-white/40">Score</span></h3>
                    <div className="flex items-center gap-2">
                       <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                       <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Next: Campus Legend</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-6">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-5xl font-black tracking-tighter">{currentImpactCount}</span>
                            <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black">+{alumniStats.total_high_fives} High-Fives</Badge>
                          </div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Total Influence Score</p>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${impactProgress}%` }}
                          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                         <span>Expert</span>
                         <span className="text-white/60">{IMPACT_LEVEL_GOAL - currentImpactCount} till next level</span>
                         <span>Legend</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* EXPERT IDENTITY SIDEBAR (LEFT) */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-28"
            >
              <Card className="border-none bg-white dark:bg-[#001529] shadow-2xl shadow-slate-200 dark:shadow-black/60 overflow-hidden transition-all duration-500 rounded-[3rem] border border-white/5">
                {/* Profile Header Background Mesh */}
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-[#002147] to-[#0a3d62] opacity-10 dark:opacity-40" />
                
                <CardContent className="p-10 relative z-10 pt-16">
                  {/* Hex/Squircle Avatar System */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-8 group">
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 bg-gradient-to-tr from-orange-500 via-blue-500 to-purple-600 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"
                      />
                      
                      <div className="relative w-32 h-32 p-1 bg-gradient-to-br from-white/20 to-transparent rounded-[2.2rem] backdrop-blur-3xl shadow-2xl">
                        <Avatar className="w-full h-full rounded-[2rem] border-2 border-white/10 shadow-inner overflow-hidden">
                          <AvatarImage src={user?.picture} className="object-cover" />
                          <AvatarFallback className="text-3xl font-black text-[#002147] dark:text-white bg-slate-100 dark:bg-slate-800">
                            {getInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Status Ring */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-[#001529] rounded-2xl shadow-lg shadow-green-500/40 flex items-center justify-center">
                           <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        </div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSyncing}
                        className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl text-slate-400 hover:text-blue-500 transition-all hover:scale-110 active:scale-90 border border-slate-100 dark:border-white/5 group"
                        title="Upload Profile Photo"
                      >
                        <Camera className={`w-4 h-4 ${isSyncing ? "animate-pulse text-blue-500" : "group-hover:rotate-12 transition-transform"}`} />
                      </button>
                    </div>

                    <div className="space-y-1 mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <h4 className="text-2xl font-serif font-black text-[#002147] dark:text-white tracking-tighter">
                          {user?.name}
                        </h4>
                        {profile?.is_verified && (
                          <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                        <span>{profile?.job_title}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[#0077B5]">{profile?.company}</span>
                      </div>
                    </div>

                    {/* Improvised Live Now / Open to Refer Toggles */}
                    <div className="w-full space-y-3">
                      <div className={`p-1 rounded-[1.8rem] transition-all duration-500 ${isLiveNow ? 'bg-blue-500/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isLiveNow ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              <Zap className={`w-4 h-4 ${isLiveNow ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="text-left">
                               <p className={`text-[9px] font-black uppercase tracking-widest ${isLiveNow ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Mentorship Live</p>
                               <p className="text-[10px] font-bold text-slate-400 tracking-tighter">Status: {isLiveNow ? "ACTIVE" : "OFFAIR"}</p>
                            </div>
                          </div>
                          <Switch 
                            checked={isLiveNow} 
                            onCheckedChange={handleToggleLive} 
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </div>

                      <div className={`p-1 rounded-[1.8rem] transition-all duration-500 ${isOpenToRefer ? 'bg-green-500/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isOpenToRefer ? 'bg-green-500/20 text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              <Flame className={`w-4 h-4 ${isOpenToRefer ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="text-left">
                               <p className={`text-[9px] font-black uppercase tracking-widest ${isOpenToRefer ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>Hiring Referral</p>
                               <p className="text-[10px] font-bold text-slate-400 tracking-tighter">Accepting resumes</p>
                            </div>
                          </div>
                          <Switch 
                            checked={isOpenToRefer} 
                            onCheckedChange={handleToggleRefer} 
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Availability Circuit */}
                  <div className="mt-10 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#002147] dark:text-blue-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Weekly Office Hours</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-slate-200 dark:border-white/10 dark:text-slate-500 uppercase">Live Sync</Badge>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((day, idx) => (
                        <div key={day} className="flex flex-col items-center gap-2">
                          <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter">{day[0]}</span>
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const newAvail = [...availability];
                              newAvail[idx] = !newAvail[idx];
                              setAvailability(newAvail);
                              toast.success(`Schedule updated for ${day}`);
                            }}
                            className={`w-full h-8 rounded-xl cursor-pointer transition-all duration-300 shadow-sm border ${availability[idx] ? 'bg-blue-500 border-blue-400 shadow-blue-500/40' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-10 bg-slate-100 dark:bg-white/5" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bio & Expertise</p>
                      <Plus className="w-3 h-3 text-slate-300" />
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-bold tracking-tight italic bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                       <span className="relative z-10">{profile?.bio || 'Add a bio to help students find the right mentorship.'}</span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((skill, idx) => (
                        <Badge 
                          key={idx} 
                          className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border-none px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          # {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redesigned Network Pulse Card */}
              <Card className="mt-8 border-none bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2.5rem] shadow-xl shadow-black/40 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Campus Pulse</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                  
                  <div className="space-y-5">
                    <PulseItem icon={Users} label="Batch '24 Peak" val="+12 New Alums" color="text-blue-400" />
                    <PulseItem icon={Star} label="Authority" val="Top 5% Mentor" color="text-yellow-400" />
                    <PulseItem icon={Globe} label="Geo Reach" val="Global Hub" color="text-emerald-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* MAIN CONTENT (RIGHT) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Radar: Talent Scouting AI */}
            <section className="bg-slate-950 rounded-[3rem] p-8 relative overflow-hidden group shadow-2xl border border-blue-500/20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col xl:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="space-y-2 text-center xl:text-left">
                     <Badge className="bg-blue-500/10 text-blue-400 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">AI Matching Active</Badge>
                     <h2 className="text-4xl font-black text-white tracking-tighter leading-none">TALENT<br/>RADAR <span className="text-blue-500">2.0</span></h2>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm text-center xl:text-left">
                     Our AI scan has identified <span className="text-white font-bold">{radarStudents?.length || 0} high-potential students</span> from your department matching your tech domain.
                  </p>
                  <div className="flex gap-4 justify-center xl:justify-start">
                     <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">Initiate Scout</Button>
                     <Button variant="outline" className="border-white/10 text-white/60 hover:text-white rounded-full px-6 font-black text-[10px] uppercase tracking-widest bg-transparent">Settings</Button>
                  </div>
                </div>

                <div className="relative w-72 h-72 flex items-center justify-center">
                   <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-100" />
                   <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-75" />
                   <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-50" />
                   <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-25" />
                   
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left"
                    style={{ background: 'linear-gradient(22deg, rgba(59,130,246,0.2) 0%, transparent 60%)', clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
                   />

                   {radarStudents?.map((s, i) => (
                     <motion.div
                      key={s.user_id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.5 }}
                      className="absolute z-20"
                      style={{ 
                        left: `calc(50% + ${(s.distance * 130) * Math.cos(s.angle * (Math.PI / 180))}px)`,
                        top: `calc(50% + ${(s.distance * 130) * Math.sin(s.angle * (Math.PI / 180))}px)`
                      }}
                     >
                        <div className="group/blip relative">
                          <motion.div 
                            animate={{ scale: [1, 1.5, 1] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-400 absolute -inset-1" 
                          />
                          <Avatar className="w-8 h-8 border-2 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer hover:scale-125 transition-all">
                            <AvatarImage src={s.picture} />
                            <AvatarFallback className="bg-blue-600 text-[8px] text-white font-black">{s.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 bg-slate-900 border border-white/10 rounded-xl p-2 opacity-0 group-hover/blip:opacity-100 transition-all pointer-events-none z-30 shadow-2xl">
                             <p className="text-[10px] font-black text-white truncate">{s.name}</p>
                             <p className="text-[8px] font-bold text-blue-400 uppercase">{s.match_score}% Match</p>
                          </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </div>
            </section>

            {/* Bomb 1: Wisdom Engine Console */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm transition-colors relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 shadow-inner">
                    <MessageSquareQuote className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-serif font-black text-[#002147] dark:text-white tracking-tighter">Wisdom Engine</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Campus Broadcast</p>
                 </div>
              </div>
              <div className="space-y-6 relative z-10">
                <Textarea 
                  value={wisdomText}
                  onChange={(e) => setWisdomText(e.target.value.slice(0, 100))}
                  placeholder="Drop a 1-sentence tip for your campus juniors..."
                  className="rounded-[2.5rem] border-slate-100 dark:border-white/5 dark:bg-slate-950/50 resize-none h-32 p-8 text-base font-bold tracking-tight focus:ring-orange-500/30 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                />
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wisdomText.length} / 100</p>
                   </div>
                   <Button 
                    onClick={postWisdom}
                    disabled={isPostingWisdom || !wisdomText.trim()}
                    className="bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800 text-white rounded-[1.5rem] px-8 h-12 font-black shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.05] active:scale-95 group"
                   >
                     {isPostingWisdom ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                       <span className="flex items-center gap-2">
                          Post to Campus
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       </span>
                     )}
                   </Button>
                </div>
              </div>
            </section>

            {/* REQUESTS LIST */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6 px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-serif font-black text-[#002147] dark:text-white tracking-tighter flex items-center gap-4">
                    Expert <span className="text-slate-300 dark:text-white/20">Inbox</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mentorship Flow</p>
                </div>
                
                {/* Feature 4: Priority Toggle/Badge UI Hint */}
                <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-2xl border border-red-500/20">
                   <Target className="w-4 h-4 text-red-500" />
                   <p className="text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 animate-pulse">Impact Sorting Active</p>
                </div>
              </div>

              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-24 text-center border border-slate-100 dark:border-white/5 shadow-sm transition-colors"
                >
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Mail className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                  </div>
                  <h4 className="text-3xl font-black text-[#002147] dark:text-white mb-3 tracking-tighter">Zen Mode</h4>
                  <p className="text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto font-bold text-sm tracking-tight leading-relaxed italic">
                    All mentorship waves have been caught. Time for a breather.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6 pb-12">
                  <AnimatePresence mode="popLayout">
                    {/* Feature 4: Sort Priority First */}
                    {[...requests].sort((a, b) => (b.isPriority === a.isPriority ? 0 : b.isPriority ? 1 : -1)).map((request, idx) => (
                      <motion.div
                        key={request.request_id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="relative"
                      >
                        {request.isPriority && request.status === "pending" && (
                           <Badge className="absolute -top-3 -right-3 z-10 bg-red-600 text-white border-none text-[9px] font-black shadow-xl shadow-red-600/30 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] ring-4 ring-white dark:ring-slate-950">
                             Priority
                           </Badge>
                        )}
                        <MentorshipRequestCard
                          request={request}
                          userRole="alumni"
                          onUpdate={fetchRequests}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>


            {/* Bomb Extras: Achievement Shelf for Alumni */}
            <section className="pb-12 px-2">
               <div className="flex items-center gap-3 mb-8">
                  <div className="h-0.5 w-6 bg-orange-500 rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Expert Hall of Fame</h3>
               </div>
               <div className="flex flex-wrap gap-6">
                  <ExpertBadge label="First Batch" unlocked={true} icon={Star} desc="Platform Pioneer" />
                  <ExpertBadge label="Verified Expert" unlocked={profile?.is_verified} icon={ShieldCheck} desc="Official Access" />
                  <ExpertBadge label="Lead Impact" unlocked={acceptedRequests >= 5} icon={Flame} desc="5+ Success Sessions" />
               </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-lg" />
             <p>© 2026 AlumConnect Expert Network</p>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-[#002147] dark:hover:text-white transition-colors">Code of Conduct</a>
            <a href="#" className="hover:text-[#002147] dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#002147] dark:hover:text-white transition-colors">Expert Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Internal Components
const StatMiniCard = ({ title, val, icon: Icon, color }) => (
  <Card className="border-none transition-all duration-300 group bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:-translate-y-1 rounded-[2.5rem] border border-slate-50 dark:border-white/5">
    <CardContent className="p-10 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">{title}</p>
        <h3 className="text-5xl font-black text-[#002147] dark:text-white tracking-tighter">{val}</h3>
      </div>
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
    </CardContent>
  </Card>
);

const PulseItem = ({ icon: Icon, label, val, color }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-black/40 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-bold text-white/50">{label}</span>
    </div>
    <span className="text-[11px] font-black text-white uppercase tracking-tighter">{val}</span>
  </div>
);

const ExpertBadge = ({ label, unlocked, icon: Icon, desc }) => (
  <div className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all duration-700 ${unlocked ? 'bg-white dark:bg-slate-900 border-orange-500/30 dark:border-orange-500/20 shadow-xl hover:shadow-orange-500/10' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5 opacity-30 grayscale'}`}>
    <div className={`p-3 rounded-2xl ${unlocked ? 'bg-orange-500/10 text-orange-500 shadow-inner' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-left">
      <p className={`text-[11px] font-black uppercase tracking-widest ${unlocked ? 'text-[#002147] dark:text-white' : 'text-slate-400'}`}>{label}</p>
      <p className="text-[9px] font-bold text-slate-400 italic tracking-tight">{desc}</p>
    </div>
  </div>
);

const Globe = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export default AlumniDashboard;