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
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Hero Section */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Bridge the Gap Between Alumni & Students
              </h1>
              <p className="text-lg text-white/90 leading-relaxed mb-8">
                AlumConnect creates meaningful mentorship connections, empowering students with career guidance from verified alumni across top institutions.
              </p>
              <button
                data-testid="hero-get-started-btn"
                onClick={handleLogin}
                className="bg-white text-[#002147] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 py-3 font-medium inline-flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
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
      <div className="bg-[#002147] py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-6">
            Ready to Connect?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of students and alumni building meaningful mentorship relationships.
          </p>
          <button
            data-testid="cta-join-now-btn"
            onClick={handleLogin}
            className="bg-white text-[#002147] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 py-3 font-medium inline-flex items-center gap-2"
          >
            Join Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;