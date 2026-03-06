import React, { useState, useEffect, useCallback } from "react";
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
  Award,
  Activity,
  CalendarDays,
  Target,
  Search,
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
  CardHeader,
  CardTitle,
  CardDescription,
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

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileUpdate, setProfileUpdate] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  
  // New Expert Bomb States
  const [isOpenToRefer, setIsOpenToRefer] = useState(false);
  const [wisdomText, setWisdomText] = useState("");
  const [isPostingWisdom, setIsPostingWisdom] = useState(false);
  
  // Availability Heatmap State (Mocked)
  const [availability, setAvailability] = useState([true, true, false, true, false, true, true]); // 7 days (S, M, T, W, T, F, S)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSyncLinkedIn = async () => {
    setIsSyncing(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/api/alumni/sync-linkedin-photo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        const updatedPicture = `${response.data.picture}?t=${Date.now()}`;
        setUser({ ...user, picture: updatedPicture });
        toast.success("Profile photo synced with LinkedIn!");
      } else {
        toast.info(response.data.message || "No new photo found on LinkedIn.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync LinkedIn photo");
    } finally {
      setIsSyncing(false);
    }
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

      const requestsResponse = await axios.get(
        `${API_URL}/api/mentorship/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Inject logic for Feature 4: Priority Sorting (Mocked based on description/topic)
      const enrichedRequests = requestsResponse.data.map(req => ({
        ...req,
        isPriority: req.topic.toLowerCase().includes('interview') || req.description.toLowerCase().includes('faang') || req.description.length > 100
      }));

      setRequests(enrichedRequests);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile data");
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
      toast.success("Wisdom saved as file! Admins will review it soon.");
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
  const IMPACT_LEVEL_GOAL = 10;
  const currentImpactCount = acceptedRequests * 2 + pendingRequests; 
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
                  <Button className="bg-[#002147] dark:bg-slate-200 dark:text-[#002147] hover:bg-[#003366] dark:hover:bg-white text-white rounded-xl px-8 py-6 h-auto text-lg font-bold shadow-xl shadow-[#002147]/20 dark:shadow-black/20 transition-all hover:scale-[1.02] active:scale-[0.98] group">
                    <Edit className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl dark:bg-slate-900">
                  <DialogHeader className="p-8 bg-[#002147] dark:bg-slate-950 text-white">
                    <DialogTitle className="text-2xl font-serif font-bold">Edit Professional Profile</DialogTitle>
                    <DialogDescription className="text-white/60">
                      Keep your professional details updated to help students find the right mentorship.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 overflow-y-auto space-y-6 flex-1 dark:bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Company</Label>
                        <Input
                          value={profileUpdate.company}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, company: e.target.value })}
                          className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Job Title</Label>
                        <Input
                          value={profileUpdate.job_title}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, job_title: e.target.value })}
                          className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">LinkedIn URL</Label>
                        <Input
                          value={profileUpdate.linkedin_url}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, linkedin_url: e.target.value })}
                          className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                        />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Skills (comma-separated)</Label>
                      <Input
                        value={profileUpdate.skills}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, skills: e.target.value })}
                        className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Short Bio</Label>
                      <Textarea
                        value={profileUpdate.bio}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, bio: e.target.value })}
                        rows={4}
                        className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 resize-none"
                      />
                    </div>
                  </div>
                  <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
                    <Button
                      onClick={handleUpdateProfile}
                      className="w-full bg-[#002147] dark:bg-slate-200 dark:text-[#002147] hover:bg-[#003366] dark:hover:bg-white text-white rounded-xl h-12 font-bold shadow-lg shadow-[#002147]/10"
                    >
                      Save Professional Profile
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
                            <span className="text-5xl font-black tracking-tighter">{currentImpactCount}k</span>
                            <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black">+12%</Badge>
                          </div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Total Influence Points</p>
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
                         <span className="text-white/60">{100 - impactProgress}% to Level 5</span>
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
          {/* PROFILE CARD & SIDEBAR (LEFT) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden sticky top-28 transition-colors">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-24 h-24 border-4 border-slate-50 dark:border-slate-800 shadow-md bg-white dark:bg-slate-950 ring-2 ring-[#002147]/5">
                      <AvatarImage src={user?.picture} />
                      <AvatarFallback className="text-2xl font-bold text-[#002147] dark:text-slate-200 bg-[#002147]/5 dark:bg-slate-800">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {profile?.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900">
                        <CheckCircle className="w-5 h-5 text-green-500 fill-white dark:fill-slate-900" />
                      </div>
                    )}
                    
                    <button
                      onClick={handleSyncLinkedIn}
                      disabled={isSyncing}
                      className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm text-slate-400 hover:text-[#0077B5] transition-all hover:scale-110 active:scale-90"
                      title="Sync LinkedIn Photo"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#0077B5]" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold text-[#002147] dark:text-white">{user?.name}</h4>
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077B5] transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-4">{profile?.job_title}</p>
                  
                  {/* Bomb 3: Open to Refer Toggle */}
                  <div className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${isOpenToRefer ? 'bg-green-50/50 dark:bg-green-950/20 border-green-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <Flame className={`w-5 h-5 ${isOpenToRefer ? 'text-green-500 animate-pulse' : 'text-slate-400'}`} />
                      <div className="text-left">
                         <p className={`text-[10px] font-black uppercase tracking-widest ${isOpenToRefer ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>Open to Refer</p>
                         <p className="text-[9px] font-bold text-slate-400 italic">Visible at {profile?.company}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={isOpenToRefer} 
                      onCheckedChange={handleToggleRefer} 
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                {/* Feature 2: Availability Heatmap */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-[#002147] dark:text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expert Availability</p>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {days.map((day, idx) => (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{day[0]}</span>
                        <div 
                          onClick={() => {
                            const newAvail = [...availability];
                            newAvail[idx] = !newAvail[idx];
                            setAvailability(newAvail);
                            toast.success(`Updated availability for ${day}`);
                          }}
                          className={`w-full h-6 rounded-md cursor-pointer transition-all duration-300 hover:scale-110 shadow-sm ${availability[idx] ? 'bg-green-500 shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-800'}`} 
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-slate-400 italic font-bold text-center mt-1">Tap to toggle your weekly office hours</p>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-[#002147] dark:text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm py-1 whitespace-nowrap">{profile?.company}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-[#002147] dark:text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm py-1 whitespace-nowrap">{profile?.department}</p>
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-bold text-[#002147] dark:text-slate-300 border-slate-200 dark:border-slate-800 py-0.5 px-2 bg-white dark:bg-slate-950 shadow-sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No skills added</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-4 font-medium tracking-tight">
                    {profile?.bio || 'Add a bio to help students find the right mentorship.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Network Pulse Card */}
            <Card className="border-none bg-slate-50 dark:bg-slate-900 p-6 rounded-[1.5rem] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Network Pulse</p>
              </div>
              <div className="space-y-4">
                <PulseItem icon={Users} label="Batch '20 Active" val="+4 Expert Joins" color="text-blue-500" />
                <PulseItem icon={Star} label="Rank" val="#2 in CS Dept" color="text-yellow-500" />
                <PulseItem icon={Globe} label="Geo Reach" val="5 Cities" color="text-green-500" />
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT (RIGHT) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Bomb 1: Wisdom Engine Console */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600">
                    <MessageSquareQuote className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-serif font-black text-[#002147] dark:text-white tracking-tight">Wisdom Engine</h3>
              </div>
              <div className="space-y-4">
                <Textarea 
                  value={wisdomText}
                  onChange={(e) => setWisdomText(e.target.value.slice(0, 100))}
                  placeholder="Drop a 1-sentence tip for your campus juniors..."
                  className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 resize-none h-24 p-5 text-sm font-medium focus:ring-[#002147] transition-all"
                />
                <div className="flex items-center justify-between px-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{wisdomText.length}/100 characters</p>
                   <Button 
                    onClick={postWisdom}
                    disabled={isPostingWisdom || !wisdomText.trim()}
                    className="bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800 text-white rounded-xl px-6 font-bold shadow-lg shadow-orange-600/20"
                   >
                     {isPostingWisdom ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Post to Campus"}
                   </Button>
                </div>
              </div>
            </section>

            {/* REQUESTS LIST */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-2xl font-serif font-bold text-[#002147] dark:text-white flex items-center gap-3 tracking-tight">
                  <Mail className="w-6 h-6 opacity-40" />
                  Mentorship Inbox
                </h3>
                
                {/* Feature 4: Priority Toggle/Badge UI Hint */}
                <div className="flex items-center gap-2">
                   <Target className="w-3.5 h-3.5 text-red-500" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">High Impact Focus ON</p>
                </div>
              </div>

              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900/50 rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm transition-colors"
                >
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#002147] dark:text-white mb-2">Inbox is clean</h4>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                    When students reach out for mentorship, their requests will appear here.
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
                           <Badge className="absolute -top-2 -right-2 z-10 bg-red-500 text-white border-none text-[8px] font-black shadow-lg shadow-red-500/20 px-2 py-1 uppercase tracking-widest ring-4 ring-white dark:ring-slate-950">
                             Priority Reach
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
            <section className="pb-12">
               <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Expert Achievements</h3>
               </div>
               <div className="flex flex-wrap gap-4">
                  <ExpertBadge label="First Batch" unlocked={true} icon={Star} desc="Platform Pioneer" />
                  <ExpertBadge label="Verified Icon" unlocked={profile?.is_verified} icon={ShieldCheck} desc="Official Professional" />
                  <ExpertBadge label="Influencer" unlocked={acceptedRequests >= 5} icon={Flame} desc="5+ Mentorship Sets" />
               </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">
          <p>© 2026 AlumConnect Expert Network</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#002147] dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#002147] dark:hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Internal Components
const StatMiniCard = ({ title, val, icon: Icon, color }) => (
  <Card className="border-none transition-all duration-300 group bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-800">
    <CardContent className="p-8 flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-extrabold text-[#002147] dark:text-white">{val}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
    </CardContent>
  </Card>
);

const PulseItem = ({ icon: Icon, label, val, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
    </div>
    <span className="text-[10px] font-black text-[#002147] dark:text-white uppercase tracking-tighter">{val}</span>
  </div>
);

const ExpertBadge = ({ label, unlocked, icon: Icon, desc }) => (
  <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-500 ${unlocked ? 'bg-white dark:bg-slate-900 border-orange-500/30 dark:border-orange-500/20 shadow-lg' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-40 grayscale'}`}>
    <div className={`p-2 rounded-xl ${unlocked ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${unlocked ? 'text-[#002147] dark:text-white' : 'text-slate-400'}`}>{label}</p>
      <p className="text-[9px] font-bold text-slate-400 italic">{desc}</p>
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
    strokeWidth="2" 
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