import { createBrowserRouter } from "react-router";
import { Root } from "./screens/Root";
import { Welcome } from "./screens/Welcome";
import { Login } from "./screens/Login";
import { Signup } from "./screens/Signup";
import { ForgotPassword } from "./screens/ForgotPassword";
import { Home } from "./screens/Home";
import { FaceScan } from "./screens/FaceScan";
import { AnalysisResult } from "./screens/AnalysisResult";
import { OutfitRecommendations } from "./screens/OutfitRecommendations";
import { Wardrobe } from "./screens/Wardrobe";
import { Profile } from "./screens/Profile";
import { PremiumUpgrade } from "./screens/PremiumUpgrade";
import { PremiumSetup } from "./screens/PremiumSetup";
import { SmartAdvisor } from "./screens/SmartAdvisor";
import { StyleOthers } from "./screens/StyleOthers";
import { AdminDashboard } from "./screens/admin/AdminDashboard";
import { AdminUsers } from "./screens/admin/AdminUsers";
import { AdminRevenue } from "./screens/admin/AdminRevenue";
import { AdminProducts } from "./screens/admin/AdminProducts";
import { Settings } from "./screens/Settings";
import { Privacy } from "./screens/Privacy";
import { ScanHistory } from "./screens/ScanHistory";
import { AddClothing } from "./screens/AddClothing";
import { AuthCallback } from "./screens/AuthCallback";
import { AdminGuard } from "./components/AdminGuard";
import { RequireAuth } from "./components/RequireAuth";
import { RequireProfile } from "./components/RequireProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // ── Public routes ──
      { index: true, Component: Welcome },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "auth/callback", Component: AuthCallback },
      // ── Protected routes (require login) ──
      {
        Component: RequireAuth,
        children: [
          { path: "home", Component: Home },
          { path: "analysis-result", Component: AnalysisResult },
          // Routes that require AI personalization (gender + body profile)
          {
            Component: RequireProfile,
            children: [
              { path: "scan", Component: FaceScan },
              { path: "outfits", Component: OutfitRecommendations },
            ],
          },
          { path: "wardrobe", Component: Wardrobe },
          { path: "profile", Component: Profile },
          { path: "premium", Component: PremiumUpgrade },
          { path: "premium-upgrade", Component: PremiumUpgrade },
          { path: "premium-setup", Component: PremiumSetup },
          { path: "smart-advisor", Component: SmartAdvisor },
          { path: "style-others", Component: StyleOthers },
          { path: "settings", Component: Settings },
          { path: "privacy", Component: Privacy },
          { path: "scan-history", Component: ScanHistory },
          { path: "add-clothing", Component: AddClothing },
        ],
      },
      // ── Admin routes (chỉ dành cho role "admin") ──
      {
        Component: AdminGuard,
        children: [
          { path: "admin", Component: AdminDashboard },
          { path: "admin/users", Component: AdminUsers },
          { path: "admin/revenue", Component: AdminRevenue },
          { path: "admin/products", Component: AdminProducts },
        ],
      },
    ],
  },
]);