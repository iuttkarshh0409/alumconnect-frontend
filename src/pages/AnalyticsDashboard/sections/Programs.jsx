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
} from "recharts";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Programs = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [programCounts, setProgramCounts] = useState([]);
  const [employmentRates, setEmploymentRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchProgramsData = async () => {
      try {
        const token = await getToken();

        const countRes = await axios.get(
          `${API_URL}/api/analytics/programs/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const rateRes = await axios.get(
          `${API_URL}/api/analytics/programs/employment-rate`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProgramCounts(countRes.data || []);
        setEmploymentRates(rateRes.data || []);
      } catch (err) {
        console.error("Failed to load programs analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramsData();
  }, [isLoaded, isSignedIn]);

  if (loading) {
    return <p className="text-slate-500">Loading programs analytics…</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Programs
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Alumni Count by Program */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Alumni Count by Program
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={programCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#002147" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employment Rate by Program */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Employment Rate by Program (%)
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={employmentRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#002147" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Programs;
