import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  FileUp,
  LayoutDashboard,
  Trophy,
  User,
  Users,
  BarChart,
  LogOut
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

type SidebarLink = {
  to: string;
  label: string;
  icon: React.ElementType;
  comingSoon?: boolean;
};

const studentLinks: SidebarLink[] = [
  { to: ROUTES.STUDENT_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.STUDENT_TEAMS, label: "Teams", icon: Users },
  { to: ROUTES.STUDENT_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.STUDENT_REGISTRATION, label: "Registration", icon: ClipboardList },
  { to: ROUTES.STUDENT_SUBMISSION, label: "Submission", icon: FileUp },
];

const adminLinks: SidebarLink[] = [
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.ADMIN_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.ADMIN_PROBLEM_STATEMENTS, label: "Problem Statements", icon: FileUp },
  { to: ROUTES.ADMIN_REGISTRATIONS, label: "Registrations", icon: ClipboardList },
  { to: ROUTES.ADMIN_SUBMISSIONS, label: "Submissions", icon: FileUp },
  { to: ROUTES.ADMIN_TEAMS, label: "Teams", icon: Users },
  { to: ROUTES.ADMIN_ANALYTICS, label: "Analytics", icon: BarChart },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const isAdminPath = location.pathname.startsWith('/admin');
  const activeLinks = isAdminPath ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success("Logged out successfully.");
  };

  const SidebarContent = (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="mb-3 px-3 text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation
          </p>
          <nav className="space-y-1">
            {activeLinks.map((link) => (
              link.comingSoon ? (
                <div
                  key={link.label}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed dark:text-slate-500 border border-transparent"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                    Soon
                  </span>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden group",
                      isActive
                        ? "bg-gradient-to-r from-primary-50 to-transparent text-primary-700 dark:from-primary-900/30 dark:to-transparent dark:text-primary-300"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 dark:bg-primary-500 rounded-r-full" />
                      )}
                      <link.icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110 text-primary-600 dark:text-primary-400" : "group-hover:scale-110")} />
                      {link.label}
                    </>
                  )}
                </NavLink>
              )
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50">
        <nav className="space-y-1">
          <NavLink
            to={ROUTES.STUDENT_PROFILE}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 group",
                isActive
                  ? "bg-gradient-to-r from-primary-50 to-transparent text-primary-700 dark:from-primary-900/30 dark:to-transparent dark:text-primary-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80",
              )
            }
          >
            <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            Logout
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Drawer */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex-col bg-white/95 backdrop-blur-xl dark:bg-slate-900/95 border-r border-slate-200/60 dark:border-slate-700/60 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {SidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/50 h-screen sticky top-0 supports-[backdrop-filter]:bg-white/40">
        {SidebarContent}
      </aside>
    </>
  );
}
