import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ["#002147", "#4A6C6F", "#CFB53B"];

const Employment = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [statusData, setStatusData] = useState([]);
  const [topEmployers, setTopEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchEmploymentData = async () => {
      try {
        const token = await getToken();

        const statusRes = await axios.get(
          `${API_URL}/api/analytics/employment/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const employersRes = await axios.get(
          `${API_URL}/api/analytics/top-employers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatusData(statusRes.data || []);
        setTopEmployers(employersRes.data || []);
      } catch (err) {
        console.error("Failed to load employment analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmploymentData();
  }, [isLoaded, isSignedIn]);
  if (loading) {
    return <p className="text-slate-500">Loading employment analytics…</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Employment
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employment Status */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Employment Status
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Employers */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Top Hiring Companies
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEmployers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company" angle={-30} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#002147" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Employment;
