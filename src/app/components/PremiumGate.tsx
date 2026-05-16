import { useNavigate } from "react-router";
import { useAppContext } from "../context/AppContext";
import type { ReactNode } from "react";

interface PremiumGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PremiumGate({ children, fallback }: PremiumGateProps) {
  const { user } = useAppContext();
  const navigate = useNavigate();

  if (!user.isPremium) {
    if (fallback) return <>{fallback}</>;
    navigate("/premium");
    return null;
  }

  return <>{children}</>;
}
