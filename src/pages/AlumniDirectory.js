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
  Building2,
  Zap,
  Sparkles,
  TrendingUp,
  PieChart,
  Heart,
  Bookmark,
  Send,
  Target,
  MessageSquareQuote,
  ArrowRight,
  Globe,
  MapPin,
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

  // New Expert Operations States
  const [featuredAlumni, setFeaturedAlumni] = useState([]);
  const [heatmapStats, setHeatmapStats] = useState({
    activeMentors: 0,
    topDomain: "Loading...",
    topSkill: "Loading...",
    openRefers: 0
  });

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [locationStats, setLocationStats] = useState([]);

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

      // Feature 3: Calculate Global Footprint (Location Stats)
      const locations = response.data.map(a => a.city || a.country).filter(Boolean);
      const locCounts = locations.reduce((acc, loc) => {
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {});
      const sortedLocs = Object.entries(locCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      setLocationStats(sortedLocs);

      // Feature 2: Fetch Current User Profile once to enable "The Bridge" matching
      if (!currentUserProfile) {
        const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserProfile(profileRes.data);
      }

      // Feature 2: Calculate Heatmap Stats
      const stats = response.data.reduce((acc, alum) => {
        if (alum.is_live) acc.activeMentors++;
        if (alum.open_to_refer) acc.openRefers++;
        return acc;
      }, { activeMentors: 0, openRefers: 0 });

      // Find top domain
      const domains = response.data.map(a => a.job_domain).filter(Boolean);
      const topDomain = domains.sort((a,b) =>
        domains.filter(v => v===a).length - domains.filter(v => v===b).length
      ).pop() || "SDE";

      setHeatmapStats({
        ...stats,
        topDomain,
        topSkill: "React.js" // Mock for now or extract from skills
      });

      // Feature 1: Populate Featured Track
      const featured = response.data.filter(a => a.open_to_refer || a.is_live);
      setFeaturedAlumni(featured.slice(0, 10));

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

  const handleAction = (e, type, alumName) => {
    e.stopPropagation(); // Don't trigger the card's profile navigation
    
    switch(type) {
      case 'save':
        toast.success(`Bookmarked ${alumName.split(' ')[0]} to your network`, {
          icon: <Bookmark className="w-4 h-4 text-blue-500" />
        });
        break;
      case 'kudos':
        toast(`Sent Kudos to ${alumName.split(' ')[0]}! ✨`, {
          icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        });
        break;
      case 'referral':
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 1500)),
          {
            loading: `Drafting referral inquiry for ${alumName}...`,
            success: `Referral inquiry sent to ${alumName}! 🚀`,
            error: 'Failed to initiate request.',
          }
        );
        break;
      default:
        break;
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
              Connect with the Pioneers
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl font-light leading-relaxed">
              Explore your professional network. Connect with mentors, peers, and industry leaders from our verified alumni community.
            </p>

            {/* Feature 3: Global Footprint Ticker */}
            {locationStats.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100/50">
                  <Globe className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Worldwide Clusters</span>
                </div>
                {locationStats.map((loc, i) => (
                  <div key={i} className="flex items-center gap-1.5 group">
                    <MapPin className="w-3 h-3 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    <span className="text-xs font-semibold text-slate-600">{loc.name}</span>
                    <span className="text-[10px] text-slate-400">({loc.count})</span>
                    {i < locationStats.length - 1 && <span className="text-slate-200 ml-1">•</span>}
                  </div>
                ))}
              </motion.div>
            )}
            </motion.div>
        </div>

        {/* FEATURE 2: EXPERT HEATMAP BAR */}
        <section className="mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Active Mentors", value: heatmapStats.activeMentors, icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Top Domain", value: heatmapStats.topDomain, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Hot Skill", value: heatmapStats.topSkill, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Open Refers", value: heatmapStats.openRefers, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" }
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white/60 backdrop-blur-sm shadow-sm`}>
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* FEATURE 1: PRIORITY REFERRAL TRACK (Horizontal Scroll) */}
        {featuredAlumni.length > 0 && (
          <section className="mb-12 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-[#002147]">Priority Referral Track</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-[#002147]">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar scroll-smooth">
              {featuredAlumni.map((alum, i) => (
                <motion.div
                  key={`featured-${alum.user_id}`}
                  whileHover={{ y: -5 }}
                  className="flex-shrink-0 w-72"
                >
                  <Card 
                    className="relative overflow-hidden border-none shadow-lg bg-[#002147] text-white p-5 h-40 flex flex-col justify-between cursor-pointer group"
                    onClick={() => navigate(`/profile/${alum.user_id}`)}
                  >
                    {/* Decorative Elements */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
                    
                    <div className="flex items-start gap-4 z-10">
                      <Avatar className="w-12 h-12 border-2 border-white/20">
                        <AvatarImage src={alum.user?.picture} />
                        <AvatarFallback className="bg-white/10 text-white">
                          {getInitials(alum.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate">{alum.user?.name}</p>
                        <p className="text-xs text-white/60 truncate">{alum.job_title} @ {alum.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between z-10">
                      <Badge className="bg-amber-400/20 text-amber-300 border-none text-[10px]">
                        OPEN TO REFER
                      </Badge>
                      <div className="flex -space-x-2">
                         {/* Mock mutual connections or just decorative */}
                         <div className="w-6 h-6 rounded-full border-2 border-[#002147] bg-blue-400 flex items-center justify-center text-[8px]">DS</div>
                         <div className="w-6 h-6 rounded-full border-2 border-[#002147] bg-green-400 flex items-center justify-center text-[8px]">AK</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

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
                  <Card className="group relative h-full flex flex-col border-slate-200 hover:border-[#002147]/50 hover:shadow-xl hover:shadow-[#002147]/10 transition-all duration-300 bg-white overflow-hidden">
                    {/* Feature 5: Multi-Action Dock (FABs) */}
                    <div className="absolute right-3 top-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                      {[
                        { icon: Bookmark, color: "bg-white text-slate-400 hover:text-blue-500", label: "Save", type: 'save' },
                        { icon: Heart, color: "bg-white text-slate-400 hover:text-rose-500", label: "Kudos", type: 'kudos' },
                        { icon: Send, color: "bg-[#002147] text-white hover:bg-[#003366]", label: "Referral", type: 'referral' }
                      ].map((action, i) => (
                        <button 
                          key={i}
                          onClick={(e) => handleAction(e, action.type, alum.user?.name)}
                          className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${action.color}`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>

                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
                      <Avatar className="w-14 h-14 border-2 border-slate-50 group-hover:border-[#002147]/20 transition-colors">
                        <AvatarImage src={alum.user?.picture} />
                        <AvatarFallback className="bg-[#002147]/5 text-[#002147] font-bold text-lg">
                          {getInitials(alum.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-xl font-bold text-[#002147] truncate group-hover:text-[#002147]/80 transition-colors flex items-center gap-2">
                          {alum.user?.name}
                          {alum.is_live && (
                            <div className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Zap className="w-2 h-2 fill-white" />
                              LIVE
                            </div>
                          )}
                          {/* Feature 2: The Bridge (Department Match) */}
                          {currentUserProfile?.department === alum.department && (
                            <div className="bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Heart className="w-2 h-2 fill-white" />
                              MATCH
                            </div>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Class of {alum.graduation_year}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4">
                      {/* Feature 3: Wisdom Snippet */}
                      {alum.latest_wisdom ? (
                        <div className="relative p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-[#002147]/5 transition-colors">
                          <MessageSquareQuote className="absolute -top-2 -left-2 w-5 h-5 text-[#002147]/20" />
                          <p className="text-xs italic text-slate-600 leading-relaxed line-clamp-2">
                            "{alum.latest_wisdom}"
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {alum.job_domain && (
                            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{alum.job_domain}</span>
                            </div>
                          )}
                          {alum.company && (
                            <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                              <div className="w-4 h-4 flex items-center justify-center text-slate-400 font-bold text-xs">@</div>
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
                          ).slice(0, 3).map((skill, sIdx) => (
                            <Badge
                              key={sIdx}
                              variant="secondary"
                              className="bg-slate-100/50 text-slate-500 text-[9px] font-medium"
                            >
                              {typeof skill === "string" ? skill.trim() : skill}
                            </Badge>
                          ))}
                          {alum.skills.length > 3 && (
                            <span className="text-[9px] text-slate-400">+{alum.skills.length - 3} move</span>
                          )}
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

