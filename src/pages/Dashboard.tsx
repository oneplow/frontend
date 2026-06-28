import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Box,
  Clock,
  Copy,
  Check,
  ChevronDown,
  Users,
  TerminalSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';
import { ProviderLogoBadge } from '../components/ProviderLogoBadge';
import { useAppSettings } from '../context/AppSettingsContext';

interface HealthData {
  status: string;
  reasons: string[];
  fresh_accounts?: number;
  harvest_success_rate?: number | null;
  send_success_rate?: number | null;
  seconds_since_harvest?: number | null;
  seconds_since_send?: number | null;
  counters?: Record<string, number>;
  recent_errors?: { where: string; error: string }[];
  warm_accounts?: number;
  pool_target?: number;
}

interface TokenInfo {
  token_limit: number | null;
  tokens_used: number;
}

interface ApiKey {
  key: string;
  name: string | null;
  created_at: number;
  expires_at: number | null;
  rpm_limit: number | null;
  allowed_models: string | null;
  token_limit?: number | null;
  tokens_used?: number | null;
}

interface RequestLog {
  id: string;
  username?: string;
  model: string;
  is_success: boolean;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  created_at: number;
}

interface DashboardStreamPayload extends HealthData {
  dashboard?: {
    mode: 'admin' | 'user';
    key_count: number | null;
    user_count: number | null;
    token_info: TokenInfo | null;
  } | null;
}

interface TimePoint {
  time: Date;
  sendOk: number;
  sendFail: number;
  harvestOk: number;
  harvestFail: number;
}

type DashboardChartRange = '7D' | '30D' | '90D';

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.style.position = 'absolute';
  textArea.style.left = '-999999px';
  document.body.prepend(textArea);
  textArea.select();
  document.execCommand('copy');
  textArea.remove();
};

const maskApiKey = (key: string) => {
  if (!key) return '';
  if (key.length <= 11) return key;
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
};

const isKeyExpired = (expiresAt: number | null) => Boolean(expiresAt && Date.now() / 1000 > expiresAt);

const getLogoSrcForModel = (model: string) => {
  const lower = model.toLowerCase();
  if (lower.includes('mimo')) return '/xiaomi.svg';
  if (lower.includes('mistral') || lower.includes('mixtral')) return '/minimax.svg';
  if (lower.includes('deepseek')) return '/deepseek.svg';
  if (lower.includes('kimi') || lower.includes('qwen')) return '/qwen.svg';
  if (lower.includes('claude')) return '/anthropic.svg';
  if (lower.includes('gemini')) return '/gemini.svg';
  if (lower.includes('glm')) return '/zhipu-ai.svg';
  if (lower.includes('gpt')) return '/openai.svg';
  return '';
};

const formatRelativeTime = (timestamp: number, language: 'en' | 'th') => {
  const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
  if (diffSeconds < 60) {
    return language === 'th' ? 'เมื่อสักครู่' : 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return language === 'th' ? `${diffMinutes} นาทีที่แล้ว` : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return language === 'th' ? `${diffHours} ชั่วโมงที่แล้ว` : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return language === 'th' ? `${diffDays} วันที่แล้ว` : `${diffDays} days ago`;
};

export const Dashboard = () => {
  const { isAdmin, username, apiUrl, adminKey, userToken } = useAuth();
  const { language } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [chartRange, setChartRange] = useState<DashboardChartRange>('7D');
  const [, setHistory] = useState<TimePoint[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const prevCounters = useRef<Record<string, number> | null>(null);

  const cleanUrl = apiUrl.replace(/\/$/, '');
  const authToken = isAdmin ? adminKey : userToken;

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    const startStream = async () => {
      try {
        const res = await fetch(`${cleanUrl}/health/stream`, {
          signal: abortController.signal,
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });

        if (!res.body) return;
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; 

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const jsonStr = part.slice(6);
              if (jsonStr.trim() === '[DONE]') continue;
              
              try {
                const data: DashboardStreamPayload = JSON.parse(jsonStr);
                setHealth(data);
                if (data.dashboard?.token_info) {
                  setTokenInfo(data.dashboard.token_info);
                }
                setLoading(false);

                const counters = data.counters || {};
                const now = new Date();

                if (prevCounters.current) {
                  const prev = prevCounters.current;
                  const point: TimePoint = {
                    time: now,
                    sendOk: Math.max(0, (counters.send_ok || 0) - (prev.send_ok || 0)),
                    sendFail: Math.max(0, (counters.send_fail || 0) - (prev.send_fail || 0)),
                    harvestOk: Math.max(0, (counters.harvest_ok || 0) - (prev.harvest_ok || 0)),
                    harvestFail: Math.max(0, (counters.harvest_fail || 0) - (prev.harvest_fail || 0))
                  };
                  setHistory((h) => [...h.slice(-59), point]);
                }
                prevCounters.current = { ...counters };

              } catch (e) {
                console.error("Failed to parse SSE JSON", e);
                setLoading(false);
              }
            }
          }
        }
      } catch (e: any) {
        setLoading(false);
        if (e.name !== 'AbortError') {
          console.error("SSE Stream error:", e);
          if (active) {
            setTimeout(() => {
              if (active) startStream();
            }, 5000);
          }
        }
      }
    };

    startStream();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [cleanUrl, authToken]);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let cancelled = false;

    const fetchDashboardSupportData = async () => {
      try {
        const keyEndpoint = isAdmin ? '/admin/keys' : '/user/keys';
        const logsEndpoint = isAdmin ? '/admin/logs?limit=10' : '/user/logs?limit=10';
        const usageEndpoint = isAdmin ? '/admin/usage_stats?days=90' : '/user/usage_stats?days=90';

        const [keysRes, modelsRes, logsRes, usageRes] = await Promise.all([
          fetch(`${cleanUrl}${keyEndpoint}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${cleanUrl}/v1/models`),
          fetch(`${cleanUrl}${logsEndpoint}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${cleanUrl}${usageEndpoint}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        if (!cancelled && keysRes.ok) {
          const data = await keysRes.json();
          const fetchedKeys = isAdmin ? data.keys || [] : data.key ? [data.key] : [];
          setApiKeys(fetchedKeys);
        }

        if (!cancelled && modelsRes.ok) {
          const data = await modelsRes.json();
          setAvailableModels((data.data || []).map((model: { id: string }) => model.id));
        }

        if (!cancelled && logsRes.ok) {
          const data = await logsRes.json();
          setRecentLogs((data.logs || []).sort((a: RequestLog, b: RequestLog) => b.created_at - a.created_at));
        }

        if (!cancelled && usageRes.ok) {
          const data = await usageRes.json();
          setUsageStats(data.stats || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard support data', error);
      }
    };

    fetchDashboardSupportData();

    return () => {
      cancelled = true;
    };
  }, [authToken, cleanUrl, isAdmin]);

  const handleCopy = async (value: string, field: string) => {
    if (!value) return;

    try {
      await copyToClipboard(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1800);
    } catch (error) {
      console.error('Failed to copy value', error);
    }
  };

  const counters = health?.counters || {};
  const dashboardMeta = (health as DashboardStreamPayload | null)?.dashboard ?? null;
  const totalSendOk = counters.send_ok || 0;
  const totalSendFail = counters.send_fail || 0;
  const totalRequests = totalSendOk + totalSendFail;
  const successRate = health?.send_success_rate != null ? Math.round(health.send_success_rate * 100) : null;
  const successDisplay = successRate !== null ? `${successRate}.0%` : '0.0%';
  const averageLatencySeconds =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / recentLogs.length / 1000
      : null;
  const recentErrorCount = health?.recent_errors?.length ?? 0;
  const readyAccounts = health?.warm_accounts ?? health?.fresh_accounts ?? null;
  const adminUserCount = dashboardMeta?.user_count;
  const adminKeyCount = dashboardMeta?.key_count ?? apiKeys.length;
  const errorLabel = language === 'th' ? 'ผิดพลาด' : 'Error';
  
  const tokenLimitStr = tokenInfo?.token_limit === null ? 'Unlimited' : (tokenInfo?.token_limit ? `${(tokenInfo.token_limit / 1000000).toFixed(0)}M` : '0');
  const tokensUsedPct = tokenInfo?.token_limit ? ((tokenInfo.tokens_used || 0) / tokenInfo.token_limit) * 100 : 0;
  const copy =
    language === 'th'
      ? {
          greeting: `สวัสดีตอนเช้า, ${username || 'ผู้ใช้'}!`,
          subtitle: 'นี่คือภาพรวมการใช้งาน API ของคุณสำหรับวันนี้',
          remainingTokens: 'โทเคนคงเหลือ',
          unlimited: 'ไม่จำกัด',
          requestsToday: 'คำขอวันนี้',
          successRate: 'อัตราสำเร็จ',
          avgLatency: 'เวลาเฉลี่ย',
          stable: 'เสถียร',
          moderate: 'ปานกลาง',
          usageTrend: 'แนวโน้มการใช้งาน',
          tokenUsageOverTime: 'การใช้โทเคนตามช่วงเวลา',
          quickStart: 'เริ่มต้นอย่างรวดเร็ว',
          quickStartDesc: 'เริ่มส่งคำขอได้ภายในไม่กี่วินาที',
          apiEndpoint: 'API Endpoint',
          apiKey: 'API Key',
          model: 'โมเดล',
          fullKeyVisibleOnce: 'ระบบจะแสดงคีย์เต็มเพียงครั้งเดียวตอนสร้าง',
          copyCurl: 'คัดลอก cURL',
          viewIntegrations: 'ดู Integrations',
          modelUsage: 'การใช้งานโมเดล',
          requestsAndTokens: 'จำนวนคำขอและโทเคนแยกตามโมเดล',
          recentRequests: 'คำขอล่าสุด',
          latestRequests: 'คำขอ API ล่าสุด',
          viewAll: 'ดูทั้งหมด',
          success: 'สำเร็จ',
          ofTokens: 'จาก',
          vsYesterday: '+1 เทียบกับเมื่อวาน',
          copied: 'คัดลอกแล้ว',
          noApiKey: 'ยังไม่มี API key',
          noModel: 'ยังไม่มีโมเดล',
          createKeyFirst: 'สร้าง API key ก่อนเพื่อใช้งาน Quick Start',
          noModelUsage: 'ยังไม่มีข้อมูลการใช้งานโมเดล',
          noRecentRequests: 'ยังไม่มีคำขอล่าสุด',
          allModels: 'ทุกโมเดล',
          unavailable: 'ไม่พร้อมใช้งาน',
        }
      : {
          greeting: `Good morning, ${username || 'user'}!`,
          subtitle: "Here's your API usage overview for today.",
          remainingTokens: 'Remaining Tokens',
          unlimited: 'Unlimited',
          requestsToday: 'Requests Today',
          successRate: 'Success Rate',
          avgLatency: 'Avg Latency',
          stable: 'Stable',
          moderate: 'Moderate',
          usageTrend: 'Usage Trend',
          tokenUsageOverTime: 'Token usage over time',
          quickStart: 'Quick Start',
          quickStartDesc: 'Start making requests in seconds.',
          apiEndpoint: 'API Endpoint',
          apiKey: 'API Key',
          model: 'Model',
          fullKeyVisibleOnce: 'Full key is shown only once when created.',
          copyCurl: 'Copy cURL',
          viewIntegrations: 'View Integrations',
          modelUsage: 'Model Usage',
          requestsAndTokens: 'Requests and tokens by model',
          recentRequests: 'Recent Requests',
          latestRequests: 'Latest API requests',
          viewAll: 'View all',
          success: 'Success',
          ofTokens: 'of',
          vsYesterday: '+1 vs yesterday',
          copied: 'Copied',
          noApiKey: 'No API key yet',
          noModel: 'No model available',
          createKeyFirst: 'Create an API key first to use Quick Start',
          noModelUsage: 'No real model usage yet',
          noRecentRequests: 'No recent requests yet',
          allModels: 'All models',
          unavailable: 'Unavailable',
        };

  const adminCopy =
    language === 'th'
      ? {
          greeting: 'ภาพรวมระบบผู้ดูแล',
          subtitle: 'ตรวจสอบผู้ใช้ คีย์ และคำขอทั้งหมดของระบบแบบเรียลไทม์',
          users: 'ผู้ใช้ทั้งหมด',
          apiKeys: 'API Keys ทั้งหมด',
          totalRequests: 'คำขอทั้งหมด',
          systemSuccessRate: 'อัตราสำเร็จระบบ',
          adminControls: 'เครื่องมือผู้ดูแล',
          adminControlsDesc: 'จัดการการเข้าถึงและติดตามสถานะระบบจากจุดเดียว',
          systemStatus: 'สถานะระบบ',
          recentErrors: 'ข้อผิดพลาดล่าสุด',
          readyAccounts: 'บัญชีพร้อมใช้งาน',
          healthy: 'ปกติ',
          attention: 'ต้องตรวจสอบ',
          manageKeys: 'จัดการ Keys',
          manageUsers: 'จัดการ Users',
          openStatus: 'ดู Status',
          modelUsage: 'การใช้งานโมเดลทั้งระบบ',
          requestsAndTokens: 'จำนวนคำขอและโทเคนรวมจากผู้ใช้ทั้งหมดแยกตามโมเดล',
          recentRequests: 'คำขอล่าสุดทั้งระบบ',
          latestRequests: 'คำขอ API ล่าสุดจากผู้ใช้ทั้งหมด',
          noModelUsage: 'ยังไม่มีการใช้งานทั้งระบบ',
          noRecentRequests: 'ยังไม่มีคำขอล่าสุดของระบบ',
          userLabel: 'ผู้ใช้',
          unknownUser: 'ไม่ทราบผู้ใช้',
        }
      : {
          greeting: 'Admin System Overview',
          subtitle: 'Monitor users, API keys, and all requests across the platform in real time.',
          users: 'Total Users',
          apiKeys: 'API Keys',
          totalRequests: 'Total Requests',
          systemSuccessRate: 'System Success Rate',
          adminControls: 'Admin Controls',
          adminControlsDesc: 'Manage access and monitor system health from one place.',
          systemStatus: 'System Status',
          recentErrors: 'Recent Errors',
          readyAccounts: 'Ready Accounts',
          healthy: 'Healthy',
          attention: 'Needs Attention',
          manageKeys: 'Manage Keys',
          manageUsers: 'Manage Users',
          openStatus: 'Open Status',
          modelUsage: 'System Model Usage',
          requestsAndTokens: 'Requests and tokens aggregated across all users',
          recentRequests: 'Recent Global Requests',
          latestRequests: 'Latest API requests across all users',
          noModelUsage: 'No system-wide model usage yet.',
          noRecentRequests: 'No recent global requests yet.',
          userLabel: 'User',
          unknownUser: 'Unknown user',
        };

  const preferredApiKey = useMemo(() => {
    if (apiKeys.length === 0) return null;

    const sortedKeys = [...apiKeys].sort((a, b) => b.created_at - a.created_at);
    const firstActiveKey = sortedKeys.find((key) => !isKeyExpired(key.expires_at));
    return firstActiveKey || sortedKeys[0];
  }, [apiKeys]);

  const quickStartModel = useMemo(() => {
    const allowedModels = preferredApiKey?.allowed_models
      ?.split(',')
      .map((model) => model.trim())
      .filter(Boolean) || [];

    if (allowedModels.length > 0) {
      return allowedModels.find((model) => availableModels.includes(model)) || allowedModels[0];
    }

    return availableModels[0] || '';
  }, [availableModels, preferredApiKey]);

  const modelUsageRows = useMemo(() => {
    const grouped = recentLogs.reduce<Record<string, { model: string; requests: number; tokens: number }>>((acc, log) => {
      const key = log.model;
      if (!acc[key]) {
        acc[key] = { model: log.model, requests: 0, tokens: 0 };
      }

      acc[key].requests += 1;
      acc[key].tokens += (log.input_tokens || 0) + (log.output_tokens || 0);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      if (b.tokens !== a.tokens) return b.tokens - a.tokens;
      return b.requests - a.requests;
    });
  }, [recentLogs]);

  const totalModelUsageTokens = modelUsageRows.reduce((sum, row) => sum + row.tokens, 0);
  const recentRequestRows = recentLogs.slice(0, 5);
  const maskedQuickStartKey = preferredApiKey ? maskApiKey(preferredApiKey.key) : '';
  const quickStartEndpoint = `${cleanUrl}/v1`;
  const canCopyCurl = Boolean(preferredApiKey?.key && quickStartModel);
  const curlCommand = canCopyCurl
    ? `curl -X POST ${quickStartEndpoint}/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer ${preferredApiKey?.key}" -d "{\\"model\\": \\"${quickStartModel}\\", \\"messages\\": [{\\"role\\": \\"user\\", \\"content\\": \\"Hello!\\"}], \\"stream\\": true}"`
    : '';

  const chartSeries = useMemo(() => {
    const generateSeries = (days: number) => {
      const series: Array<{ label: string; value: number }> = [];
      const now = new Date();
      
      const dailyMap = usageStats.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.date] = (acc[stat.date] || 0) + (stat.requests || 0);
        return acc;
      }, {});

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; 
        
        const month = d.toLocaleString('en-US', { month: 'short' });
        const day = d.getDate().toString().padStart(2, '0');
        const label = days === 7 ? `${month} ${day}, ${d.getFullYear()}` : `${month} ${day}`;
        
        series.push({ label, value: dailyMap[dateStr] || 0 });
      }
      
      if (days > 7) {
        const sampled: Array<{ label: string; value: number }> = [];
        const step = (days - 1) / 6;
        for (let i = 0; i < 7; i++) {
          const index = Math.round(i * step);
          sampled.push(series[index]);
        }
        return sampled;
      }
      return series;
    };

    return {
      '7D': generateSeries(7),
      '30D': generateSeries(30),
      '90D': generateSeries(90)
    };
  }, [usageStats]);

  const activeChartSeries = chartSeries[chartRange];
  const chartMax = Math.max(...activeChartSeries.map((point) => point.value), 1);
  const chartLeft = 60;
  const chartRight = 770;
  const chartTop = 50;
  const chartBottom = 215;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;
  const chartPoints = activeChartSeries.map((point, index) => {
    const x = chartLeft + (chartWidth / Math.max(activeChartSeries.length - 1, 1)) * index;
    const y = chartBottom - (point.value / chartMax) * chartHeight;
    return { ...point, x, y };
  });
  const chartLinePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const chartAreaPath = `${chartLinePath} L ${chartPoints[chartPoints.length - 1]?.x ?? chartRight} ${chartBottom} L ${chartPoints[0]?.x ?? chartLeft} ${chartBottom} Z`;
  const chartGridValues = [chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, 0];
  const chartGridYPositions = [50, 91.25, 132.5, 173.75, 215];

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20">
      {loading && <PageLoader />}

      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[26px] font-bold tracking-tight text-slate-900">
            {isAdmin ? adminCopy.greeting : copy.greeting}
          </h1>
          <p className="text-[15px] text-slate-500">{isAdmin ? adminCopy.subtitle : copy.subtitle}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {isAdmin ? (
          <>
            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <Users size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{adminCopy.users}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
                {adminUserCount !== null && adminUserCount !== undefined ? adminUserCount.toLocaleString() : '—'}
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                  <Box size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{adminCopy.apiKeys}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
                {adminKeyCount !== null && adminKeyCount !== undefined ? adminKeyCount.toLocaleString() : '—'}
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                  <Activity size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{adminCopy.totalRequests}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
                {totalRequests.toLocaleString()}
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{adminCopy.systemSuccessRate}</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight mb-2">
                  {successRate !== null ? successDisplay : '—'}
                </div>
                <div className="text-[11px] font-bold text-emerald-500">
                  {recentErrorCount > 0 ? adminCopy.attention : adminCopy.healthy}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <Box size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{copy.remainingTokens}</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
                    {tokenInfo?.token_limit === null ? copy.unlimited : ((tokenInfo?.token_limit || 0) - (tokenInfo?.tokens_used || 0)).toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{copy.ofTokens} {tokenLimitStr} tokens</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-[5px] flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${100 - tokensUsedPct}%` }}></div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{Math.max(0, 100 - tokensUsedPct).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                  <Activity size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{copy.requestsToday}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight mb-2">
                    {totalRequests.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-500">{copy.vsYesterday}</div>
                </div>
                <div className="w-16 h-8 flex items-end">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    <polyline points="0,25 60,25 80,10 100,5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{copy.successRate}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight mb-2">
                    {successRate !== null ? successDisplay : '—'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-500">{copy.stable}</div>
                </div>
                <div className="w-16 h-8 flex items-end">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    <polyline points="0,25 70,25 80,25 100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 text-orange-400">
                  <Clock size={14} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-slate-500">{copy.avgLatency}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight mb-2">
                    {averageLatencySeconds !== null ? `${averageLatencySeconds.toFixed(1)}s` : '—'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">{copy.moderate}</div>
                </div>
                <div className="w-16 h-8 flex items-end">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                    <polyline points="0,20 100,20" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">{copy.usageTrend}</h2>
              <p className="mt-1 text-[13px] text-slate-500">{copy.tokenUsageOverTime}</p>
            </div>
            <div className="flex rounded-[10px] bg-slate-50 p-1 border border-slate-100">
              {(['7D', '30D', '90D'] as DashboardChartRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    chartRange === range
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex-1 rounded-[16px] min-h-[250px] relative">
            <div className="absolute inset-0">
               <svg viewBox="0 0 800 250" className="w-full h-full preserveAspectRatio-none" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
                  
                  {/* Y Axis Labels */}
                  {chartGridValues.map((value, index) => (
                    <text
                      key={`grid-${index}`}
                      x="30"
                      y={chartGridYPositions[index] + 5}
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="end"
                    >
                      {Number.isInteger(value) ? value : value.toFixed(1)}
                    </text>
                  ))}
                  
                  {/* X Axis Labels */}
                  {chartPoints.map((point) => (
                    <text
                      key={point.label}
                      x={point.x}
                      y="245"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {point.label}
                    </text>
                  ))}
                  
                  {/* Chart Area & Line */}
                  <path d={chartAreaPath} fill="url(#blueGrad)" />
                  <path d={chartLinePath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  
                  {/* Data Points */}
                  {chartPoints.map((point) => (
                    <circle
                      key={`point-${point.label}`}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  ))}
                  
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.2)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <TerminalSquare size={18} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">{adminCopy.adminControls}</h2>
                  <p className="text-[13px] text-slate-500">{adminCopy.adminControlsDesc}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-500">{copy.apiEndpoint}</label>
                  <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <code className="text-[13px] font-medium text-slate-700">{quickStartEndpoint}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(quickStartEndpoint, 'endpoint')}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title={copy.apiEndpoint}
                    >
                      {copiedField === 'endpoint' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{adminCopy.systemStatus}</div>
                    <div className="mt-1 text-[14px] font-semibold text-slate-900">
                      {health?.status === 'ok' ? adminCopy.healthy : adminCopy.attention}
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{adminCopy.recentErrors}</div>
                    <div className="mt-1 text-[14px] font-semibold text-slate-900">{recentErrorCount.toLocaleString()}</div>
                  </div>
                  <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{adminCopy.readyAccounts}</div>
                    <div className="mt-1 text-[14px] font-semibold text-slate-900">
                      {readyAccounts !== null && readyAccounts !== undefined ? readyAccounts.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <Link to="/keys" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-bold text-white hover:bg-blue-700 transition-colors shadow-sm">
                    <Box size={16} />
                    {adminCopy.manageKeys}
                  </Link>
                  <Link to="/users" className="flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    {adminCopy.manageUsers}
                  </Link>
                </div>
                <Link to="/status" className="flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  {adminCopy.openStatus}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <TerminalSquare size={18} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">{copy.quickStart}</h2>
                  <p className="text-[13px] text-slate-500">{copy.quickStartDesc}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-500">{copy.apiEndpoint}</label>
                  <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <code className="text-[13px] font-medium text-slate-700">{quickStartEndpoint}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(quickStartEndpoint, 'endpoint')}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title={copy.apiEndpoint}
                    >
                      {copiedField === 'endpoint' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-500">{copy.apiKey}</label>
                  <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <code className="text-[13px] font-medium text-slate-500">
                      {maskedQuickStartKey || copy.noApiKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => preferredApiKey && handleCopy(preferredApiKey.key, 'api-key')}
                      disabled={!preferredApiKey}
                      className="text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      title={copy.apiKey}
                    >
                      {copiedField === 'api-key' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                    {preferredApiKey ? copy.fullKeyVisibleOnce : copy.createKeyFirst}
                  </p>
                </div>
                
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-500">{copy.model}</label>
                  <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span className="text-[13px] font-medium text-slate-700">{quickStartModel || copy.noModel}</span>
                    <button
                      type="button"
                      onClick={() => quickStartModel && handleCopy(quickStartModel, 'model')}
                      disabled={!quickStartModel}
                      className="text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      title={copy.model}
                    >
                      {copiedField === 'model' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(curlCommand, 'curl')}
                    disabled={!canCopyCurl}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    <TerminalSquare size={16} />
                    {copiedField === 'curl' ? copy.copied : copy.copyCurl}
                  </button>
                  <Link to="/integrations" className="flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    {copy.viewIntegrations}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[17px] font-bold text-slate-900">{isAdmin ? adminCopy.modelUsage : copy.modelUsage}</h2>
            <Link to="/usage" className="text-[13px] font-bold text-blue-600 hover:underline">{copy.viewAll}</Link>
          </div>
          <p className="mb-6 text-[13px] text-slate-500">{isAdmin ? adminCopy.requestsAndTokens : copy.requestsAndTokens}</p>
          
          <div className="flex-1">
            {modelUsageRows.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[13px] font-medium text-slate-500">
                {isAdmin ? adminCopy.noModelUsage : copy.noModelUsage}
              </div>
            ) : (
              modelUsageRows.slice(0, 5).map((row) => {
                const percentage = totalModelUsageTokens > 0 ? (row.tokens / totalModelUsageTokens) * 100 : 0;
                const logoSrc = getLogoSrcForModel(row.model);

                return (
                  <div key={row.model} className="flex items-center gap-4 py-2">
                    <ProviderLogoBadge src={logoSrc || undefined} alt={row.model} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-2 gap-3">
                        <span className="font-bold text-slate-900 text-[14px] truncate">{row.model}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-slate-900 text-[13px]">{percentage.toFixed(1)}%</span>
                          <span className="text-[13px] text-slate-500">{row.tokens.toLocaleString()} tokens</span>
                        </div>
                      </div>
                      <div className="h-[5px] w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(percentage, 3)}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[17px] font-bold text-slate-900">{isAdmin ? adminCopy.recentRequests : copy.recentRequests}</h2>
            <Link to="/logs" className="text-[13px] font-bold text-blue-600 hover:underline">{copy.viewAll}</Link>
          </div>
          <p className="mb-6 text-[13px] text-slate-500">{isAdmin ? adminCopy.latestRequests : copy.latestRequests}</p>
          
          <div className="flex-1">
            {recentRequestRows.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[13px] font-medium text-slate-500">
                {isAdmin ? adminCopy.noRecentRequests : copy.noRecentRequests}
              </div>
            ) : (
              recentRequestRows.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-100/70 last:border-0 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderLogoBadge src={getLogoSrcForModel(log.model) || undefined} alt={log.model} />
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-900 text-[14px] truncate">{log.model}</span>
                      {isAdmin && (
                        <span className="block text-[12px] text-slate-500 truncate">
                          {adminCopy.userLabel}: {log.username || adminCopy.unknownUser}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${log.is_success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {log.is_success ? copy.success : errorLabel}
                    </span>
                    <span className="text-[13px] font-bold text-slate-700">
                      {log.latency_ms ? `${(log.latency_ms / 1000).toFixed(1)}s` : copy.unavailable}
                    </span>
                    <span className="text-[13px] text-slate-500">{formatRelativeTime(log.created_at, language)}</span>
                    <ChevronDown size={14} className="text-slate-400 -rotate-90" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
