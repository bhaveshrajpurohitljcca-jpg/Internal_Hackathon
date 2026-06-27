import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Code2, Moon, Sun, User as UserIcon, Settings, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { ROUTES } from "@/routes/paths";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
    isActive
      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white",
  );

interface NavbarProps {
  showSidebar?: boolean;
  onMenuClick?: () => void;
}

export default function Navbar({ showSidebar, onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success("Logged out successfully.");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/70 supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 relative">
        <div className="flex items-center gap-4 flex-1">
          {showSidebar && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link to={ROUTES.LANDING} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-primary-600 to-indigo-500 text-white p-1.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">Hackathon Portal</span>
          </Link>
        </div>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/50 dark:bg-slate-900/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
          {!isAuthenticated && (
            <NavLink to={ROUTES.LANDING} className={navLinkClass} end>
              Home
            </NavLink>
          )}
          {user?.role !== "ADMIN" && (
            <NavLink to={ROUTES.STUDENT_HACKATHONS} className={navLinkClass}>
              Hackathons
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to={user?.role === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center justify-end gap-3 flex-1">
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-all duration-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {!isAuthenticated ? (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary-50 to-indigo-50 text-primary-700 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:from-slate-800 dark:to-slate-700 dark:text-primary-400 border border-primary-100 dark:border-slate-600"
              >
                <UserIcon className="h-5 w-5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 focus:outline-none dark:bg-slate-900/90 dark:ring-white/10 py-2 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-0.5">
                      {user?.role === "ADMIN" ? "Administrator" : "Student"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-1 border-b border-slate-100 dark:border-slate-700">
                    <Link
                      to={ROUTES.STUDENT_PROFILE}
                      onClick={() => setDropdownOpen(false)}
                      className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                    >
                      <UserIcon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-primary-600 dark:text-slate-500 dark:group-hover:text-primary-400" />
                      My Profile
                    </Link>
                    <button
                      disabled
                      className="group flex w-full items-center px-4 py-2 text-sm text-slate-400 cursor-not-allowed dark:text-slate-500"
                    >
                      <Settings className="mr-3 h-4 w-4 text-slate-300 dark:text-slate-600" />
                      Settings <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-slate-400">Coming Soon</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
