import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PostAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/");
      return;
    }

    const syncUser = async () => {
      try {
        const token = await getToken();

        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const backendUser = res.data;

        if (!backendUser.role) {
          navigate("/setup");
        } else if (backendUser.role === "student") {
          navigate("/student/dashboard");
        } else if (backendUser.role === "alumni") {
          navigate("/alumni/dashboard");
        } else if (backendUser.role === "admin") {
          navigate("/admin/analytics/overview");
        } else {
          navigate("/setup");
        }
      } catch (err) {
        navigate("/setup");
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#002147] mx-auto mb-4"></div>
        <p className="text-lg text-slate-600">Finishing sign-in…</p>
      </div>
    </div>
  );
}
