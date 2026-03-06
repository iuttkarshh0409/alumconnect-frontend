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

      setRequests(requestsResponse.data);
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
      setRequests(response.data);
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
    // Mimicking a backend post for now - would normally hit an endpoint
    setTimeout(() => {
      setIsPostingWisdom(false);
      setWisdomText("");
      toast.success("Wisdom posted! Your tip is now live on Student Dashboards.");
    }, 1500);
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

          {/* Bomb 2: Influence Meter */}
          <div className="md:col-span-4 h-full">
             <Card className="h-full border-none bg-gradient-to-br from-[#002147] to-[#0F3057] dark:from-slate-900 dark:to-slate-950 text-white shadow-xl shadow-[#002147]/20 dark:shadow-black/50 p-8 rounded-[2rem] relative overflow-hidden group">
               <TrendingUp className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-125 transition-transform duration-700" />
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Influence Meter</p>
                      <Badge className="bg-white/10 text-white border-none text-[10px] uppercase font-bold tracking-tighter">Level 4: Master</Badge>
                    </div>
                    <h3 className="text-2xl font-serif font-black mb-1">Impact Score</h3>
                    <p className="text-xs text-white/40 mb-4 italic">Next rank: Campus Legend</p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-3xl font-black">{currentImpactCount}k</span>
                       <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Points</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${impactProgress}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full"
                      />
                    </div>
                  </div>
               </div>
             </Card>
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

export default AlumniDashboard;