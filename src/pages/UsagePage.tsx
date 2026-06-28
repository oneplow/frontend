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

export const UsagePage = () => {
  const { apiUrl, isAdmin, adminKey, userToken } = useAuth();
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

  const token = isAdmin ? adminKey : userToken;
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
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { requests: 0, tokens: 0 });
    }
    stats.forEach(s => {
      if (dateMap.has(s.date)) {
        const entry = dateMap.get(s.date)!;
        entry.requests += s.requests;
        entry.tokens += s.tokens;
      }
    });
    return Array.from(dateMap.entries()).map(([date, data]) => ({ date, ...data }));
  }, [stats, timeRange]);

  const panelClass = 'app-panel rounded-[20px] p-6';
  const statCardClass = 'app-panel rounded-[16px] p-5';
  const subtlePanelClass = 'app-panel-subtle rounded-[16px]';

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6 pb-20 space-y-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
          <div className="mt-4 flex-1 rounded-[16px] min-h-[300px] flex items-end justify-between items-stretch gap-1">
            {chartData.length === 0 ? (
               <div className={`${subtlePanelClass} flex flex-1 items-center justify-center border border-dashed`}>
                 <span className="text-[14px] font-medium app-muted">{copy.noUsage}</span>
               </div>
            ) : (
               <div className="flex-1 flex items-end justify-between h-[250px] relative px-4 pb-6 mt-10">
                 {(() => {
                    const maxVal = Math.max(...chartData.map(d => chartTab === 'Requests' ? d.requests : d.tokens), 1);
                    return chartData.map((d, i) => {
                      const val = chartTab === 'Requests' ? d.requests : d.tokens;
                      const hPct = (val / maxVal) * 100;
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 group">
                          <div className="w-full flex-1 flex flex-col justify-end px-0.5">
                            <div
                              className="relative w-full rounded-t-sm transition-all group-hover:bg-blue-400"
                              style={{ height: `${Math.max(2, hPct)}%`, backgroundColor: 'var(--app-accent-soft)' }}
                            >
                              <div
                                className="app-panel absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] opacity-0 transition-opacity pointer-events-none group-hover:opacity-100"
                              >
                                {val.toLocaleString()} {copy.tabs[chartTab]}
                                <div className="mt-0.5 text-[9px] app-muted">{d.date}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    });
                 })()}
               </div>
            )}
          </div>
        </div>

        <div className={panelClass}>
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
                let iconSrc = "/icons.svg";
                if (m.model.toLowerCase().includes('mimo')) iconSrc = "/xiaomi.svg";
                else if (m.model.toLowerCase().includes('mistral')) iconSrc = "/minimax.svg";
                else if (m.model.toLowerCase().includes('deepseek')) iconSrc = "/deepseek.svg";
                
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
