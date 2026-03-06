import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileUpdate, setProfileUpdate] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

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
        // Append timestamp to force re-fetch (cache busting)
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

      setProfile(profileResponse.data);

      setProfileUpdate({
        company: profileResponse.data.company || "",
        job_domain: profileResponse.data.job_domain || "",
        job_title: profileResponse.data.job_title || "",
        skills: profileResponse.data.skills?.join(", ") || "",
        bio: profileResponse.data.bio || "",
        linkedin_url: profileResponse.data.linkedin_url || "",
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

      // Proactively sync photo if LinkedIn URL is present
      if (updateData.linkedin_url) {
        handleSyncLinkedIn();
      }
    } catch {
      toast.error("Failed to update profile");
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147] mb-4"></div>
        <p className="text-[#002147] font-medium animate-pulse">Synchronizing your dashboard...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted').length;

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
                <h2 className="font-serif text-5xl font-extrabold text-[#002147] mb-4 tracking-tight">
                  Hello, {user?.name?.split(" ")[0]}!
                </h2>
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {profile?.job_title} at {profile?.company}
                  </span>
                </div>
              </div>

              <Dialog open={editMode} onOpenChange={setEditMode}>
                <DialogTrigger asChild>
                  <Button className="bg-[#002147] hover:bg-[#003366] text-white rounded-xl px-8 py-6 h-auto text-lg font-bold shadow-xl shadow-[#002147]/20 transition-all hover:scale-[1.02] active:scale-[0.98] group">
                    <Edit className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl">
                  <DialogHeader className="p-8 bg-[#002147] text-white">
                    <DialogTitle className="text-2xl font-serif font-bold">Edit Professional Profile</DialogTitle>
                    <DialogDescription className="text-white/60">
                      Keep your professional details updated to help students find the right mentorship.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 overflow-y-auto space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Company</Label>
                        <Input
                          value={profileUpdate.company}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, company: e.target.value })}
                          placeholder="e.g., Google, Microsoft"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Job Title</Label>
                        <Input
                          value={profileUpdate.job_title}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, job_title: e.target.value })}
                          placeholder="e.g., Senior Software Engineer"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Job Domain</Label>
                        <Input
                          value={profileUpdate.job_domain}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, job_domain: e.target.value })}
                          placeholder="e.g., SDE, Product Management"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">LinkedIn URL</Label>
                        <Input
                          value={profileUpdate.linkedin_url}
                          onChange={(e) => setProfileUpdate({ ...profileUpdate, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Skills (comma-separated)</Label>
                      <Input
                        value={profileUpdate.skills}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, skills: e.target.value })}
                        placeholder="e.g., React, Node.js, System Design"
                        className="rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Short Bio</Label>
                      <Textarea
                        value={profileUpdate.bio}
                        onChange={(e) => setProfileUpdate({ ...profileUpdate, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell students how you can help them..."
                        className="rounded-xl border-slate-200 resize-none"
                      />
                    </div>
                  </div>
                  <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl">
                    <Button
                      onClick={handleUpdateProfile}
                      className="w-full bg-[#002147] hover:bg-[#003366] text-white rounded-xl h-12 font-bold shadow-lg shadow-[#002147]/10"
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 hover:border-[#CFB53B]/30 transition-all duration-300 group bg-white shadow-sm hover:shadow-lg">
              <CardContent className="p-8 pb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">New Requests</p>
                  <h3 className="text-4xl font-extrabold text-[#002147]">{pendingRequests}</h3>
                </div>
                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
              </CardContent>
              <div className="px-8 pb-4">
                <p className="text-xs text-slate-500 font-medium italic">Pending review from students</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-200 hover:border-green-200 transition-all duration-300 group bg-white shadow-sm hover:shadow-lg">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Sessions</p>
                  <h3 className="text-4xl font-extrabold text-[#002147]">{acceptedRequests}</h3>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* PROFILE PREVIEW */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden sticky top-28">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-md bg-white ring-2 ring-[#002147]/5">
                      <AvatarImage src={user?.picture} />
                      <AvatarFallback className="text-2xl font-bold text-[#002147] bg-[#002147]/5">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {profile?.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 fill-white" />
                      </div>
                    )}
                    
                    <button
                      onClick={handleSyncLinkedIn}
                      disabled={isSyncing}
                      className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full shadow-sm text-slate-400 hover:text-[#0077B5] transition-all hover:scale-110 active:scale-90"
                      title="Sync LinkedIn Photo"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#0077B5]" : ""}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-[#002147]">{user?.name}</h4>
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077B5] transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium text-sm">{profile?.job_title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-[#002147]/5 text-[#002147] border-none font-bold text-[10px] py-0.5 px-2">
                      Class of {profile?.graduation_year}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-[#002147]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm whitespace-nowrap">{profile?.company}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-[#002147]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm whitespace-nowrap">{profile?.department}</p>
                    </div>
                  </div>

                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.length > 0 ? (
                        profile.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] font-bold text-[#002147] border-slate-200 py-0.5 px-2">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No skills added</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">
                      {profile?.bio || 'Add a bio to tell students how you can help them achieve their career goals.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* REQUESTS LIST */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-serif font-bold text-[#002147] flex items-center gap-3">
                <Mail className="w-6 h-6" />
                Mentorship Inbox
              </h3>
            </div>

            {requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-2xl font-bold text-[#002147] mb-2">Inbox is clean</h4>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  When students reach out for mentorship, their requests will appear here. Consider updating your profile to increase visibility.
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
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          <p>© 2026 AlumConnect Expert Network</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#002147] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#002147] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlumniDashboard;