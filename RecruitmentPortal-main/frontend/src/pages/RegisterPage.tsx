import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Briefcase, ArrowLeft, AlertCircle, User, Building2, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { cn } from "../utils";
import { UserRole } from "../types";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: (searchParams.get("role") as UserRole) || "student",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await register(formData);
      
      // Redirect based on role
      if (user.role === "student") navigate("/student/dashboard");
      else if (user.role === "recruiter") navigate("/recruiter/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Find jobs & get placed",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Hire top talent",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage platform",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 group">
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Back to home</span>
        </Link>
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Briefcase className="text-white w-6 h-6" />
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Select your role</label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id as UserRole)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                      formData.role === role.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "mb-1.5",
                      formData.role === role.id ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {role.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{role.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Full name"
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />

            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <div className="text-xs text-slate-500 leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="font-medium text-slate-900 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="font-medium text-slate-900 hover:underline">Privacy Policy</a>.
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base"
              isLoading={isLoading}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  Secure registration
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
