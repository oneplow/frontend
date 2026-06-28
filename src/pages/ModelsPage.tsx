import { Copy, Image as ImageIcon, Loader2, Search, ChevronRight, Type } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Select } from '../components/Select';
import { PageLoader } from '../components/PageLoader';
import { ProviderLogoBadge } from '../components/ProviderLogoBadge';
import { useAppSettings } from '../context/AppSettingsContext';
const STATIC_MODELS = [
  {
    id: 'mimo-v2.5-free',
    tier: 'Standard',
    access: 'Stable',
    vision: true,
    text: false,
    free: false,
    notEligible: false,
    multiplier: '4x',
    inputRp: '563',
    inputUsd: '0.03',
    cacheRp: '0',
    cacheUsd: '0',
    outputRp: '1.501',
    outputUsd: '0.08',
    context: '1M',
    brand: 'mimo'
  },
  {
    id: 'mimo-v2.5-pro-free',
    tier: 'Standard',
    access: 'Stable',
    vision: false,
    text: true,
    free: true,
    notEligible: true,
    multiplier: '1.5x',
    inputRp: '2.331',
    inputUsd: '0.13',
    cacheRp: '19',
    cacheUsd: '0',
    outputRp: '4.662',
    outputUsd: '0.26',
    context: '1M',
    brand: 'mimo'
  },
  {
    id: 'mistral-large',
    tier: 'Standard',
    access: 'Stable',
    vision: false,
    text: true,
    free: false,
    notEligible: false,
    multiplier: '',
    inputRp: '886',
    inputUsd: '0.05',
    cacheRp: '89',
    cacheUsd: '0',
    outputRp: '2.659',
    outputUsd: '0.15',
    context: '252K',
    brand: 'mistral'
  },
  {
    id: 'deepseek-v4-flash-naraya',
    tier: 'Advanced',
    access: 'Beta',
    vision: false,
    text: true,
    free: false,
    notEligible: false,
    multiplier: '1.6x',
    inputRp: '480',
    inputUsd: '0.03',
    cacheRp: '107',
    cacheUsd: '0.01',
    outputRp: '959',
    outputUsd: '0.05',
    context: '1M',
    brand: 'deepseek'
  },
  {
    id: 'deepseek-v4-pro-naraya',
    tier: 'Advanced',
    access: 'Beta',
    vision: false,
    text: true,
    free: false,
    notEligible: false,
    multiplier: '2x',
    inputRp: '1.546',
    inputUsd: '0.09',
    cacheRp: '13',
    cacheUsd: '0',
    outputRp: '3.091',
    outputUsd: '0.17',
    context: '1M',
    brand: 'deepseek'
  },
  {
    id: 'kimi-k2.7-code',
    tier: 'Pro',
    access: 'Beta',
    vision: true,
    text: false,
    free: false,
    notEligible: false,
    multiplier: '2x',
    inputRp: '6.585',
    inputUsd: '0.37',
    cacheRp: '1.335',
    cacheUsd: '0.07',
    outputRp: '31.145',
    outputUsd: '1.74',
    context: '262K',
    brand: 'kimi'
  },
  {
    id: 'claude-sonnet-4.6',
    tier: 'Pro',
    access: 'Beta',
    vision: false,
    text: true,
    free: true,
    notEligible: true,
    multiplier: '1.5x',
    inputRp: '5.336',
    inputUsd: '0.3',
    cacheRp: '534',
    cacheUsd: '0.03',
    outputRp: '26.679',
    outputUsd: '1.49',
    context: '1M',
    brand: 'anthropic'
  },
  {
    id: 'gemini-3-flash',
    tier: 'Pro',
    access: 'Beta',
    vision: true,
    text: false,
    free: false,
    notEligible: false,
    multiplier: '1.2x',
    inputRp: '5.339',
    inputUsd: '0.3',
    cacheRp: '534',
    cacheUsd: '0.03',
    outputRp: '32.035',
    outputUsd: '1.79',
    context: '1M',
    brand: 'google'
  },
  {
    id: 'glm-5.2',
    tier: 'Pro',
    access: 'Beta',
    vision: false,
    text: true,
    free: false,
    notEligible: false,
    multiplier: '2x',
    inputRp: '12.458',
    inputUsd: '0.7',
    cacheRp: '2.314',
    cacheUsd: '0.13',
    outputRp: '39.154',
    outputUsd: '2.19',
    context: '1M',
    brand: 'zhipu'
  }
];

const STATIC_MODELS_MAP = Object.fromEntries(STATIC_MODELS.map(m => [m.id, m]));

interface ApiModel {
  id: string;
  label?: string;
}

const getBrandIcon = (brand: string) => {
  switch (brand) {
    case 'mimo':
      return <ProviderLogoBadge src="/xiaomi.svg" alt="Xiaomi" />;
    case 'mistral':
      return <ProviderLogoBadge src="/minimax.svg" alt="Mistral" />;
    case 'deepseek':
      return <ProviderLogoBadge src="/deepseek.svg" alt="DeepSeek" />;
    case 'kimi':
      return <ProviderLogoBadge src="/qwen.svg" alt="Kimi" />;
    case 'anthropic':
      return <ProviderLogoBadge src="/anthropic.svg" alt="Anthropic" />;
    case 'google':
      return <ProviderLogoBadge src="/gemini.svg" alt="Google" />;
    case 'zhipu':
      return <ProviderLogoBadge src="/zhipu-ai.svg" alt="Zhipu" />;
    case 'openai':
      return <ProviderLogoBadge src="/openai.svg" alt="OpenAI" />;
    default:
      return <ProviderLogoBadge alt="Model" />;
  }
};

export const ModelsPage = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [models, setModels] = useState<ApiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl } = useAuth();
  const { language } = useAppSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const copy =
    language === 'th'
      ? {
          overview: 'ภาพรวม',
          title: 'โมเดล',
          description: 'สำรวจและจัดการสิทธิ์การเข้าถึงโมเดลสำหรับ API key ของคุณ',
          searchPlaceholder: 'ค้นหาโมเดล...',
          allClasses: 'ทุกคลาส',
          allStatuses: 'ทุกสถานะ',
          noModels: 'ไม่พบโมเดลจาก API',
          table: {
            model: 'โมเดล',
            class: 'คลาส',
            status: 'สถานะ',
            context: 'คอนเท็กซ์',
          },
          badges: {
            free: 'ฟรี',
            notEligible: 'ไม่รองรับ',
            vision: 'ภาพ',
            text: 'ข้อความ',
          },
          copyModelId: 'คัดลอก Model ID',
          copied: 'คัดลอกแล้ว',
        }
      : {
          overview: 'Overview',
          title: 'Models',
          description: 'Explore and manage model access for your API keys.',
          searchPlaceholder: 'Search models...',
          allClasses: 'All Classes',
          allStatuses: 'All Statuses',
          noModels: 'No models found from the API.',
          table: {
            model: 'Model',
            class: 'Class',
            status: 'Status',
            context: 'Context',
          },
          badges: {
            free: 'FREE',
            notEligible: 'Not eligible',
            vision: 'Vision',
            text: 'Text',
          },
          copyModelId: 'Copy model ID',
          copied: 'Copied',
        };
  useEffect(() => {
    let cancelled = false;
    const fetchModels = async () => {
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/v1/models`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            // Sort to ensure a consistent display order, mostly by tier/name if possible
            setModels(data.data || []);
          }
        }
      } catch (e) {
        console.error('Failed to fetch models', e);
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

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredModels = models.filter(m => {
    const matchesSearch = m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const meta = STATIC_MODELS_MAP[m.id] || { tier: 'Advanced', access: 'Beta' };
    const matchesTier = tierFilter === 'all' || meta.tier === tierFilter;
    const matchesAccess = accessFilter === 'all' || meta.access === accessFilter;
    return matchesSearch && matchesTier && matchesAccess;
  });

  const panelClass = 'app-panel overflow-hidden rounded-xl';

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20">
      {loading && <PageLoader />}

      <div className="mb-6 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">{copy.overview}</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">{copy.title}</span>
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight app-text">{copy.title}</h1>
        <p className="text-sm app-muted">{copy.description}</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 app-muted" />
          <input 
            type="text" 
            placeholder={copy.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="app-input-field w-full rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={tierFilter} 
            onChange={setTierFilter}
            options={[
              { label: copy.allClasses, value: 'all' },
              { label: 'Standard', value: 'Standard' },
              { label: 'Advanced', value: 'Advanced' },
              { label: 'Pro', value: 'Pro' }
            ]} 
          />
          <Select 
            value={accessFilter} 
            onChange={setAccessFilter}
            options={[
              { label: copy.allStatuses, value: 'all' },
              { label: 'Stable', value: 'Stable' },
              { label: 'Beta', value: 'Beta' }
            ]} 
          />
        </div>
      </div>

      <div className={panelClass}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 app-muted">
            <Loader2 size={24} className="mb-3 animate-spin" />
            
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium app-muted">
            {copy.noModels}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr
                  className="text-[10px] font-bold uppercase tracking-widest app-muted"
                  style={{
                    borderBottom: '1px solid var(--app-border)',
                    backgroundColor: 'var(--app-surface-muted)',
                  }}
                >
                  <th className="px-6 py-4">{copy.table.model}</th>
                  <th className="px-6 py-4">{copy.table.class}</th>
                  <th className="px-6 py-4">{copy.table.status}</th>
                  <th className="px-6 py-4 text-right">{copy.table.context}</th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--app-surface)' }}>
                {filteredModels.map((apiModel) => {
                  const modelId = apiModel.id;
                  let meta = STATIC_MODELS_MAP[modelId];

                  if (!meta) {
                    const lower = modelId.toLowerCase();
                    let inferredBrand = 'generic';
                    if (lower.includes('deepseek')) inferredBrand = 'deepseek';
                    else if (lower.includes('gemini')) inferredBrand = 'google';
                    else if (lower.includes('claude')) inferredBrand = 'anthropic';
                    else if (lower.includes('kimi')) inferredBrand = 'kimi';
                    else if (lower.includes('gpt')) inferredBrand = 'openai';
                    else if (lower.includes('mistral') || lower.includes('mixtral')) inferredBrand = 'mistral';
                    else if (lower.includes('mimo')) inferredBrand = 'mimo';
                    else if (lower.includes('glm')) inferredBrand = 'zhipu';
                    else if (lower.includes('qwen')) inferredBrand = 'kimi'; // Using Kimi logo for Qwen as requested

                    meta = {
                      id: modelId,
                      tier: 'Advanced',
                      access: 'Beta',
                      vision: lower.includes('vision'),
                      text: !lower.includes('vision'),
                      free: false,
                      notEligible: false,
                      multiplier: '',
                      inputRp: '-',
                      inputUsd: '-',
                      cacheRp: '-',
                      cacheUsd: '-',
                      outputRp: '-',
                      outputUsd: '-',
                      context: 'Unknown',
                      brand: inferredBrand
                    };
                  }

                  return (
                    <tr
                      key={modelId}
                      className="group transition-colors"
                      style={{ borderBottom: '1px solid var(--app-border)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--app-surface-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {getBrandIcon(meta.brand)}
                          <code className="text-[13px] font-semibold app-text">{modelId}</code>
                          <button
                            onClick={() => handleCopy(modelId)}
                            className="relative opacity-0 transition-colors group-hover:opacity-100 app-muted hover:text-[var(--app-text)]"
                            title={copy.copyModelId}
                          >
                            <Copy size={14} />
                            {copiedId === modelId && (
                              <span
                                className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded px-2 py-1 text-[10px] font-medium text-white shadow-sm"
                                style={{ backgroundColor: 'var(--app-text)' }}
                              >
                                {copy.copied}
                              </span>
                            )}
                          </button>
                          
                          <div className="flex items-center gap-1.5 ml-1">
                            {meta.free && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-500" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                                {copy.badges.free}
                              </span>
                            )}
                            {meta.notEligible && (
                              <span className="inline-flex items-center text-[10px] font-bold text-amber-500 tracking-wide">
                                {copy.badges.notEligible}
                              </span>
                            )}
                            {meta.vision && (
                              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-cyan-500" style={{ backgroundColor: 'rgba(34, 211, 238, 0.12)' }}>
                                <ImageIcon size={10} strokeWidth={3} />
                                {copy.badges.vision}
                              </span>
                            )}
                            {meta.text && (
                              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide app-text" style={{ backgroundColor: 'var(--app-surface-muted)' }}>
                                <Type size={10} strokeWidth={3} />
                                {copy.badges.text}
                              </span>
                            )}
                            {meta.multiplier && (
                              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-500" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                                {meta.multiplier}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold text-cyan-500" style={{ backgroundColor: 'rgba(34, 211, 238, 0.12)' }}>
                          {meta.tier}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold text-blue-500" style={{ backgroundColor: 'rgba(59, 130, 246, 0.14)' }}>
                          {meta.access}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-[13px] font-medium app-muted">{meta.context}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
