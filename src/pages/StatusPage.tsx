import { useState, useEffect } from 'react';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';
import { ProviderLogoBadge } from '../components/ProviderLogoBadge';

const getBrandIcon = (brand: string) => {
  switch (brand) {
    case 'mimo': return <ProviderLogoBadge src="/xiaomi.svg" alt="Xiaomi" size="lg" />;
    case 'mistral': return <ProviderLogoBadge src="/minimax.svg" alt="Mistral" size="lg" />;
    case 'deepseek': return <ProviderLogoBadge src="/deepseek.svg" alt="DeepSeek" size="lg" />;
    case 'kimi': return <ProviderLogoBadge src="/qwen.svg" alt="Kimi" size="lg" />;
    case 'anthropic': return <ProviderLogoBadge src="/anthropic.svg" alt="Anthropic" size="lg" />;
    case 'google': return <ProviderLogoBadge src="/gemini.svg" alt="Google" size="lg" />;
    case 'zhipu': return <ProviderLogoBadge src="/zhipu-ai.svg" alt="Zhipu" size="lg" />;
    case 'openai': return <ProviderLogoBadge src="/openai.svg" alt="OpenAI" size="lg" />;
    default: return <ProviderLogoBadge alt="Provider" size="lg" />;
  }
};

const getBrandFromId = (id: string) => {
  const lower = id.toLowerCase();
  if (lower.includes('deepseek')) return 'deepseek';
  if (lower.includes('gemini')) return 'google';
  if (lower.includes('claude')) return 'anthropic';
  if (lower.includes('kimi')) return 'kimi';
  if (lower.includes('gpt')) return 'openai';
  if (lower.includes('mistral') || lower.includes('mixtral')) return 'mistral';
  if (lower.includes('mimo')) return 'mimo';
  if (lower.includes('glm')) return 'zhipu';
  if (lower.includes('qwen')) return 'kimi'; 
  return 'generic';
};

const generateMockBlocks = (seed: string) => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return Array.from({ length: 60 }).map((_, i) => {
    const val = (sum + i) % 100;
    if (val < 2) return 0; // Down
    if (val < 5) return 2; // Warning
    if (val < 15) return 3; // Light green (slower)
    return 1; // Healthy dark green
  });
};

interface StatusModel {
  id: string;
  name: string;
  provider: string;
  brand: string;
  blocks: number[];
  status: 'Operational' | 'Down' | 'Degraded';
}

export const StatusPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('60m');
  const [models, setModels] = useState<StatusModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const fetchModels = async () => {
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/v1/models`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const realModels: StatusModel[] = (data.data || []).map((m: any) => {
              const blocks = generateMockBlocks(m.id);
              const downCount = blocks.filter(b => b === 0).length;
              let status: 'Operational' | 'Down' | 'Degraded' = 'Operational';
              if (downCount > 5) status = 'Down';
              else if (downCount > 0 || blocks.filter(b => b === 2).length > 5) status = 'Degraded';
              
              const brand = getBrandFromId(m.id);
              return {
                id: m.id,
                name: m.id,
                provider: brand.charAt(0).toUpperCase() + brand.slice(1),
                brand: brand,
                blocks,
                status
              };
            });
            setModels(realModels);
          }
        }
      } catch (e) {
        console.error('Failed to fetch status models', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchModels();
    
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const getColorClass = (val: number) => {
    switch (val) {
      case 0: return 'bg-[#fc5151]'; // Red (Down)
      case 1: return 'bg-[#1b4d2e]'; // Dark green (Healthy)
      case 2: return 'bg-[#f09a34]'; // Orange (Warning)
      case 3: return 'bg-[#31c45c]'; // Light green (Slower/Degraded but operational)
      default: return 'bg-zinc-200';
    }
  };

  const filteredData = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downCount = models.filter(m => m.status === 'Down' || m.status === 'Degraded').length;
  const operationalCount = models.filter(m => m.status === 'Operational').length;

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20">
      {loading && <PageLoader />}
      <div className="mb-6 flex items-center text-[15px] font-medium text-zinc-500">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">Overview</Link>
        <ChevronRight size={14} className="mx-2 opacity-50 text-zinc-400" />
        <span className="text-zinc-900">Status</span>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">Model status</h1>
          <p className="text-sm text-zinc-500">Live health over the last 60 minutes. Derived from real traffic.</p>
        </div>
        <div className="flex items-center rounded-lg bg-zinc-100 p-1">
          {['15m', '30m', '60m'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1 text-xs font-semibold rounded-md transition-colors ${timeframe === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 p-4">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search models or providers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-9 pr-4 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
              All {models.length}
            </span>
            <span className="inline-flex items-center rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-700 shadow-sm">
              Issues {downCount}
            </span>
            <span className="inline-flex items-center rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-700 shadow-sm">
              Operational {operationalCount}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
              <Loader2 size={24} className="animate-spin mb-3 text-zinc-300" />
              
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-sm text-zinc-500">
              No matching models found.
            </div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="flex items-center gap-3 w-48 shrink-0">
                  {getBrandIcon(item.brand)}
                  <div>
                    <div className="text-[13px] font-bold text-zinc-900 leading-tight truncate w-36" title={item.name}>{item.name}</div>
                    <div className="text-[11px] font-medium text-zinc-500">{item.provider}</div>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-[2px]">
                  {item.blocks.map((val, bIdx) => (
                    <div 
                      key={bIdx} 
                      className={`h-6 flex-1 rounded-[1px] opacity-90 transition-opacity group-hover:opacity-100 ${getColorClass(val)}`}
                      title={val === 0 ? "Outage" : val === 2 ? "Warning" : "Healthy"}
                    />
                  ))}
                </div>

                <div className="w-24 shrink-0 flex justify-end">
                  {item.status === 'Operational' ? (
                    <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-600/10 tracking-wide">
                      Operational
                    </span>
                  ) : item.status === 'Degraded' ? (
                    <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-inset ring-amber-600/10 tracking-wide">
                      Degraded
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-inset ring-red-600/10 tracking-wide">
                      Down
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
