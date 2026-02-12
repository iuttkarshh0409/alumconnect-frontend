import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(); // 🔥 THIS is what actually logs user out
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold text-[#002147]">
          AlumConnect Admin
        </h1>

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
  );
};

export default AdminHeader;
