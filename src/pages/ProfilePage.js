import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  Linkedin,
  Send,
  Building,
  GraduationCap,
  ExternalLink,
  MessageCircle,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    topic: "",
    description: "",
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchData = async () => {
      try {
        const token = await getToken();

        const [profileRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/api/alumni/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileRes.data);
        setCurrentUser(userRes.data);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isLoaded, isSignedIn, getToken]);

  const handleSendRequest = async () => {
    try {
      const token = await getToken();

      await axios.post(
        `${API_URL}/api/mentorship/requests`,
        {
          mentor_id: userId,
          topic: requestData.topic,
          description: requestData.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Mentorship request sent successfully!");
      setShowRequestDialog(false);
      setRequestData({ topic: "", description: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to send request"
      );
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
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002147]" />
          <p className="text-[#002147] font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-[#002147] mb-2">Profile Not Found</h2>
          <p className="text-slate-500 mb-6">The alumni profile you're looking for doesn't exist or is unavailable.</p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#002147] hover:bg-[#003366] text-white rounded-xl px-8"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-600 hover:text-[#002147]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="h-32 bg-gradient-to-r from-[#002147] via-[#0F3057] to-[#002147]" />
            <CardContent className="px-8 pb-8">
              <div className="relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 -mt-12 mb-8">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl bg-white">
                  <AvatarImage src={profile.user?.picture} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-[#002147] text-3xl font-bold">
                    {getInitials(profile.user?.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
                  <h1 className="font-serif text-3xl font-extrabold text-[#002147] tracking-tight mb-1">
                    {profile.user?.name}
                  </h1>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center text-slate-500">
                    <Badge variant="secondary" className="bg-[#002147]/5 text-[#002147] border-none font-medium">
                      {profile.job_title || "Alumni"}
                    </Badge>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Building className="w-3.5 h-3.5" />
                      {profile.company || "Company not specified"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 sm:mt-0">
                  {profile.linkedin_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-slate-200 text-[#0077B5] hover:bg-[#0077B5]/5 hover:border-[#0077B5]/30 rounded-xl"
                    >
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-100 mb-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Details</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#002147]">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Domain</p>
                        <p className="font-bold text-slate-700">{profile.job_domain || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#002147]">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                        <p className="font-bold text-slate-700">{profile.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Background</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#002147]">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Graduation Year</p>
                        <p className="font-bold text-slate-700">{profile.graduation_year}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#002147]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</p>
                        <p className="font-bold text-green-600 flex items-center gap-1.5">
                          Verified Alumni
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {currentUser?.role === "student" && (
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 bg-[#002147] hover:bg-[#003366] text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-[#002147]/10 group transition-all">
                        <MessageCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Request Mentorship
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-bold text-[#002147]">
                          Mentorship Request
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                          Send a request for mentorship to {profile.user?.name}. Be specific about what you'd like to achieve.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Discussion Topic</Label>
                          <Select
                            value={requestData.topic}
                            onValueChange={(value) =>
                              setRequestData({ ...requestData, topic: value })
                            }
                          >
                            <SelectTrigger className="rounded-xl border-slate-200">
                              <SelectValue placeholder="What would you like to discuss?" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Mock Interview">Mock Interview</SelectItem>
                              <SelectItem value="Resume Review">Resume Review</SelectItem>
                              <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                              <SelectItem value="Technical Discussion">Technical Discussion</SelectItem>
                              <SelectItem value="Project Feedback">Project Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Your Message</Label>
                          <Textarea
                            value={requestData.description}
                            onChange={(e) =>
                              setRequestData({
                                ...requestData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Write a brief note about why you're reaching out..."
                            className="rounded-xl border-slate-200 min-h-[120px] resize-none"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleSendRequest}
                          disabled={!requestData.topic || !requestData.description}
                          className="w-full bg-[#002147] hover:bg-[#003366] text-white rounded-xl h-12 font-bold transition-all"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Placeholder for Request Referral */}
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 text-[#002147] hover:bg-[#002147] hover:text-white rounded-xl py-6 text-lg font-bold transition-all group shadow-sm"
                    onClick={() => toast.info("Referral requests coming soon!")}
                  >
                    Request Referral
                    <ArrowUpRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#002147] group-hover:text-white" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
