import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, BookOpen, LogOut, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  // 🔥 DEFINE FIRST
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

  // ✅ useEffect AFTER definition
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
    } catch {
      toast.error("Failed to update profile");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#002147]"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const acceptedRequests = requests.filter(r => r.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="font-serif text-2xl font-bold text-[#002147]">AlumConnect</h1>
          <Button
            data-testid="logout-btn"
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-600 hover:text-[#002147]"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div data-testid="alumni-dashboard" className="mb-8">
          <h2 className="font-serif text-4xl font-bold text-[#002147] mb-2">Welcome, {user?.name}!</h2>
          <p className="text-lg text-slate-600">{profile?.company} • {profile?.job_title}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div data-testid="stat-card-pending-requests" className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-[#CFB53B]" strokeWidth={1.5} />
              <span className="text-3xl font-bold text-[#002147]">{pendingRequests}</span>
            </div>
            <p className="text-slate-600 font-medium">Pending Requests</p>
          </div>

          <div data-testid="stat-card-active-mentorships" className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-[#4A6C6F]" strokeWidth={1.5} />
              <span className="text-3xl font-bold text-[#002147]">{acceptedRequests}</span>
            </div>
            <p className="text-slate-600 font-medium">Active Mentorships</p>
          </div>

          <div className="bg-gradient-to-br from-[#002147] to-[#0F3057] rounded-xl p-6 shadow-card text-white">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8" strokeWidth={1.5} />
              <span className="text-3xl font-bold">{profile?.is_verified ? '✓' : '⏳'}</span>
            </div>
            <p className="font-medium">{profile?.is_verified ? 'Verified Alumni' : 'Pending Verification'}</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-serif font-semibold text-[#002147]">My Profile</h3>
            <Dialog open={editMode} onOpenChange={setEditMode}>
              <DialogTrigger asChild>
                <Button data-testid="edit-profile-btn" variant="outline" className="rounded-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Company</Label>
                    <Input
                      data-testid="edit-company-input"
                      value={profileUpdate.company}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, company: e.target.value })}
                      placeholder="e.g., Google"
                    />
                  </div>
                  <div>
                    <Label>Job Domain</Label>
                    <Input
                      data-testid="edit-job-domain-input"
                      value={profileUpdate.job_domain}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, job_domain: e.target.value })}
                      placeholder="e.g., SDE, PM, HR"
                    />
                  </div>
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      data-testid="edit-job-title-input"
                      value={profileUpdate.job_title}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, job_title: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label>Skills (comma-separated)</Label>
                    <Input
                      data-testid="edit-skills-input"
                      value={profileUpdate.skills}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, skills: e.target.value })}
                      placeholder="e.g., Python, JavaScript, React"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      data-testid="edit-linkedin-input"
                      value={profileUpdate.linkedin_url}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      data-testid="edit-bio-textarea"
                      value={profileUpdate.bio}
                      onChange={(e) => setProfileUpdate({ ...profileUpdate, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button
                    data-testid="save-profile-btn"
                    onClick={handleUpdateProfile}
                    className="w-full bg-[#002147] text-white hover:bg-[#002147]/90 rounded-full"
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Company</p>
              <p className="text-lg font-medium text-[#002147]">{profile?.company || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Job Title</p>
              <p className="text-lg font-medium text-[#002147]">{profile?.job_title || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Job Domain</p>
              <p className="text-lg font-medium text-[#002147]">{profile?.job_domain || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Graduation Year</p>
              <p className="text-lg font-medium text-[#002147]">{profile?.graduation_year}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500 mb-1">Skills</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.skills?.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="bg-[#4A6C6F]/10 text-[#4A6C6F] px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No skills added</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-500 mb-1">Bio</p>
              <p className="text-slate-700 leading-relaxed">{profile?.bio || 'No bio added'}</p>
            </div>
          </div>
        </div>

        {/* Mentorship Requests */}
        <div data-testid="mentorship-requests-section">
          <h3 className="text-2xl font-serif font-semibold text-[#002147] mb-4">Mentorship Requests</h3>
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-card border border-slate-100">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No mentorship requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <MentorshipRequestCard
                  key={request.request_id}
                  request={request}
                  userRole="alumni"
                  onUpdate={fetchRequests}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;