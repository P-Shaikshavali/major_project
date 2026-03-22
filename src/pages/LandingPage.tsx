import { Link } from 'react-router-dom';
import { ShieldAlert, Bot, Activity, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-slate-50 font-body flex flex-col selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-blue-50/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
            <ShieldCheck className="text-blue-600" size={28} />
            E-Grievance
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-100">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/login" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 hover:shadow transition-all active:scale-95">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-8 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Secure & Anonymous Resolution
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight leading-[1.1] mb-6">
              AI-Powered <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">E-Grievance System</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience the next generation of academic and administrative support. Our intelligent platform ensures your voice is heard, routed securely, and resolved swiftly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard/submit" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                Submit Complaint <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg border border-blue-100 shadow-sm hover:bg-blue-50 transition-all active:scale-95">
                Authority Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-950 mb-4">Engineered for Transparency</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Combining artificial intelligence with secure infrastructure to deliver the best resolution experience.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldAlert size={32} className="text-blue-600" />, title: "Anonymous Complaints", desc: "Your identity remains protected. We separate user identification from complaint data automatically." },
                { icon: <Bot size={32} className="text-blue-600" />, title: "AI-Based Routing", desc: "No more delays. Our AI analyzes your grievance and instantly assigns it to the exact personnel." },
                { icon: <Activity size={32} className="text-blue-600" />, title: "Real-Time Tracking", desc: "Track the status of your complaints with minute-by-minute updates and status badges." }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-50 border border-blue-50/50 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldCheck className="text-slate-500" size={24} />
          <span className="font-bold text-slate-300">E-Grievance Platform</span>
        </div>
        <p className="text-sm">© 2026 AI Academic Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
