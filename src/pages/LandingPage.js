import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { ArrowRight, Users, TrendingUp, Award, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import iips from './iips.jpeg';

const LandingPage = () => {

  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      navigate('/post-auth');
    }
  }, [isLoaded, isSignedIn, navigate]);

const handleLogin = () => {
  window.location.href = '/sign-in';
};
  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 transition-colors duration-300">
      {/* PROFESSIONAL NAV HEADER */}
      <header className="fixed top-0 z-[100] w-full border-b border-white/10 bg-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#002147] font-black text-2xl shadow-2xl">
              A
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight">
              AlumConnect
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/sign-in')}
              className="text-xs font-black uppercase tracking-[0.2em] hover:text-white/70 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Admin Command
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-gradient relative overflow-hidden pt-20">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-serif text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                Bridge the Gap <br/>
                <span className="text-white/40">Between Generations.</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed mb-12 max-w-lg font-medium">
                The high-fidelity mentorship infrastructure for modern educational institutions. Empowering students with legacy wisdom.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  data-testid="hero-get-started-btn"
                  onClick={handleLogin}
                  className="bg-white text-[#002147] hover:bg-slate-100 shadow-2xl shadow-blue-900/40 transition-all duration-300 rounded-[1.5rem] px-10 py-5 font-black text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                >
                  Initiate Launch <ArrowRight className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigate('/sign-in')}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all duration-300 rounded-[1.5rem] px-10 py-5 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <Users className="w-5 h-5 text-blue-400" />
                  View Directory
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={iips}
                alt="University Campus"
                className="rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section - Bento Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#002147] mb-4">
            Why AlumConnect?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A comprehensive platform designed for educational institutions to foster meaningful alumni-student connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            data-testid="feature-card-verified-network"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-slate-100"
          >
            <Shield className="w-12 h-12 text-[#002147] mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-[#002147] mb-3">Verified Network</h3>
            <p className="text-slate-600 leading-relaxed">
              Connect with verified alumni from your institution, ensuring authentic mentorship experiences.
            </p>
          </motion.div>

          <motion.div
            data-testid="feature-card-smart-matching"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-slate-100"
          >
            <Users className="w-12 h-12 text-[#4A6C6F] mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-[#002147] mb-3">Smart Matching</h3>
            <p className="text-slate-600 leading-relaxed">
              Advanced filtering by company, domain, graduation year, and skills to find the perfect mentor.
            </p>
          </motion.div>

          <motion.div
            data-testid="feature-card-career-insights"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-slate-100"
          >
            <TrendingUp className="w-12 h-12 text-[#CFB53B] mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-[#002147] mb-3">Career Insights</h3>
            <p className="text-slate-600 leading-relaxed">
              Access data-driven insights on top employers, skill trends, and career trajectories.
            </p>
          </motion.div>

          <motion.div
            data-testid="feature-card-structured-requests"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-slate-100 md:col-span-2 lg:col-span-1"
          >
            <Award className="w-12 h-12 text-[#4A6C6F] mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-[#002147] mb-3">Structured Requests</h3>
            <p className="text-slate-600 leading-relaxed">
              Topic-based mentorship requests with built-in privacy and automatic expiry management.
            </p>
          </motion.div>

          <motion.div
            data-testid="feature-card-hall-of-fame"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#CFB53B]/10 to-[#CFB53B]/5 rounded-xl p-8 shadow-card hover:shadow-hover transition-all duration-300 border border-[#CFB53B]/20 md:col-span-2"
          >
            <Award className="w-12 h-12 text-[#CFB53B] mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-[#002147] mb-3">Hall of Fame</h3>
            <p className="text-slate-600 leading-relaxed">
              Celebrate achievements with alumni spotlights, showcasing inspiring success stories and career milestones.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#001529] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="font-serif text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Ready to <span className="text-blue-500">Initiate?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 font-medium">
            Join the high-density network of elite alumni and ambitious students.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={handleLogin}
              className="bg-white text-[#002147] hover:bg-slate-100 shadow-2xl shadow-blue-500/20 transition-all duration-300 rounded-[1.2rem] px-12 py-4 font-black text-lg hover:scale-105 active:scale-95"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[1.2rem] px-12 py-4 font-black text-lg hover:scale-105 transition-all"
            >
              Explore Perks
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center text-white font-black">A</div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 AlumConnect Infrastructure</p>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <a href="#" className="hover:text-[#002147] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#002147] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#002147] transition-colors">Security</a>
              <button 
                onClick={() => navigate('/sign-in')}
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                Admin Gateway
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;