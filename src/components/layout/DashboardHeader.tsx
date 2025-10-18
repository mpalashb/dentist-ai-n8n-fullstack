import {
  Bell,
  LogOut,
  Search,
  Settings,
  User,
  Moon,
  Sun,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "next-themes";

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "GU"; // GU for Guest User

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative max-w-md w-full"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex-col items-start p-4 cursor-pointer">
                <div className="flex w-full justify-between">
                  <p className="font-medium">New transcription completed</p>
                  <Badge variant="outline">New</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your transcription "Client Meeting" is ready for review
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  2 minutes ago
                </p>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex-col items-start p-4 cursor-pointer">
                <div className="flex w-full justify-between">
                  <p className="font-medium">Email campaign sent</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your "Monthly Newsletter" campaign has been sent to 185
                  subscribers
                </p>
                <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex-col items-start p-4 cursor-pointer">
                <div className="flex w-full justify-between">
                  <p className="font-medium">System update</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  New features have been added to your dashboard
                </p>
                <p className="text-xs text-muted-foreground mt-2">Yesterday</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ""} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user ? "My Account" : "Guest User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "Not logged in"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => navigate("/login")}>
                <User className="mr-2 h-4 w-4" />
                Sign In
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate("/help")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "dark" ? (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Settings className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
