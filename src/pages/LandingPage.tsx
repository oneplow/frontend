import { Link } from 'react-router-dom';
import { Zap, Shield, Key, ArrowRight, Bot, Cpu, TerminalSquare } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">EasyAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/sign-up" className="hidden sm:inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            v1.0 is now live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-6 leading-tight">
            The Ultimate API Gateway <br className="hidden lg:block" /> for AI Models
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10 leading-relaxed">
            One API key to rule them all. Route requests to Claude, OpenAI, and open-source models with built-in rate limiting, usage tracking, and seamless integrations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-up" className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95">
              Start Building Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/docs" className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10">
              <TerminalSquare size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6 border-t border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Enterprise-grade infrastructure</h2>
            <p className="text-zinc-400">Everything you need to manage AI API consumption in production.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Bot size={24} className="text-blue-400" />,
                title: 'Multi-Model Routing',
                desc: 'Seamlessly switch between Anthropic, OpenAI, and local models without changing your codebase.'
              },
              {
                icon: <Shield size={24} className="text-emerald-400" />,
                title: 'Rate Limiting & Quotas',
                desc: 'Set strict RPM and token limits per user or API key to prevent unexpected billing surprises.'
              },
              {
                icon: <Key size={24} className="text-purple-400" />,
                title: 'Key Management',
                desc: 'Generate, revoke, and monitor API keys. Issue temporary keys with automated expiration.'
              },
              {
                icon: <Cpu size={24} className="text-amber-400" />,
                title: 'Real-time Analytics',
                desc: 'Track latency, token usage, and error rates across all your downstream providers instantly.'
              },
              {
                icon: <TerminalSquare size={24} className="text-rose-400" />,
                title: 'Universal Compatibility',
                desc: '100% compatible with the OpenAI API format. Drop it into LangChain, LlamaIndex, or Cursor.'
              },
              {
                icon: <Zap size={24} className="text-cyan-400" />,
                title: 'Edge Optimized',
                desc: 'Minimal overhead proxy written for maximum throughput and ultra-low latency routing.'
              }
            ].map((feat, idx) => (
              <div key={idx} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-500">EasyAI</span>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} EasyAI Gateway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
