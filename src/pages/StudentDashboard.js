import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, BookOpen, LogOut, Search } from "lucide-react";
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

  // ✅ useEffect AFTER fetchData
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
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#002147]"></div>
      </div>
    );
  }

  const activeRequests = requests.filter(
    (r) => r.status === "pending"
  ).length;

  const acceptedRequests = requests.filter(
    (r) => r.status === "accepted"
  ).length;

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-serif text-2xl font-bold text-[#002147]">
            AlumConnect
          </h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-600 hover:text-[#002147]"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-serif text-4xl font-bold text-[#002147] mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-lg text-slate-600">
            {user?.department} • {user?.institute_id}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-[#4A6C6F]" />
              <span className="text-3xl font-bold text-[#002147]">
                {activeRequests}
              </span>
            </div>
            <p className="text-slate-600 font-medium">Active Requests</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-[#CFB53B]" />
              <span className="text-3xl font-bold text-[#002147]">
                {acceptedRequests}
              </span>
            </div>
            <p className="text-slate-600 font-medium">
              Accepted Mentorships
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-[#002147]" />
              <span className="text-3xl font-bold text-[#002147]">50+</span>
            </div>
            <p className="text-slate-600 font-medium">
              Available Alumni
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => navigate("/directory")}
            className="bg-[#002147] text-white hover:bg-[#002147]/90 rounded-full px-6 py-6"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Alumni Directory
          </Button>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-semibold text-[#002147] mb-4">
            My Mentorship Requests
          </h3>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-card border border-slate-100">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                No mentorship requests yet
              </p>
              <Button
                onClick={() => navigate("/directory")}
                className="bg-[#002147] text-white hover:bg-[#002147]/90 rounded-full"
              >
                Start Connecting
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <MentorshipRequestCard
                  key={request.request_id}
                  request={request}
                  userRole="student"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
