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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  LogOut,
  Filter,
  Users,
  Briefcase,
  GraduationCap,
  ChevronRight,
  X,
  Buildings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const SkeletonCard = () => (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#002147] tracking-tight">
              AlumConnect
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Back
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleLogout}
              className="bg-[#002147] hover:bg-[#003366] text-white shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-5xl font-extrabold text-[#002147] mb-4 tracking-tight">
              Alumni Directory
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl font-light leading-relaxed">
              Explore your professional network. Connect with mentors, peers, and industry leaders from our verified alumni community.
            </p>
          </motion.div>
        </div>

        {/* FILTERS */}
        <section className="mb-12">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#002147]">
                  <Filter className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold">Search Filters</CardTitle>
                </div>
                {(filters.company || filters.job_domain || filters.graduation_year || filters.skills) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-red-500 text-xs h-8"
                  >
                    <X className="w-3 h-3 mr-1" /> Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Company</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="e.g. Google, Amazon"
                      value={filters.company}
                      onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                      className="pl-9 border-slate-200 focus-visible:ring-[#002147]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Job Domain</label>
                  <Select
                    value={filters.job_domain}
                    onValueChange={(value) => setFilters({ ...filters, job_domain: value })}
                  >
                    <SelectTrigger className="border-slate-200 focus:ring-[#002147]">
                      <SelectValue placeholder="All Domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      <SelectItem value="SDE">Software Engineering</SelectItem>
                      <SelectItem value="PM">Product Management</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Marketing">Marketing & Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Graduation Year</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2022"
                    value={filters.graduation_year}
                    onChange={(e) => setFilters({ ...filters, graduation_year: e.target.value })}
                    className="border-slate-200 focus-visible:ring-[#002147]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Skills</label>
                  <Input
                    placeholder="e.g. React, Python"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                    className="border-slate-200 focus-visible:ring-[#002147]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-end py-4">
              <Button
                onClick={handleSearch}
                className="bg-[#002147] hover:bg-[#003366] text-white rounded-lg px-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Apply Filters
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Alumni Found</h3>
            <p className="text-slate-500 max-w-sm">
              We couldn't find any alumni matching your current search criteria. Try adjusting your filters or clearing them to see all results.
            </p>
            <Button variant="link" onClick={clearFilters} className="mt-4 text-[#002147]">
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {alumni.map((alum, index) => (
                <motion.div
                  key={`${alum.user_id}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group h-full flex flex-col border-slate-200 hover:border-[#002147]/50 hover:shadow-xl hover:shadow-[#002147]/10 transition-all duration-300 bg-white">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
                      <Avatar className="w-14 h-14 border-2 border-slate-50 group-hover:border-[#002147]/20 transition-colors">
                        <AvatarImage src={alum.user?.picture} />
                        <AvatarFallback className="bg-[#002147]/5 text-[#002147] font-bold text-lg">
                          {getInitials(alum.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-xl font-bold text-[#002147] truncate group-hover:text-[#002147]/80 transition-colors">
                          {alum.user?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Class of {alum.graduation_year}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-5">
                      {/* Job Info */}
                      {(alum.job_domain || alum.company) && (
                        <div className="space-y-2.5">
                          {alum.job_domain && (
                            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{alum.job_domain}</span>
                            </div>
                          )}
                          {alum.company && (
                            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                              <div className="w-4 h-4 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-400">@</span>
                              </div>
                              <span>{alum.company}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {alum.skills && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(Array.isArray(alum.skills)
                            ? alum.skills
                            : alum.skills.split(",")
                          ).map((skill, sIdx) => {
                            const trimmedSkill =
                              typeof skill === "string" ? skill.trim() : skill;
                            if (!trimmedSkill) return null;
                            return (
                              <Badge
                                key={sIdx}
                                variant="secondary"
                                className="bg-slate-100 text-slate-600 hover:bg-[#002147] hover:text-white transition-colors cursor-default text-[10px] font-medium py-0 px-2"
                              >
                                {trimmedSkill}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button
                        onClick={() => navigate(`/profile/${alum.user_id}`)}
                        className="w-full bg-white border border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white rounded-xl font-semibold transition-all group-hover:shadow-md"
                      >
                        View Profile
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 AlumConnect. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-[#002147] text-sm transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-[#002147] text-sm transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-[#002147] text-sm transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlumniDirectory;

