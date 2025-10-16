import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

export const AuthNavbar = () => {
  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CD</span>
          </div>
          <span className="font-bold text-xl">Client Dashboard</span>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};
