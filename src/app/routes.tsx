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
import { Settings } from "./screens/Settings";
import { Privacy } from "./screens/Privacy";
import { ScanHistory } from "./screens/ScanHistory";
import { AddClothing } from "./screens/AddClothing";
import { AdminGuard } from "./components/AdminGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Welcome },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "home", Component: Home },
      { path: "scan", Component: FaceScan },
      { path: "analysis-result", Component: AnalysisResult },
      { path: "outfits", Component: OutfitRecommendations },
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
      // ── Admin routes (chỉ dành cho role "admin") ──
      {
        Component: AdminGuard,
        children: [
          { path: "admin", Component: AdminDashboard },
          { path: "admin/users", Component: AdminUsers },
          { path: "admin/revenue", Component: AdminRevenue },
        ],
      },
    ],
  },
]);