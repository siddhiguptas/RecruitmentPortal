import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  UserCircle, 
  Briefcase, 
  FileCheck, 
  ClipboardCheck, 
  PlusSquare, 
  Users, 
  UserCheck, 
  BarChart3, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronDown,
  Search,
  Settings
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils";
import { Button } from "./Button";
import { studentService } from "../services/studentService";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await studentService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case "student":
        return [
          { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
          { label: "Profile", href: "/student/profile", icon: <UserCircle size={20} /> },
          { label: "Recommended Jobs", href: "/student/jobs", icon: <Briefcase size={20} /> },
          { label: "Applications", href: "/student/applications", icon: <FileCheck size={20} /> },
          { label: "Online Tests", href: "/student/tests", icon: <ClipboardCheck size={20} /> },
        ];
      case "recruiter":
        return [
          { label: "Dashboard", href: "/recruiter/dashboard", icon: <LayoutDashboard size={20} /> },
          { label: "Post Job", href: "/recruiter/post-job", icon: <PlusSquare size={20} /> },
          { label: "Applicants", href: "/recruiter/applicants", icon: <Users size={20} /> },
          { label: "Interviews", href: "/recruiter/interviews", icon: <UserCheck size={20} /> },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
          { label: "Students", href: "/admin/students", icon: <Users size={20} /> },
          { label: "Recruiters", href: "/admin/recruiters", icon: <Briefcase size={20} /> },
          { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex-shrink-0 flex items-center justify-center">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">HireStream</span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                location.pathname === item.href
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "flex-shrink-0",
                location.pathname === item.href ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {item.icon}
              </div>
              {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden flex flex-col shadow-2xl"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">HireStream</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    location.pathname === item.href
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className={location.pathname === item.href ? "text-emerald-600" : "text-slate-400"}>
                    {item.icon}
                  </div>
                  <span className="text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 lg:w-96">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative transition-colors"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-16 top-16 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification._id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-slate-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
              >
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user?.role}</div>
                </div>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <UserCircle size={18} />
                        My Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <Settings size={18} />
                        Account Settings
                      </button>
                      <div className="h-px bg-slate-50 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut size={18} />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
