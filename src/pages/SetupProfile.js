import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, School, BookOpen, UserCircle, Loader2, Info, ChevronRight, Sparkles, BookOpenCheck } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SetupProfile = () => {
  const navigate = useNavigate();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    role: "",
    institute_id: "",
    department: "",
    graduation_year: new Date().getFullYear(),
    bio: "",
  });

  /* ===============================
     1️⃣ Redirect if already setup
     =============================== */
  useEffect(() => {
    const checkAlreadySetup = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.role) {
          if (res.data.role === "student") navigate("/student/dashboard");
          else if (res.data.role === "alumni") navigate("/alumni/dashboard");
          else if (res.data.role === "admin") navigate("/admin/analytics/overview");
          return;
        }
      } catch (err) {
        toast.error("Auth check failed");
      } finally {
        setChecking(false);
      }
    };

    checkAlreadySetup();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  /* ===============================
     2️⃣ Load institutes
     =============================== */
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/institutes`);
        setInstitutes(res.data);
      } catch {
        toast.error("Failed to load institutes");
      }
    };

    fetchInstitutes();
  }, []);

  /* ===============================
     3️⃣ Submit setup
     =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn) {
      toast.error("Auth not ready");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      await axios.post(
        `${API_URL}/api/auth/setup`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile setup completed!");

      if (formData.role === "student") navigate("/student/dashboard");
      else if (formData.role === "alumni") navigate("/alumni/dashboard");
      else if (formData.role === "admin") navigate("/admin/analytics/overview");

    } catch (err) {
      const detail = err.response?.data?.detail;

      if (detail === "Profile already set up") {
        const token = await getToken();
        const me = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const role = me.data.role;
        if (role === "student") navigate("/student/dashboard");
        else if (role === "alumni") navigate("/alumni/dashboard");
        else if (role === "admin") navigate("/admin/analytics/overview");
      } else {
        toast.error(detail || "Failed to setup profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#002147] mb-4" />
        <p className="text-slate-600 font-medium tracking-wide">Securing your session...</p>
      </div>
    );
  }

  const selectedInstitute = institutes.find(
    (i) => i.institute_id === formData.institute_id
  );

  const roleOptions = [
    {
      id: "student",
      label: "Student",
      description: "Exploring campus life and learning",
      icon: School,
    },
    {
      id: "alumni",
      label: "Alumni",
      description: "Graduated and giving back",
      icon: GraduationCap,
    }
  ];

  // Role-specific UI content configurations
  const contentMap = {
    student: {
      heading: "Welcome to AlumConnect",
      subtitle: "Connect with alumni and find mentors for your career journey.",
      bioPlaceholder: "Tell alumni what you're interested in learning or building.",
      buttonColor: "bg-[#4A6C6F] hover:bg-[#4A6C6F]/90 shadow-[#4A6C6F]/20",
      accentIcon: Sparkles
    },
    alumni: {
      heading: "Welcome back to AlumConnect",
      subtitle: "Share your experience and help guide the next generation.",
      bioPlaceholder: "Tell students about your journey and how you can help them.",
      buttonColor: "bg-[#CFB53B] hover:bg-[#CFB53B]/90 shadow-[#CFB53B]/20",
      accentIcon: BookOpenCheck
    },
    default: {
      heading: "Join the Network",
      subtitle: "Personalize your experience to connect with the right people.",
      bioPlaceholder: "Tell us a bit about yourself…",
      buttonColor: "bg-[#002147] hover:bg-[#002147]/90 shadow-[#002147]/20",
      accentIcon: UserCircle
    }
  };

  const currentContent = contentMap[formData.role] || contentMap.default;
  const AccentIcon = currentContent.accentIcon;

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center p-6 text-slate-800">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,33,71,0.05)] max-w-2xl w-full p-10 border border-slate-100 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${formData.role === 'student' ? 'bg-[#4A6C6F]' : formData.role === 'alumni' ? 'bg-[#CFB53B]' : 'bg-[#002147]'}`} />
        
        <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full transition-colors duration-500 ${formData.role === 'student' ? 'bg-[#4A6C6F]/10 text-[#4A6C6F]' : formData.role === 'alumni' ? 'bg-[#CFB53B]/10 text-[#CFB53B]' : 'bg-[#002147]/10 text-[#002147]'}`}>
              <AccentIcon className="w-8 h-8" />
            </div>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#002147] mb-4 tracking-tight">
            {currentContent.heading}
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            {currentContent.subtitle}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ROLE SELECTION */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <UserCircle className="w-6 h-6 text-[#002147]" />
              <Label className="text-[#002147] text-xl font-bold">Pick your role</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 transform active:scale-[0.97] ${
                      isSelected
                        ? role.id === 'student' 
                          ? "border-[#4A6C6F] bg-[#4A6C6F]/[0.02] shadow-[0_10px_20px_rgba(74,108,111,0.06)]"
                          : "border-[#CFB53B] bg-[#CFB53B]/[0.02] shadow-[0_10px_20px_rgba(207,181,59,0.06)]"
                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className={`p-3.5 rounded-xl w-fit mb-5 transition-all ${isSelected ? (role.id === 'student' ? 'bg-[#4A6C6F]' : 'bg-[#CFB53B]') + " text-white rotate-3" : "bg-white text-slate-400 group-hover:text-[#002147] group-hover:-rotate-3"}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-xl mb-1.5 ${isSelected ? (role.id === 'student' ? 'text-[#4A6C6F]' : 'text-[#CFB53B]') : "text-slate-700 font-semibold"}`}>
                        {role.label}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-5 right-5">
                        <div className={`rounded-full p-1 ${role.id === 'student' ? 'bg-[#4A6C6F]' : 'bg-[#CFB53B]'}`}>
                          <ChevronRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN FORM FIELDS */}
          {formData.role && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Academic Details</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-[#002147]/60" />
                    <Label className="text-slate-700 font-bold text-sm">Institution</Label>
                  </div>
                  <Select
                    value={formData.institute_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, institute_id: value, department: "" })
                    }
                  >
                    <SelectTrigger className="h-14 border-slate-200 rounded-xl focus:ring-[#002147] focus:border-[#002147] bg-slate-50/30 transition-colors hover:bg-white">
                      <SelectValue placeholder="Choose campus" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {institutes.map((inst) => (
                        <SelectItem key={inst.institute_id} value={inst.institute_id} className="py-3">
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={`space-y-3.5 transition-all duration-300 ${!selectedInstitute ? "opacity-30 grayscale pointer-events-none" : "opacity-100"}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#002147]/60" />
                    <Label className="text-slate-700 font-bold text-sm">Department</Label>
                  </div>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                    disabled={!selectedInstitute}
                  >
                    <SelectTrigger className="h-14 border-slate-200 rounded-xl focus:ring-[#002147] focus:border-[#002147] bg-slate-50/30 transition-colors hover:bg-white">
                      <SelectValue placeholder="Field of study" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {selectedInstitute?.departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="py-3">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#002147]/60" />
                    <Label className="text-slate-700 font-bold text-sm">Graduation Year</Label>
                  </div>
                  <Input
                    type="number"
                    min="1950"
                    max="2030"
                    className="h-14 border-slate-200 rounded-xl focus:ring-[#002147] focus:border-[#002147] bg-slate-50/30 transition-colors hover:bg-white font-mono"
                    value={formData.graduation_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        graduation_year: Number(e.target.value),
                      })
                    }
                  />
                  <div className="flex items-center gap-1.5 px-1">
                    <Info className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Planned or actual date</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-[#002147]/60" />
                    <Label className="text-slate-700 font-bold text-sm">A Bit About You</Label>
                  </div>
                  <Textarea
                    rows={1}
                    className="min-h-[56px] border-slate-200 rounded-xl focus:ring-[#002147] focus:border-[#002147] bg-slate-50/30 transition-colors hover:bg-white resize-none py-4 leading-relaxed"
                    placeholder={currentContent.bioPlaceholder}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ACTION: SUBMIT */}
              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.role ||
                    !formData.institute_id ||
                    !formData.department
                  }
                  className={`w-full text-white h-16 rounded-2xl text-xl font-bold shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 ${currentContent.buttonColor}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Creating Profile...</span>
                    </div>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
                <p className="text-center text-[10px] font-bold text-slate-300 mt-6 uppercase tracking-[0.2em]">
                  Secure verification by AlumConnect
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
