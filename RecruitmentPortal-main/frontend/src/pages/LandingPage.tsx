import React from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Search, 
  BarChart3, 
  Menu,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      title: "AI Resume Parsing",
      description: "Extract skills, education, and experience automatically from any resume format.",
      icon: <FileText className="w-6 h-6 text-emerald-500" />,
    },
    {
      title: "Smart Job Matching",
      description: "Personalized job recommendations based on your unique skill set and profile.",
      icon: <Zap className="w-6 h-6 text-amber-500" />,
    },
    {
      title: "Candidate Ranking",
      description: "Recruiters can rank applicants instantly using our advanced matching algorithms.",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Placement Prediction",
      description: "AI-driven insights into placement probability and skill gap analysis.",
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "AI Proctoring",
      description: "Secure, real-time proctored assessments with suspicious activity detection.",
      icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
    },
    {
      title: "Advanced Search",
      description: "Powerful filters to find the perfect job or the ideal candidate in seconds.",
      icon: <Search className="w-6 h-6 text-indigo-500" />,
    },
  ];

  const stats = [
    { label: "Placement Success", value: "92%" },
    { label: "Partner Companies", value: "500+" },
    { label: "Students Placed", value: "10k+" },
    { label: "Daily Applications", value: "2.5k" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">HireStream</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">How it Works</a>
              <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Benefits</a>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Login</Link>
              <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                Get Started
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-100 px-4 py-4 flex flex-col gap-4"
          >
            <a href="#features" className="text-sm font-medium text-slate-600">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600">How it Works</a>
            <a href="#benefits" className="text-sm font-medium text-slate-600">Benefits</a>
            <Link to="/login" className="text-sm font-medium text-slate-600">Login</Link>
            <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
              Get Started
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6 border border-emerald-100">
              <Zap className="w-3 h-3" />
              Powered by Advanced AI
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              The Future of Campus <br />
              <span className="text-emerald-600">Recruitment is Here.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect students with their dream careers and help recruiters find top talent faster. 
              AI-driven matching, automated parsing, and secure assessments in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group">
                Join as a Student
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register?role=recruiter" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                Hire Top Talent
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-[2rem] blur-3xl" />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden aspect-video flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8" />
                </div>
                <p className="font-medium">Dashboard Preview</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Intelligent Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We've built the most advanced tools to streamline every step of the recruitment process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-slate-100 bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-12">How it Works</h2>
              
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg">1</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                    <p className="text-slate-400">Students upload resumes for AI parsing, while recruiters set up company profiles and job requirements.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg">2</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Matching & Ranking</h3>
                    <p className="text-slate-400">Our algorithms analyze profiles and job descriptions to provide instant match scores and recommendations.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg">3</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Secure Assessments</h3>
                    <p className="text-slate-400">Students take AI-proctored tests, ensuring integrity and providing deep insights into technical capabilities.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg">4</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Hire & Get Placed</h3>
                    <p className="text-slate-400">Manage the entire interview pipeline and offer process within our unified recruitment dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="relative bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Users className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Top Candidates</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ranked by AI</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Live Updates
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-slate-700/50 rounded-xl border border-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full" />
                        <div>
                          <div className="text-sm font-medium">Candidate #{i}</div>
                          <div className="text-xs text-slate-400">Full Stack Engineer</div>
                        </div>
                      </div>
                      <div className="text-emerald-500 font-bold text-sm">{98 - i}% Match</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for Everyone</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Tailored experiences for every stakeholder in the recruitment ecosystem.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Users className="text-emerald-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">For Students</h3>
              <ul className="space-y-4">
                {[
                  "Automated profile building from resumes",
                  "Personalized job recommendations",
                  "Skill gap analysis & predictions",
                  "Direct communication with recruiters"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Briefcase className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">For Recruiters</h3>
              <ul className="space-y-4">
                {[
                  "Instant candidate ranking by relevance",
                  "End-to-end pipeline management",
                  "AI-proctored technical assessments",
                  "Collaborative hiring tools"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-purple-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">For Admins</h3>
              <ul className="space-y-4">
                {[
                  "Comprehensive placement analytics",
                  "Student eligibility verification",
                  "Platform-wide statistics & reports",
                  "User & company management"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your <br />recruitment process?</h2>
            <p className="text-emerald-50 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students and companies already using HireStream to build the future of work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl">
                Get Started for Free
              </Link>
              <Link to="/contact" className="w-full sm:w-auto bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all border border-emerald-500/30">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">HireStream</span>
              </div>
              <p className="text-slate-500 max-w-xs leading-relaxed">
                Empowering the next generation of talent with AI-driven recruitment solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">How it Works</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-sm">
              © 2026 HireStream Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">LinkedIn</a>
              <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
