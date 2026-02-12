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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  Linkedin,
  Send,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#002147]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">Profile not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-600 hover:text-[#002147]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#002147] to-[#0F3057] p-8 text-white">
            <div className="flex items-start gap-6">
              <img
                src={
                  profile.user?.picture ||
                  "https://via.placeholder.com/120"
                }
                alt={profile.user?.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="font-serif text-3xl font-bold mb-2">
                  {profile.user?.name}
                </h1>
                <p className="text-lg text-white/90">
                  {profile.job_title || "Alumni"}
                </p>
                <p className="text-white/80">
                  {profile.company || "Company not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#4A6C6F]" />
                <div>
                  <p className="text-sm text-slate-500">Job Domain</p>
                  <p className="font-medium">
                    {profile.job_domain || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#4A6C6F]" />
                <div>
                  <p className="text-sm text-slate-500">Graduation Year</p>
                  <p className="font-medium">
                    {profile.graduation_year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#4A6C6F]" />
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="font-medium">
                    {profile.department}
                  </p>
                </div>
              </div>

              {profile.linkedin_url && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-[#4A6C6F]" />
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#002147] hover:underline font-medium"
                  >
                    View LinkedIn
                  </a>
                </div>
              )}
            </div>

            {currentUser?.role === "student" && (
              <Dialog
                open={showRequestDialog}
                onOpenChange={setShowRequestDialog}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-[#002147] text-white rounded-full py-6 text-lg">
                    <Send className="w-5 h-5 mr-2" />
                    Request Mentorship
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Request Mentorship from {profile.user?.name}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <Select
                      value={requestData.topic}
                      onValueChange={(value) =>
                        setRequestData({ ...requestData, topic: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mock Interview">
                          Mock Interview
                        </SelectItem>
                        <SelectItem value="Resume Review">
                          Resume Review
                        </SelectItem>
                        <SelectItem value="Career Guidance">
                          Career Guidance
                        </SelectItem>
                        <SelectItem value="Technical Discussion">
                          Technical Discussion
                        </SelectItem>
                        <SelectItem value="Project Feedback">
                          Project Feedback
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Textarea
                      value={requestData.description}
                      onChange={(e) =>
                        setRequestData({
                          ...requestData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what you'd like help with..."
                    />

                    <Button
                      onClick={handleSendRequest}
                      disabled={
                        !requestData.topic || !requestData.description
                      }
                      className="w-full bg-[#002147] text-white rounded-full"
                    >
                      Send Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
