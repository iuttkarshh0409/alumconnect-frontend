import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
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

const Industry = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchIndustryData = async () => {
      try {
        const token = await getToken();

        const domainsRes = await axios.get(
          `${API_URL}/api/analytics/industry/domains`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rolesRes = await axios.get(
          `${API_URL}/api/analytics/industry/roles`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDomains(domainsRes.data || []);
        setRoles(rolesRes.data || []);
      } catch (err) {
        console.error("Failed to load industry analytics", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryData();
  }, [isLoaded, isSignedIn]);
  if (loading) {
    return <p className="text-slate-500">Loading industry analytics…</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-[#002147] mb-6">
        Industry
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Domain Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Domain Distribution
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={domains} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="domain"
                type="category"
                width={160}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#002147" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-[#002147] mb-4">
            Role Distribution
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={roles}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" angle={-25} textAnchor="end" height={80} />
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

export default Industry;
