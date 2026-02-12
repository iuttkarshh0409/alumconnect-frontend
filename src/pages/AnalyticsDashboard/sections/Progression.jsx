import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const COLORS = ["#002147", "#4A6C6F"];

const Progression = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchProgressionData = async () => {
      try {
        const token = await getToken();

        const res = await axios.get(
          `${API_URL}/api/analytics/progression/levels`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setLevels(res.data);
      } catch (err) {
        console.error("Failed to load progression analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressionData();
  }, [isLoaded, isSignedIn, getToken]);

  if (loading) {
    return <p className="text-slate-500">Loading progression analytics…</p>;
  }

  // Derive seniority split safely
  const juniorCount = levels
    .filter((l) => l.level === "Entry" || l.level === "Mid")
    .reduce((sum, l) => sum + (l.count || 0), 0);

  const seniorCount = levels
    .filter((l) => l.level === "Senior" || l.level === "Leadership")
    .reduce((sum, l) => sum + (l.count || 0), 0);

  const senioritySplit = [
    { group: "Junior", count: juniorCount },
    { group: "Senior", count: seniorCount },
  ];

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Progression
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Career Level Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Career Level Distribution
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={levels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#002147" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seniority Split */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Seniority Split
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={senioritySplit}
                dataKey="count"
                nameKey="group"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
              >
                {senioritySplit.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Progression;
