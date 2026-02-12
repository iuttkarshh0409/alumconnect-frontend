import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  LogOut,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AlumniDirectory = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: "",
    job_domain: "",
    graduation_year: "",
    skills: "",
  });

  /**
   * Stable fetch function (fixes ESLint dependency warning)
   */
  const fetchAlumni = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoading(true);

    try {
      const token = await getToken();

      const params = new URLSearchParams();
      if (filters.company) params.append("company", filters.company);
      if (filters.job_domain && filters.job_domain !== "all")
        params.append("job_domain", filters.job_domain);
      if (filters.graduation_year)
        params.append("graduation_year", filters.graduation_year);
      if (filters.skills) params.append("skills", filters.skills);

      const response = await axios.get(
        `${API_URL}/api/alumni?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlumni(response.data);
    } catch (error) {
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  }, [filters, getToken, isLoaded, isSignedIn]);

  /**
   * Load on mount + when auth becomes ready
   */
  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const handleSearch = () => {
    fetchAlumni();
  };

  const clearFilters = () => {
    setFilters({
      company: "",
      job_domain: "",
      graduation_year: "",
      skills: "",
    });
  };

  const handleLogout = async () => {
    try {
      const token = await getToken();

      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-serif text-2xl font-bold text-[#002147]">
            AlumConnect
          </h1>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-[#002147]"
            >
              Back
            </Button>

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
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-serif text-4xl font-bold text-[#002147] mb-2">
          Alumni Directory
        </h2>
        <p className="text-lg text-slate-600 mb-8">
          Discover and connect with verified alumni
        </p>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#002147]" />
            <h3 className="text-lg font-semibold text-[#002147]">Filters</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Company"
              value={filters.company}
              onChange={(e) =>
                setFilters({ ...filters, company: e.target.value })
              }
            />

            <Select
              value={filters.job_domain}
              onValueChange={(value) =>
                setFilters({ ...filters, job_domain: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Job Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="SDE">Software Engineer</SelectItem>
                <SelectItem value="PM">Product Manager</SelectItem>
                <SelectItem value="HR">Human Resources</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Graduation Year"
              value={filters.graduation_year}
              onChange={(e) =>
                setFilters({ ...filters, graduation_year: e.target.value })
              }
            />

            <Input
              placeholder="Skills"
              value={filters.skills}
              onChange={(e) =>
                setFilters({ ...filters, skills: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="bg-[#002147] text-white rounded-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Apply
            </Button>

            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#002147]" />
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            No alumni found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alum, index) => (
              <motion.div
                key={alum.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border shadow-card p-6"
              >
                <h3 className="text-lg font-semibold text-[#002147]">
                  {alum.user?.name}
                </h3>
                <p className="text-sm text-slate-600">
                  Class of {alum.graduation_year}
                </p>

                <Button
                  onClick={() => navigate(`/profile/${alum.user_id}`)}
                  className="mt-4 w-full bg-[#002147] text-white rounded-full"
                >
                  View Profile
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
