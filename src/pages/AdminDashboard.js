import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminKPIs from "@/components/admin/AdminKPIs";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();

  const [stats, setStats] = useState(null);
  const [topEmployers, setTopEmployers] = useState([]);
  const [skillDistribution, setSkillDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Define first
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = await getToken();

      const statsRes = await axios.get(
        `${API_URL}/api/admin/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsRes.data);

      const employersRes = await axios.get(
        `${API_URL}/api/analytics/top-employers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopEmployers(employersRes.data);

      const skillsRes = await axios.get(
        `${API_URL}/api/analytics/skill-distribution`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkillDistribution(skillsRes.data.slice(0, 10));

    } catch (err) {
      console.error(err);
      toast.error("Unauthorized or failed to load admin dashboard");
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  // ✅ Effect AFTER function
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/", { replace: true });
      return;
    }

    fetchDashboardData();
  }, [isLoaded, isSignedIn, fetchDashboardData, navigate]);

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#002147]" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <AdminHeader onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-serif text-4xl font-bold text-[#002147] mb-2">
          Admin Dashboard
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Platform Overview & Analytics
        </p>

        <AdminKPIs stats={stats} />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="text-xl font-serif font-semibold text-[#002147] mb-4">
              Top 10 Employers
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEmployers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="company"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#002147" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="text-xl font-serif font-semibold text-[#002147] mb-4">
              Top Skills
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="skill"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4A6C6F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
