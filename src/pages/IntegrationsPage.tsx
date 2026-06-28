import { 
  Code2, 
  TerminalSquare, 
  Bot, 
  Cpu, 
  Wrench, 
  Terminal,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';

export const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const integrations = [
    {
      title: 'Cursor',
      badge: 'VS Code Editor',
      description: 'AI-powered code editor with custom OpenAI-compatible model settings.',
      icon: <Code2 size={24} className="text-zinc-600" />,
      link: '/integrations/cursor'
    },
    {
      title: 'Claude Code CLI',
      badge: 'CLI',
      description: 'Anthropic\'s official coding CLI, routed through the endpoint.',
      icon: <TerminalSquare size={24} className="text-zinc-600" />,
      link: '/integrations/claude'
    },
    {
      title: 'Hermes Agent',
      badge: 'Agent',
      description: 'Autonomous agent reachable from Telegram. Guided one-paste VPS setup.',
      icon: <Bot size={24} className="text-zinc-600" />,
      link: '/integrations/hermes'
    },
    {
      title: 'Factory CLI',
      badge: 'Terminal Coding',
      description: 'Custom model entry using Factory BYOK settings.',
      icon: <Cpu size={24} className="text-zinc-600" />,
      link: '/integrations/factory'
    },
    {
      title: 'OpenClaw',
      badge: 'Agent',
      description: 'Use OpenClaw with standard OpenAI-compatible endpoint settings.',
      icon: <Bot size={24} className="text-zinc-600" />,
      link: '/integrations/openclaw'
    },
    {
      title: 'Codex CLI',
      badge: 'Terminal Coding',
      description: 'Any Codex-style CLI that accepts custom OpenAI base URL can use the same key.',
      icon: <Terminal size={24} className="text-zinc-600" />,
      link: '/integrations/codex'
    },
    {
      title: 'Any OpenAI-compatible tool',
      badge: 'Universal Setup',
      description: 'Works with LibreChat, Continue, Aider, custom SDKs, and other OpenAI-compatible clients.',
      icon: <Wrench size={24} className="text-zinc-600" />,
      link: '/integrations/openai'
    }
  ];

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20">
      {loading && <PageLoader />}
      <div className="mb-6 flex items-center text-[15px] font-medium text-zinc-500">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Overview</Link>
        <ChevronRight size={14} className="mx-2 opacity-50 text-zinc-400" />
        <span className="text-zinc-900">Integrations</span>
      </div>

      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Integrations</h1>
        <p className="text-sm text-zinc-500">Connect your favorite tools and agents to the router.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((intg, idx) => (
          <Link 
            key={idx}
            to={intg.link}
            className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all hover:border-zinc-300 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100">
              {intg.icon}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-zinc-900">{intg.title}</h3>
                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  {intg.badge}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {intg.description}
              </p>
            </div>
            <ArrowUpRight 
              size={18} 
              className="absolute right-5 top-5 text-zinc-300 transition-colors group-hover:text-zinc-600" 
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
