import {
  Home,
  FileText,
  Mail,
  Settings,
  User,
  BarChart3,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "New Voice", url: "/voice", icon: FileText },
  { title: "Voice Recordings", url: "/transcripts", icon: FileText },
  { title: "Email Automation", url: "/emails", icon: Mail },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const secondaryMenuItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
];

export const DashboardSidebar = () => {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActiveClass = (url: string) => {
    return `flex items-center gap-3 rounded-lg transition-colors duration-200 ${
      location.pathname === url
        ? "bg-white text-gray-900 font-bold shadow-sm border-l-4 border-indigo-600"
        : "text-black hover:bg-indigo-50"
    }`;
  };

  const handleSignOut = () => {
    if (signOut) {
      signOut();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <Sidebar
      className={
        open
          ? "w-64 bg-indigo-50 dark:bg-indigo-950"
          : "w-14 bg-indigo-50 dark:bg-indigo-950"
      }
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-indigo-200 dark:border-indigo-800 p-4 bg-white dark:bg-indigo-900">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CD</span>
          </div>
          {open && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-xl text-black"
            >
              Client Dashboard
            </a>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-indigo-50 dark:bg-indigo-950">
        <SidebarGroup className="bg-white dark:bg-indigo-900 rounded-lg mx-2 my-1 shadow-md border border-indigo-100 dark:border-indigo-800">
          <SidebarGroupLabel
            className={`${
              !open ? "sr-only" : ""
            } text-black font-bold tracking-wide text-lg`}
          >
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink
                      to={item.url}
                      className={isActiveClass(item.url)}
                      onClick={(e) => {
                        // If not authenticated and trying to access protected routes
                        // Allow access to dashboard, voice, analytics, and help pages without authentication
                        if (
                          !user &&
                          item.url !== "/dashboard" &&
                          item.url !== "/voice" &&
                          item.url !== "/analytics" &&
                          item.url !== "/help"
                        ) {
                          e.preventDefault();
                          navigate("/login");
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                      {item.title === "Email Automation" && open && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          New
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="bg-white dark:bg-indigo-900 rounded-lg mx-2 my-1 shadow-md border border-indigo-100 dark:border-indigo-800">
          <SidebarGroupLabel
            className={`${
              !open ? "sr-only" : ""
            } text-black font-bold tracking-wide text-lg`}
          >
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink
                      to={item.url}
                      className={isActiveClass(item.url)}
                      onClick={(e) => {
                        // If not authenticated and trying to access protected routes
                        // Allow access to help page without authentication
                        if (!user && item.url !== "/help") {
                          e.preventDefault();
                          navigate("/login");
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-indigo-200 dark:border-indigo-800 p-4 bg-white dark:bg-indigo-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-black hover:bg-indigo-100 transition-colors duration-200 font-medium"
                onClick={user ? handleSignOut : () => navigate("/login")}
              >
                <LogOut className="h-4 w-4" />
                {open && <span>{user ? "Log out" : "Sign In"}</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
