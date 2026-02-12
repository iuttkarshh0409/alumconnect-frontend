import AdminKPIs from "@/components/admin/AdminKPIs";
import AdminHeader from "@/components/admin/AdminHeader";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Overview = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [domainCount, setDomainCount] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchOverviewData = async () => {
      try {
        const token = await getToken();

        const statsRes = await axios.get(
          `${API_URL}/api/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const skillsRes = await axios.get(
          `${API_URL}/api/analytics/skill-distribution`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const trendsRes = await axios.get(
          `${API_URL}/api/analytics/overview/trends`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats(statsRes.data);
        setDomainCount(skillsRes.data?.length || 0);
        setTrendData(trendsRes.data || []);
      } catch (err) {
        console.error("Failed to load overview analytics", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  if (loading) {
    return <p className="text-slate-500">Loading overview analytics…</p>;
  }
  if (loading) {
    return <p className="text-slate-500">Loading overview analytics…</p>;
  }

  return (
    <div>
      <AdminHeader />

      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Overview
      </h2>

      <AdminKPIs stats={stats} />

      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-[#002147] mb-4">
          Alumni Growth Over Time
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#002147"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;
