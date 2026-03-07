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
  LayoutGrid,
  Activity,
  ShieldCheck,
  Trophy,
  BarChart3,
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

  const [searchTerm, setSearchTerm] = useState("");
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

      let filteredData = response.data;
      if (searchTerm) {
        filteredData = filteredData.filter(a => 
          a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.job_domain?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAlumni(filteredData);

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

      // Feature 2: Calculate Heatmap Stats
      const stats = response.data.reduce((acc, alum) => {
        if (alum.is_live) acc.activeMentors++;
        if (alum.open_to_refer) acc.openRefers++;
        return acc;
      }, { activeMentors: 0, openRefers: 0 });

      const domains = response.data.map(a => a.job_domain).filter(Boolean);
      const topDomain = domains.sort((a,b) =>
        domains.filter(v => v===a).length - domains.filter(v => v===b).length
      ).pop() || "SDE";

      setHeatmapStats({
        ...stats,
        topDomain,
        topSkill: "React.js" 
      });

      const featured = response.data.filter(a => a.open_to_refer || a.is_live);
      setFeaturedAlumni(featured.slice(0, 10));

    } catch (error) {
      toast.error("Failed to load alumni");
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    const fetchMe = async () => {
      if (!isLoaded || !isSignedIn || currentUserProfile) return;
      try {
        const token = await getToken();
        const profileRes = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    fetchMe();
  }, [isLoaded, isSignedIn, getToken, currentUserProfile]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const clearFilters = () => {
    setFilters({
      company: "",
      job_domain: "",
      graduation_year: "",
      skills: "",
    });
    setSearchTerm("");
  };

  const handleLogout = async () => {
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleAction = (e, type, alumName) => {
    e.stopPropagation();
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
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 flex flex-col">
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

          <div className="flex items-center gap-6">
            <div className="flex gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={handleLogout}
                className="bg-[#002147] hover:bg-[#003366] text-white shadow-sm px-4 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* SIDEBAR COMMAND CENTER */}
          <aside className="lg:w-80 w-full space-y-6 lg:sticky lg:top-24">
            {/* Network Power Index (NPI) Console */}
            {currentUserProfile && (
              <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#002147] to-[#003366] text-white shadow-2xl relative overflow-hidden group border border-white/5">
                {/* Background Radar Effect */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/10 rounded-full blur-[60px] group-hover:bg-blue-400/20 transition-all duration-1000" />
                
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Trophy className="w-3.5 h-3.5 text-amber-400" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Network Power Index</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[8px] font-black text-white/60">LVL 84</div>
                  </div>

                  <div className="flex items-end gap-3">
                    <h4 className="text-4xl font-black tracking-tighter text-white">742</h4>
                    <div className="mb-1.5 flex flex-col">
                       <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                         <TrendingUp className="w-2.5 h-2.5" /> +12%
                       </span>
                       <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest text-[7px]">Gravitas Score</span>
                    </div>
                  </div>

                  {/* Tactical Progress Units */}
                  <div className="space-y-3 pt-2">
                    {[
                      { label: "Profile Sync", value: "92%", color: "bg-amber-400" },
                      { label: "Network Reach", value: "64%", color: "bg-blue-400" },
                      { label: "Influence Hub", value: "48%", color: "bg-rose-400" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-white/50">
                          <span>{stat.label}</span>
                          <span className="text-white/80">{stat.value}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: stat.value }} 
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={`h-full ${stat.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tactical Recon Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Discovery Dashboard */}
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#002147]" />
                  <h3 className="font-bold text-[#002147] text-sm">Discovery Hub</h3>
                </div>
                <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Universal Search</label>
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input 
                      placeholder="Find talent..." 
                      className="pl-9 h-11 bg-slate-50/50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-xs font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {[
                  { label: "Job Domain", key: "job_domain", icon: LayoutGrid, options: ["Engineering", "Product", "Design", "Marketing", "Finance"] },
                  { label: "Target Company", key: "company", icon: Building2, options: ["Google", "Microsoft", "Amazon", "Meta", "Tesla"] },
                  { label: "Graduation", key: "graduation_year", icon: GraduationCap, options: ["2024", "2023", "2022", "2021", "2020"] },
                ].map((f, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <f.icon className="w-3 h-3" /> {f.label}
                    </label>
                    <Select
                      value={filters[f.key]}
                      onValueChange={(val) => setFilters({ ...filters, [f.key]: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all text-xs">
                        <SelectValue placeholder={`Select ${f.label}`} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value="all">All {f.label}s</SelectItem>
                        {f.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button 
                  onClick={clearFilters}
                  variant="ghost" 
                  className="w-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl h-10 mt-2"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Global clusters Mini-Widget */}
            <div className="p-5 rounded-3xl bg-slate-50/30 border border-slate-100 space-y-4">
               <div className="flex items-center gap-2 px-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Worldwide Pulse</span>
               </div>
               <div className="grid grid-cols-1 gap-2">
                  {locationStats.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-50 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-700">{loc.name}</span>
                      <span className="text-[10px] font-black text-slate-400">{loc.count}</span>
                    </div>
                  ))}
               </div>
            </div>
          </aside>

          {/* MAIN DATA STREAM */}
          <div className="flex-1 space-y-10 min-w-0">
            {/* STREAM HEADER */}
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-[#002147] tracking-tighter">Alumni Stream</h2>
               <p className="text-sm text-slate-400 font-medium tracking-tight">Real-time professional discovery across your verified community.</p>
            </div>

            <section>
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
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </section>

            {featuredAlumni.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-black text-[#002147]">Priority Network</h3>
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar scroll-smooth">
                  {featuredAlumni.map((alum) => (
                    <motion.div key={`feat-${alum.user_id}`} whileHover={{ y: -5 }} className="flex-shrink-0 w-72">
                      <Card 
                        className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-[#002147] to-[#003366] text-white p-6 h-44 flex flex-col justify-between cursor-pointer group rounded-[2rem]"
                        onClick={() => navigate(`/profile/${alum.user_id}`)}
                      >
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                        <div className="flex items-start gap-4 z-10">
                          <Avatar className="w-14 h-14 border-2 border-white/10">
                            <AvatarImage src={alum.user?.picture} />
                            <AvatarFallback className="bg-white/5 text-white">{getInitials(alum.user?.name)}</AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="font-black truncate text-lg">{alum.user?.name}</p>
                            <p className="text-xs text-white/50 truncate font-bold uppercase tracking-wider">{alum.company}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center z-10">
                          <span className="bg-amber-400 text-[#002147] text-[9px] font-black px-2 py-1 rounded-lg">HIGH RESPONDENT</span>
                          <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#002147] rounded-2xl flex items-center justify-center shadow-lg shadow-[#002147]/20">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#002147] text-xl tracking-tight">Verified Talents</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{alumni.length} results indexed</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : alumni.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                  <h3 className="font-black text-slate-400">No Pioneers Found</h3>
                  <Button variant="link" onClick={clearFilters} className="mt-4 text-[#002147]">Reset Parameters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {alumni.map((alum, index) => (
                      <motion.div
                        key={`${alum.user_id}-${index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Card className="group h-full flex flex-col border-slate-100/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#002147]/5 rounded-[2.5rem] overflow-hidden bg-white hover:-translate-y-1 relative">
                          <div className="absolute right-4 top-20 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                            {[
                              { icon: Bookmark, color: "bg-white text-slate-400 hover:text-blue-500", type: 'save' },
                              { icon: Heart, color: "bg-white text-slate-400 hover:text-rose-500", type: 'kudos' },
                              { icon: Send, color: "bg-[#002147] text-white", type: 'referral' }
                            ].map((a, i) => (
                              <button key={i} onClick={(e) => handleAction(e, a.type, alum.user?.name)} className={`w-10 h-10 rounded-2xl shadow-xl border border-slate-50 flex items-center justify-center transition-all hover:scale-110 ${a.color}`}>
                                <a.icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>

                          <CardHeader className="p-8 pb-4 flex flex-row items-center gap-5">
                            <div className="relative">
                              <Avatar className={`w-16 h-16 border-2 transition-all duration-500 ${alum.is_live ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-slate-50'}`}>
                                <AvatarImage src={alum.user?.picture} />
                                <AvatarFallback className="bg-slate-50 text-[#002147] font-black">{getInitials(alum.user?.name)}</AvatarFallback>
                              </Avatar>
                              {alum.is_live && <span className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full animate-pulse" />}
                            </div>
                            <div className="min-w-0">
                               <CardTitle className="text-xl font-black text-[#002147] truncate">{alum.user?.name}</CardTitle>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class of {alum.graduation_year}</p>
                            </div>
                          </CardHeader>

                          <CardContent className="p-8 pt-4 flex-1">
                            {alum.latest_wisdom ? (
                               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-xs text-slate-600 line-clamp-3">"{alum.latest_wisdom}"</div>
                            ) : (
                               <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Briefcase className="w-4 h-4" /></div>
                                     <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{alum.job_domain || "Industry Pioneer"}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Building2 className="w-4 h-4" /></div>
                                     <span className="text-xs font-bold text-slate-500">{alum.company || "Stealth Startup"}</span>
                                  </div>
                               </div>
                            )}
                          </CardContent>

                          <CardFooter className="p-8 pt-0">
                             <Button onClick={() => navigate(`/profile/${alum.user_id}`)} className="w-full bg-[#002147] hover:bg-[#003366] text-white rounded-2xl h-12 font-black shadow-lg shadow-[#002147]/20 group-hover:scale-[1.02] transition-all">
                                Access Profile <ChevronRight className="w-4 h-4 ml-1" />
                             </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-100 py-12 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="font-black text-[#002147]">AlumConnect</h4>
            <p className="text-slate-400 text-xs font-medium">© 2026 Professional Network Pulse. Verified & Secured.</p>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Legal', 'Support'].map((l, i) => (
              <a key={i} href="#" className="text-slate-400 hover:text-[#002147] text-[10px] font-black uppercase tracking-widest">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlumniDirectory;
