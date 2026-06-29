import { useState, useEffect, useMemo } from 'react';
import { Activity, Box, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';
import { ProviderLogoBadge } from '../components/ProviderLogoBadge';
import { Select } from '../components/Select';
import { useAppSettings } from '../context/AppSettingsContext';

interface UsageStat {
  date: string;
  model: string;
  requests: number;
  tokens: number;
  success: number;
  total_latency_ms: number;
}

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLogoSrcForModel = (model: string) => {
  const lower = model.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9]/g, '');
  if (lower.includes('mimo')) return '/xiaomi.svg';
  if (lower.includes('mistral') || lower.includes('mixtral')) return '/minimax.svg';
  if (lower.includes('deepseek')) return '/deepseek.svg';
  if (lower.includes('kimi') || lower.includes('qwen')) return '/qwen.svg';
  if (lower.includes('claude') || normalized.includes('opus') || normalized.includes('sonnet') || normalized.includes('haiku')) return '/anthropic.svg';
  if (lower.includes('gemini')) return '/gemini.svg';
  if (lower.includes('glm')) return '/zhipu-ai.svg';
  if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3') || lower.includes('dall-e')) return '/openai.svg';
  return '/icons.svg';
};

export const UsagePage = () => {
  const { apiUrl, isAdmin, userToken } = useAuth();
  const { language } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days
  const [chartTab, setChartTab] = useState<'Requests' | 'Tokens'>('Requests');
  const [stats, setStats] = useState<UsageStat[]>([]);
  const copy =
    language === 'th'
      ? isAdmin
        ? {
            overview: 'ภาพรวม',
            title: 'ภาพรวมการใช้งานระบบ',
            description: 'ติดตามจำนวนคำขอ การใช้โทเคน และกิจกรรมของผู้ใช้ทั้งหมดในระบบ',
            ranges: {
              '1': 'วันนี้',
              '7': '7 วันที่ผ่านมา',
              '30': '30 วันที่ผ่านมา',
              '90': '90 วันที่ผ่านมา',
            },
            statLabels: {
              requests: 'คำขอทั้งหมด',
              tokens: 'โทเคนรวม',
              successRate: 'อัตราสำเร็จระบบ',
              avgLatency: 'เวลาเฉลี่ยระบบ',
            },
            chartTitle: 'แนวโน้มการใช้งานทั้งระบบ',
            lastDays: 'ย้อนหลัง',
            tabs: {
              Requests: 'คำขอ',
              Tokens: 'โทเคน',
            },
            noUsage: 'ยังไม่มีข้อมูลการใช้งานรวมในช่วงเวลานี้',
            summaryTitle: 'สรุปภาพรวมระบบ',
            summaryDescription: 'รวมผู้ใช้ทั้งหมดในช่วงเวลาที่เลือก',
            summaryRows: {
              estimatedCost: 'ค่าใช้จ่ายโดยประมาณ (PAYG)',
              totalRequests: 'จำนวนคำขอทั้งหมด',
              tokenUsage: 'การใช้โทเคนรวม',
              successRate: 'อัตราสำเร็จระบบ',
            },
            costUnavailable: 'ยังไม่พร้อมใช้งาน',
            modelUsageTitle: 'การใช้งานตามโมเดลทั้งระบบ',
            modelUsageDescription: 'จำนวนคำขอและโทเคนรวมจากผู้ใช้ทั้งหมดแยกตามโมเดล',
            noModelUsage: 'ยังไม่มีการใช้งานจากผู้ใช้ในระบบ',
            reqs: 'คำขอ',
            tok: 'โทเคน',
          }
        : {
            overview: 'ภาพรวม',
            title: 'การใช้งาน',
            description: 'ติดตามจำนวนคำขอ การใช้โทเคน และกิจกรรมของโมเดล',
            ranges: {
              '1': 'วันนี้',
              '7': '7 วันที่ผ่านมา',
              '30': '30 วันที่ผ่านมา',
              '90': '90 วันที่ผ่านมา',
            },
            statLabels: {
              requests: 'คำขอ',
              tokens: 'โทเคนที่ใช้',
              successRate: 'อัตราสำเร็จ',
              avgLatency: 'เวลาเฉลี่ย',
            },
            chartTitle: 'การใช้งานตามเวลา',
            lastDays: 'ย้อนหลัง',
            tabs: {
              Requests: 'คำขอ',
              Tokens: 'โทเคน',
            },
            noUsage: 'ไม่มีการใช้งานในช่วงเวลานี้',
            summaryTitle: 'สรุปการใช้งาน',
            summaryDescription: 'ช่วงเวลาที่เลือกอยู่ตอนนี้',
            summaryRows: {
              estimatedCost: 'ค่าใช้จ่ายโดยประมาณ (PAYG)',
              totalRequests: 'จำนวนคำขอทั้งหมด',
              tokenUsage: 'การใช้โทเคน',
              successRate: 'อัตราสำเร็จ',
            },
            costUnavailable: 'ยังไม่พร้อมใช้งาน',
            modelUsageTitle: 'การใช้งานตามโมเดล',
            modelUsageDescription: 'จำนวนคำขอและโทเคนแยกตามโมเดล',
            noModelUsage: 'ยังไม่มีการใช้งานโมเดล',
            reqs: 'คำขอ',
            tok: 'โทเคน',
          }
      : isAdmin
        ? {
            overview: 'Overview',
            title: 'System Usage',
            description: 'Monitor requests, token consumption, and activity across all users.',
            ranges: {
              '1': 'Today',
              '7': 'Last 7 Days',
              '30': 'Last 30 Days',
              '90': 'Last 90 Days',
            },
            statLabels: {
              requests: 'Total Requests',
              tokens: 'Total Tokens',
              successRate: 'System Success Rate',
              avgLatency: 'System Avg Latency',
            },
            chartTitle: 'System usage over time',
            lastDays: 'Last',
            tabs: {
              Requests: 'Requests',
              Tokens: 'Tokens',
            },
            noUsage: 'No system-wide usage in this period.',
            summaryTitle: 'System Summary',
            summaryDescription: 'Aggregated across all users for the selected period',
            summaryRows: {
              estimatedCost: 'Est. cost (PAYG)',
              totalRequests: 'Total requests',
              tokenUsage: 'Total token usage',
              successRate: 'System success rate',
            },
            costUnavailable: 'Not available',
            modelUsageTitle: 'System Model Usage',
            modelUsageDescription: 'Requests and tokens by model across all users',
            noModelUsage: 'No usage from users yet.',
            reqs: 'reqs',
            tok: 'tok',
          }
        : {
            overview: 'Overview',
            title: 'Usage',
            description: 'Monitor requests, token consumption, and model activity.',
            ranges: {
              '1': 'Today',
              '7': 'Last 7 Days',
              '30': 'Last 30 Days',
              '90': 'Last 90 Days',
            },
            statLabels: {
              requests: 'Requests',
              tokens: 'Tokens Used',
              successRate: 'Success Rate',
              avgLatency: 'Avg Latency',
            },
            chartTitle: 'Usage over time',
            lastDays: 'Last',
            tabs: {
              Requests: 'Requests',
              Tokens: 'Tokens',
            },
            noUsage: 'No usage in this period.',
            summaryTitle: 'Usage Summary',
            summaryDescription: 'Current selected period',
            summaryRows: {
              estimatedCost: 'Est. cost (PAYG)',
              totalRequests: 'Total requests',
              tokenUsage: 'Token usage',
              successRate: 'Success rate',
            },
            costUnavailable: 'Not available',
            modelUsageTitle: 'Model Usage',
            modelUsageDescription: 'Requests and tokens by model',
            noModelUsage: 'No model usage yet.',
            reqs: 'reqs',
            tok: 'tok',
          };

  const token = userToken;
  const cleanUrl = apiUrl.replace(/\/$/, '');

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const endpoint = isAdmin ? '/admin/usage_stats' : '/user/usage_stats';
        const res = await fetch(`${cleanUrl}${endpoint}?days=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || []);
        }
        setLoading(false);
      } catch (e) {
        setLoading(false);

        console.error("Failed to fetch stats", e);
      }
    };
    fetchStats();
  }, [token, cleanUrl, isAdmin, timeRange]);

  const aggregated = useMemo(() => {
    let reqs = 0, toks = 0, succ = 0, lat = 0;
    stats.forEach(s => {
      reqs += s.requests;
      toks += s.tokens;
      succ += s.success;
      lat += s.total_latency_ms;
    });
    return {
      requests: reqs,
      tokens: toks,
      successRate: reqs > 0 ? (succ / reqs) * 100 : 0,
      avgLatency: reqs > 0 ? (lat / reqs) / 1000 : 0
    };
  }, [stats]);

  const modelStats = useMemo(() => {
    const map = new Map<string, { requests: number, tokens: number, success: number }>();
    stats.forEach(s => {
      if (!map.has(s.model)) map.set(s.model, { requests: 0, tokens: 0, success: 0 });
      const m = map.get(s.model)!;
      m.requests += s.requests;
      m.tokens += s.tokens;
      m.success += s.success;
    });
    return Array.from(map.entries()).map(([model, data]) => ({ model, ...data })).sort((a, b) => b.tokens - a.tokens);
  }, [stats]);

  // Build chart data
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { requests: number, tokens: number }>();
    // Initialize last N days to 0
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDateKey(d);
      dateMap.set(dateStr, { requests: 0, tokens: 0 });
    }
    stats.forEach(s => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, { requests: 0, tokens: 0 });
      }
      const entry = dateMap.get(s.date)!;
      entry.requests += s.requests;
      entry.tokens += s.tokens;
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  }, [stats, timeRange]);

  const chartValues = useMemo(
    () => chartData.map((d) => chartTab === 'Requests' ? d.requests : d.tokens),
    [chartData, chartTab]
  );
  const hasChartData = chartValues.some((value) => value > 0);
  const chartMax = Math.max(...chartValues, 1);
  const chartPoints = useMemo(() => {
    const width = 760;
    const height = 220;
    const left = 28;
    const top = 18;
    const count = Math.max(chartData.length - 1, 1);

    return chartData.map((d, i) => {
      const value = chartTab === 'Requests' ? d.requests : d.tokens;
      const x = left + (i / count) * width;
      const y = top + height - (value / chartMax) * height;
      const labelDate = new Date(`${d.date}T00:00:00`);
      const label = timeRange > 30
        ? labelDate.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' })
        : labelDate.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric' });
      return { ...d, value, x, y, label };
    });
  }, [chartData, chartMax, chartTab, language, timeRange]);
  const chartLinePath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const chartAreaPath = chartPoints.length
    ? `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x} 238 L ${chartPoints[0].x} 238 Z`
    : '';

  const panelClass = 'app-panel rounded-[20px] p-6';
  const statCardClass = 'app-panel rounded-[16px] p-5';
  const subtlePanelClass = 'app-panel-subtle rounded-[16px]';

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20 space-y-6">
      {loading && <PageLoader />}

      {/* Breadcrumb */}
      <div className="mb-2 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-500 hover:underline transition-colors">{copy.overview}</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">{copy.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[32px] font-bold tracking-tight app-text">{copy.title}</h1>
          <p className="text-[15px] app-muted">{copy.description}</p>
        </div>
        <div>
          <Select
            value={String(timeRange)}
            onChange={(value) => setTimeRange(Number(value))}
            options={[
              { value: '1', label: copy.ranges['1'] },
              { value: '7', label: copy.ranges['7'] },
              { value: '30', label: copy.ranges['30'] },
              { value: '90', label: copy.ranges['90'] },
            ]}
            className="min-w-[170px]"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={statCardClass}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-500">
              <Activity size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col pt-1">
              <span className="mb-1 text-[13px] font-medium app-muted">{copy.statLabels.requests}</span>
              <span className="text-3xl font-bold leading-none tracking-tight app-text">{aggregated.requests.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-sky-50 text-sky-500">
              <Box size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col pt-1">
              <span className="mb-1 text-[13px] font-medium app-muted">{copy.statLabels.tokens}</span>
              <span className="text-3xl font-bold leading-none tracking-tight app-text">{aggregated.tokens >= 1000 ? `${(aggregated.tokens/1000).toFixed(1)}k` : aggregated.tokens}</span>
            </div>
          </div>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col pt-1">
              <span className="mb-1 text-[13px] font-medium app-muted">{copy.statLabels.successRate}</span>
              <span className="text-3xl font-bold leading-none tracking-tight app-text">{aggregated.successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className={statCardClass}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-orange-50 text-orange-400">
              <Clock size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col pt-1">
              <span className="mb-1 text-[13px] font-medium app-muted">{copy.statLabels.avgLatency}</span>
              <span className="text-3xl font-bold leading-none tracking-tight app-text">{aggregated.requests > 0 ? `${aggregated.avgLatency.toFixed(1)}s` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className={`${panelClass} lg:col-span-2 flex flex-col`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
            <div>
              <h2 className="text-[17px] font-bold app-text">{copy.chartTitle}</h2>
              <p className="mt-1 text-[13px] app-muted">{copy.lastDays} {timeRange} {language === 'th' ? 'วัน' : 'days'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="app-tab-group">
                <button
                  onClick={() => setChartTab('Requests')}
                  className="app-tab-button"
                  data-active={chartTab === 'Requests'}
                >
                  {copy.tabs.Requests}
                </button>
                <button
                  onClick={() => setChartTab('Tokens')}
                  className="app-tab-button"
                  data-active={chartTab === 'Tokens'}
                >
                  {copy.tabs.Tokens}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-[16px] min-h-[260px]">
            {!hasChartData ? (
               <div className={`${subtlePanelClass} flex flex-1 items-center justify-center border border-dashed`}>
                 <span className="text-[14px] font-medium app-muted">{copy.noUsage}</span>
               </div>
            ) : (
               <div className="h-[260px] rounded-[16px] border p-3" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-surface-muted)' }}>
                 <svg viewBox="0 0 820 270" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                   {[0, 1, 2, 3].map((line) => {
                     const y = 18 + (line * 220) / 3;
                     return (
                       <line
                         key={line}
                         x1="28"
                         y1={y}
                         x2="788"
                         y2={y}
                         stroke="var(--app-border)"
                         strokeWidth="1"
                       />
                     );
                   })}
                   <path d={chartAreaPath} fill="var(--app-accent-soft)" />
                   <path d={chartLinePath} fill="none" stroke="var(--app-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   {chartPoints.map((point) => (
                     <g key={point.date}>
                       <circle cx={point.x} cy={point.y} r="4" fill="var(--app-accent)" vectorEffect="non-scaling-stroke" />
                       <title>{`${point.date}: ${point.value.toLocaleString()} ${copy.tabs[chartTab]}`}</title>
                     </g>
                   ))}
                   {chartPoints.filter((_, index) => chartPoints.length <= 14 || index % Math.ceil(chartPoints.length / 8) === 0 || index === chartPoints.length - 1).map((point) => (
                     <text key={`label-${point.date}`} x={point.x} y="262" fill="var(--app-text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">
                       {point.label}
                     </text>
                   ))}
                 </svg>
               </div>
            )}
          </div>
        </div>

        <div className={`${panelClass} h-fit`}>
          <h2 className="mb-1 text-[22px] font-bold app-text">{copy.summaryTitle}</h2>
          <p className="mb-8 text-[13px] app-muted">{copy.summaryDescription}</p>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-medium app-muted">{copy.summaryRows.estimatedCost}</span>
              <span className="font-bold app-text">{copy.costUnavailable}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-medium app-muted">{copy.summaryRows.totalRequests}</span>
              <span className="font-bold app-text">{aggregated.requests.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-medium app-muted">{copy.summaryRows.tokenUsage}</span>
              <span className="font-bold app-text">{aggregated.tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-medium app-muted">{copy.summaryRows.successRate}</span>
              <span className="font-bold app-text">{aggregated.successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={panelClass}>
        <h2 className="mb-1 text-[17px] font-bold app-text">{copy.modelUsageTitle}</h2>
        <p className="mb-6 text-[13px] app-muted">{copy.modelUsageDescription}</p>
        
        {modelStats.length === 0 ? (
          <div className="flex items-center justify-center h-[120px]">
            <span className="text-[15px] font-bold app-text">{copy.noModelUsage}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {modelStats.map(m => {
                const maxTokens = Math.max(...modelStats.map(x => x.tokens), 1);
                const wPct = (m.tokens / maxTokens) * 100;
                const iconSrc = getLogoSrcForModel(m.model);
                
                return (
                  <div key={m.model} className={`${subtlePanelClass} flex items-center gap-4 border p-4 py-2`}>
                    <ProviderLogoBadge src={iconSrc} alt={m.model} />
                    <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-center mb-2">
                         <span className="truncate text-[14px] font-bold app-text" title={m.model}>{m.model}</span>
                         <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold app-text">{m.requests} {copy.reqs}</span>
                            <span className="text-[13px] app-muted">{m.tokens >= 1000 ? `${(m.tokens/1000).toFixed(1)}k` : m.tokens} {copy.tok}</span>
                         </div>
                       </div>
                       <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--app-border)' }}>
                         <div className="h-full rounded-full bg-blue-500" style={{ width: `${wPct}%` }}></div>
                       </div>
                    </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
};
