import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
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

const Trends = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [growthTrends, setGrowthTrends] = useState([]);
  const [employmentTrends, setEmploymentTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchTrendsData = async () => {
      try {
        const token = await getToken();

        const growthRes = await axios.get(
          `${API_URL}/api/analytics/overview/trends`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const employmentRes = await axios.get(
          `${API_URL}/api/analytics/trends/employment`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGrowthTrends(growthRes.data);
        setEmploymentTrends(employmentRes.data);
      } catch (err) {
        console.error("Failed to load trends analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, [isLoaded, isSignedIn, getToken]);

  if (loading) {
    return <p className="text-slate-500">Loading trends analytics…</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Trends
      </h2>

      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Alumni Growth Over Time
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={growthTrends}>
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

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Employment Trend Over Time
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={employmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="employed"
                stroke="#002147"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Trends;
