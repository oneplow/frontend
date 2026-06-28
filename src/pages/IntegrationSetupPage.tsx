import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Key, Code2, Bot, Wrench, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INTEGRATION_DATA: Record<string, any> = {
  'cursor': {
    title: 'Cursor',
    badge: 'VS Code Editor',
    setupTime: '2 min',
    icon: Code2,
    description: 'Cursor setup is mostly field mapping. Paste base URL, API key, and model name in Models settings, then verify the connection.',
    config: 'Cursor Settings > Models > API Keys / custom OpenAI model',
    authText: 'OpenAI-compatible API key with custom base URL.',
    steps: [
      { title: 'Open Models settings', desc: 'In Cursor, open Settings and find the Models or API Keys section for custom providers.' },
      { title: 'Enter connection values', desc: 'Paste the endpoint, key, and model name exactly. Cursor is strict about model id spelling.' },
      { title: 'Verify and select', desc: 'Use the verify action if Cursor shows one, then pick your router-backed model from the model selector.' }
    ],
    snippetTitle: 'Values to paste into Cursor',
    snippetDesc: 'Cursor usually asks for fields in UI instead of one config file. Use these values directly.',
    snippetFile: 'cursor-values.json',
    snippetCode: (baseUrl: string) => `{\n  "baseUrl": "${baseUrl}",\n  "apiKey": "sk_nry_your_api_key",\n  "model": "provider/model-id"\n}`
  },
  'openai': {
    title: 'Any OpenAI-compatible tool',
    badge: 'Universal Setup',
    setupTime: '1 min',
    icon: Wrench,
    description: 'If a client says OpenAI-compatible, custom endpoint, or chat completions, the setup reduces to three values: base URL, API key, model id.',
    config: 'Tool-specific provider form or env file',
    authText: 'Bearer token or OpenAI-style apiKey field.',
    steps: [
      { title: 'Map the three required fields', desc: 'Most tools ask for some combination of endpoint, key, and model. Fill those first before touching advanced settings.' },
      { title: 'Ignore optional knobs at first', desc: 'Temperature, headers, org id, and timeout can wait. First confirm a plain request works.' }
    ],
    snippetTitle: 'Universal connection values',
    snippetDesc: 'Works as a mental model for almost every OpenAI-compatible client.',
    snippetFile: 'provider-values.json',
    snippetCode: (baseUrl: string) => `{\n  "baseUrl": "${baseUrl}",\n  "apiKey": "sk_nry_your_api_key",\n  "model": "provider/model-id"\n}`
  }
};

const getIntegration = (id: string) => {
  if (INTEGRATION_DATA[id]) return INTEGRATION_DATA[id];
  // Generic fallback
  return {
    title: id.charAt(0).toUpperCase() + id.slice(1),
    badge: 'Integration',
    setupTime: '5 min',
    icon: Bot,
    description: 'Connect this tool to the router using standard endpoint settings.',
    config: 'Tool settings > API Configuration',
    authText: 'Bearer token or apiKey field.',
    steps: [
      { title: 'Find API settings', desc: 'Look for custom endpoint or provider settings in the tool.' },
      { title: 'Configure endpoint', desc: 'Paste the base URL and API key.' }
    ],
    snippetTitle: 'Connection values',
    snippetDesc: 'Use these values to configure the tool.',
    snippetFile: 'config.json',
    snippetCode: (baseUrl: string) => `{\n  "baseUrl": "${baseUrl}",\n  "apiKey": "sk_nry_your_api_key"\n}`
  };
};

export const IntegrationSetupPage = () => {
  const { id } = useParams<{ id: string }>();
  const { apiUrl } = useAuth();
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const integration = id ? getIntegration(id) : null;
  const safeApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const baseUrl = `${safeApiUrl}/v1`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  if (!integration) return null;

  const Icon = integration.icon;
  const mainSnippet = integration.snippetCode(baseUrl);
  const fetchSnippet = `const response = await fetch("${baseUrl}/chat/completions", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer sk_nry_your_api_key",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    model: "provider/model-id",\n    messages: [{ role: "user", content: "Say hello" }]\n  })\n});\n\nconsole.log(await response.json());`;

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20 space-y-6">
      <div className="flex items-center text-[15px] font-medium text-zinc-500 mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Overview</Link>
        <ChevronRight size={14} className="mx-2 opacity-50 text-zinc-400" />
        <span className="text-zinc-900">Integration Setup</span>
      </div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm">
            <Icon size={24} className="text-zinc-800" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{integration.title}</h1>
              <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 tracking-wide uppercase">
                {integration.badge}
              </span>
              <span className="inline-flex items-center rounded bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-600 tracking-wide">
                Setup time: {integration.setupTime}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{integration.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link 
            to="/integrations" 
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
            Back to integrations
          </Link>
          <Link 
            to="/keys" 
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Key size={16} />
            Open API Keys
          </Link>
        </div>
      </div>

      {/* 3 Config Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Base URL</div>
          <div className="flex items-center justify-between">
            <code className="text-[13px] font-semibold text-zinc-800 truncate pr-4">{baseUrl}</code>
            <button 
              onClick={() => handleCopy(baseUrl, 'baseUrl')}
              className="flex shrink-0 h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              {copiedStates['baseUrl'] ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Config</div>
          <div className="text-[13px] font-semibold text-zinc-800">{integration.config}</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 shadow-sm">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Auth</div>
          <div className="text-[13px] font-semibold text-zinc-800">{integration.authText}</div>
        </div>
      </div>

      {/* 2 Column Content */}
      <div className="grid gap-8 lg:grid-cols-12 pt-4">
        {/* Left Column: Steps */}
        <div className="lg:col-span-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Setup steps</h2>
          <div className="space-y-8">
            {integration.steps.map((step: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Snippets */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Copy-ready snippets</h2>
          
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">{integration.snippetTitle}</h3>
                <p className="text-[13px] text-zinc-500 mt-1">{integration.snippetDesc}</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-zinc-400">{integration.snippetFile}</span>
            </div>
            
            <div className="rounded-xl bg-[#0d1117] overflow-hidden border border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-[#161b22]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">JSON</span>
                <button 
                  onClick={() => handleCopy(mainSnippet, 'code')}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                >
                  {copiedStates['code'] ? (
                    <><Check size={14} className="text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[13px] leading-relaxed text-zinc-300 font-mono">
                  <code>{mainSnippet}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">OpenAI-compatible fetch example</h3>
                <p className="text-[13px] text-zinc-500 mt-1">Use this when a tool lets you test raw requests or when you want to confirm endpoint health yourself.</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-zinc-400">request.js</span>
            </div>
            
            <div className="rounded-xl bg-[#0d1117] overflow-hidden border border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-[#161b22]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">JAVASCRIPT</span>
                <button 
                  onClick={() => handleCopy(fetchSnippet, 'fetch')}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                >
                  {copiedStates['fetch'] ? (
                    <><Check size={14} className="text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[13px] leading-relaxed text-zinc-300 font-mono">
                  <code>{fetchSnippet}</code>
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
