import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";

// Legacy route — redirect to the real personalization form in Profile
// (or home if already set up)
export function PremiumSetup() {
  const navigate = useNavigate();
  const { user, authLoading } = useAppContext();

  useEffect(() => {
    if (authLoading) return;
    if (user.bodyProfile?.gender) {
      navigate("/home", { replace: true });
    } else {
      navigate("/profile?openBodyPanel=1", { replace: true });
    }
  }, [authLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
