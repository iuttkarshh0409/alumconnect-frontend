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
    return <div className="min-h-screen flex items-center justify-center">Checking profile…</div>;
  }

  const selectedInstitute = institutes.find(
    (i) => i.institute_id === formData.institute_id
  );

  return (
  <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-card max-w-2xl w-full p-8 border border-slate-100">
      <h1 className="font-serif text-4xl font-bold text-[#002147] mb-2">
        Welcome to AlumConnect
      </h1>
      <p className="text-slate-600 mb-8">
        Let’s set up your profile to get started
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROLE */}
        <div>
          <Label className="text-[#002147] font-medium">I am a</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* INSTITUTE */}
        <div>
          <Label className="text-[#002147] font-medium">Institution</Label>
          <Select
            value={formData.institute_id}
            onValueChange={(value) =>
              setFormData({ ...formData, institute_id: value })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your institution" />
            </SelectTrigger>
            <SelectContent>
              {institutes.map((inst) => (
                <SelectItem
                  key={inst.institute_id}
                  value={inst.institute_id}
                >
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DEPARTMENT */}
        {selectedInstitute && (
          <div>
            <Label className="text-[#002147] font-medium">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) =>
                setFormData({ ...formData, department: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {selectedInstitute.departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* GRADUATION YEAR */}
        <div>
          <Label className="text-[#002147] font-medium">
            Graduation Year
          </Label>
          <Input
            type="number"
            min="1950"
            max="2030"
            className="mt-2"
            value={formData.graduation_year}
            onChange={(e) =>
              setFormData({
                ...formData,
                graduation_year: Number(e.target.value),
              })
            }
          />
        </div>

        {/* BIO */}
        <div>
          <Label className="text-[#002147] font-medium">
            Bio (Optional)
          </Label>
          <Textarea
            rows={4}
            className="mt-2"
            placeholder="Tell us a bit about yourself…"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
          />
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          disabled={
            loading ||
            !formData.role ||
            !formData.institute_id ||
            !formData.department
          }
          className="w-full bg-[#002147] text-white hover:bg-[#002147]/90 rounded-full py-6 text-lg"
        >
          {loading ? "Setting up…" : "Complete Setup"}
        </Button>
      </form>
    </div>
  </div>
);
};
export default SetupProfile;  
