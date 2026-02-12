import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/");
      return;
    }

    const finalizeLogin = async () => {
      try {
        const token = await getToken();

        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data;

        if (!user.role) navigate("/setup");
        else if (user.role === "student") navigate("/student/dashboard");
        else if (user.role === "alumni") navigate("/alumni/dashboard");
        else if (user.role === "admin") navigate("/admin/analytics/overview");
        else navigate("/setup");
      } catch (err) {
        console.error("Post-auth failed", err);
        navigate("/");
      }
    };

    finalizeLogin();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Finalizing login…
    </div>
  );
};

export default AuthCallback;
