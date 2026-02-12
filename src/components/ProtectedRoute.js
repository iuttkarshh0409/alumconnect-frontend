import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProtectedRoute = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!isLoaded) return;

  if (!isSignedIn) {
    navigate("/");
    return;
  }

  const verify = async () => {
    const token = await getToken();

    try {
      await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
    } catch {
      navigate("/");
    }
  };

  verify();
}, [isLoaded, isSignedIn, getToken, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;
