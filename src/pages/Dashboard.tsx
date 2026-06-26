import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Activity,
  ArrowUpRight,
  Zap,
  Clock,
  Users,
  KeyRound,
  Globe,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Types ──
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

interface TimePoint {
  time: Date;
  sendOk: number;
  sendFail: number;
  harvestOk: number;
  harvestFail: number;
}

// ── Interactive SVG Chart with Tooltip ──
const InteractiveChart = ({
  data,
  dataKey,
  color,
  height = 100,
  unit = ''
}: {
  data: TimePoint[];
  dataKey: (p: TimePoint) => number;
  color: string;
  height?: number;
  label: string;
  unit?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; time: string } | null>(null);

  const values = data.map(dataKey);
  const maxVal = Math.max(...values, 1);
  const w = 100;

  const points = values.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * w : w / 2,
    y: height - (v / maxVal) * (height - 16) - 8
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const colorMap: Record<string, { stroke: string; fill: string }> = {
    blue: { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.06)' },
    emerald: { stroke: '#10b981', fill: 'rgba(16,185,129,0.06)' },
    rose: { stroke: '#f43f5e', fill: 'rgba(244,63,94,0.06)' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.06)' }
  };
  const c = colorMap[color] || colorMap.blue;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.round((mouseX / w) * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    const pt = points[clampedIdx];
    const d = data[clampedIdx];
    setTooltip({
      x: pt.x,
      y: pt.y,
      value: dataKey(d),
      time: d.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  }, [data, points, dataKey, w]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        className="w-full cursor-crosshair"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <path d={areaPath} fill={c.fill} />
        <path d={linePath} fill="none" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={0} x2={tooltip.x} y2={height} stroke={c.stroke} strokeWidth="0.3" strokeDasharray="2,2" opacity={0.5} />
            <circle cx={tooltip.x} cy={tooltip.y} r="2" fill={c.stroke} stroke="white" strokeWidth="1" />
          </>
        )}
      </svg>
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] text-white shadow-lg whitespace-nowrap"
          style={{
            left: `${(tooltip.x / w) * 100}%`,
            top: `${(tooltip.y / height) * 100 - 15}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{tooltip.value}{unit}</div>
          <div className="text-slate-400 text-[9px]">{tooltip.time}</div>
        </div>
      )}
    </div>
  );
};

// ── Dashboard Component ──
export const Dashboard = () => {
  const { isAdmin, username, apiUrl, adminKey, userToken } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [keyCount, setKeyCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [history, setHistory] = useState<TimePoint[]>([]);
  const prevCounters = useRef<Record<string, number> | null>(null);

  const cleanUrl = apiUrl.replace(/\/$/, '');
  const token = isAdmin ? adminKey : userToken;

  // Fetch health + keys + users
  // Fetch keys and users (static data)
  const fetchStaticData = useCallback(async () => {
    if (token) {
      try {
        const endpoint = isAdmin ? '/admin/keys' : '/user/keys';
        const res = await fetch(`${cleanUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setKeyCount(isAdmin ? (data.keys?.length || 0) : (data.key ? 1 : 0));
        }
      } catch { /* ignore */ }
    }

    if (isAdmin && adminKey) {
      try {
        const res = await fetch(`${cleanUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${adminKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserCount(data.users?.length || 0);
        }
      } catch { /* ignore */ }
    }
  }, [cleanUrl, token, isAdmin, adminKey]);

  // Handle static data polling
  useEffect(() => {
    fetchStaticData();
    const interval = setInterval(fetchStaticData, 15000);
    return () => clearInterval(interval);
  }, [fetchStaticData]);

  // Handle SSE stream for health
  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    const startStream = async () => {
      try {
        const res = await fetch(`${cleanUrl}/health/stream`, {
          signal: abortController.signal
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
          buffer = parts.pop() || ''; // Keep the last incomplete part in the buffer

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const jsonStr = part.slice(6); // remove 'data: '
              if (jsonStr.trim() === '[DONE]') continue;
              
              try {
                const data: HealthData = JSON.parse(jsonStr);
                setHealth(data);

                // Update history chart
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
                  // We update history efficiently by using the functional state update
                  setHistory((h) => [...h.slice(-59), point]); // keep last 60 points
                }
                prevCounters.current = { ...counters };

              } catch (e) {
                console.error("Failed to parse SSE JSON", e);
              }
            }
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("SSE Stream error:", e);
          // Try to reconnect after 5s if it's not an abort
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
  }, [cleanUrl]);

  const counters = health?.counters || {};
  const totalSendOk = counters.send_ok || 0;
  const totalSendFail = counters.send_fail || 0;
  const totalRequests = totalSendOk + totalSendFail;
  const successRate = health?.send_success_rate != null ? Math.round(health.send_success_rate * 100) : null;
  const harvestRate = health?.harvest_success_rate != null ? Math.round(health.harvest_success_rate * 100) : null;

  const statusColor = health?.status === 'ok' ? 'text-emerald-600' : health?.status === 'warning' ? 'text-amber-600' : 'text-red-600';
  const statusBg = health?.status === 'ok' ? 'bg-emerald-50' : health?.status === 'warning' ? 'bg-amber-50' : 'bg-red-50';
  const statusDot = health?.status === 'ok' ? 'bg-emerald-400' : health?.status === 'warning' ? 'bg-amber-400' : 'bg-red-400';
  const statusLabel = health?.status === 'ok' ? 'Operational' : health?.status === 'warning' ? 'Degraded' : health?.status === 'critical' ? 'Critical' : 'Checking...';

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="surface-card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              ยินดีต้อนรับ, {username || 'ผู้ใช้งาน'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              ข้อมูลจริงจาก API — อัปเดตอัตโนมัติแบบ Real-time (SSE)
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/keys" className="btn-primary !py-2 !px-4 text-sm">
              <KeyRound size={14} />
              API Keys
            </Link>
            <Link to="/docs" className="btn-secondary !py-2 !px-4 text-sm">
              <BookOpen size={14} />
              Docs
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="surface-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap size={16} />
            </div>
            {health && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBg} ${statusColor}`}>
                {statusLabel}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalRequests.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Total Requests</div>
        </div>

        <div className="surface-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            {successRate !== null && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                <ArrowUpRight size={12} />
                {successRate}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalSendOk.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Successful</div>
        </div>

        <div className="surface-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <KeyRound size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{keyCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{isAdmin ? 'Total Keys' : 'Your Keys'}</div>
        </div>

        <div className="surface-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              {isAdmin ? <Users size={16} /> : <Activity size={16} />}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {isAdmin ? userCount : (health?.fresh_accounts ?? '—')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {isAdmin ? 'Total Users' : 'Fresh Accounts'}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Request traffic chart */}
        <div className="surface-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp size={15} className="text-blue-500" />
                Request Traffic (Real-time)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {history.length > 0 ? `${history.length} data points · ทุก 15 วินาที` : 'กำลังเริ่มเก็บข้อมูล...'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800">{totalRequests.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 uppercase">cumulative</div>
            </div>
          </div>
          {history.length >= 2 ? (
            <>
              <InteractiveChart
                data={history}
                dataKey={(p) => p.sendOk + p.sendFail}
                color="blue"
                height={120}
                label="Requests"
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>{history[0].time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Now</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-sm text-slate-400">
              <div className="text-center">
                <Activity size={24} className="mx-auto mb-2 text-slate-300" />
                กราฟจะเริ่มแสดงหลังเก็บข้อมูลได้ 2 จุดขึ้นไป
                <div className="text-[10px] mt-1">(~30 วินาที)</div>
              </div>
            </div>
          )}
        </div>

        {/* Success rate */}
        <div className="surface-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BarChart3 size={15} className="text-emerald-500" />
                Success Rate
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Send / Harvest</p>
            </div>
          </div>
          {history.length >= 2 ? (
            <InteractiveChart
              data={history}
              dataKey={(p) => p.sendOk}
              color="emerald"
              height={90}
              label="Success"
            />
          ) : (
            <div className="flex items-center justify-center h-[90px] text-xs text-slate-400">
              รอข้อมูล...
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Send Rate</div>
              <div className="text-base font-bold text-slate-700">{successRate ?? '—'}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Harvest Rate</div>
              <div className="text-base font-bold text-slate-700">{harvestRate ?? '—'}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* System status */}
        <div className="surface-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Server size={15} className="text-blue-500" />
            System Status
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-full ${statusDot}`} />
                <span className="text-sm text-slate-600">API Server</span>
              </div>
              <span className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">Fresh Accounts</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">{health?.fresh_accounts ?? health?.warm_accounts ?? '—'}</span>
            </div>
            {health?.seconds_since_send != null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600">Last Successful Send</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">{Math.round(health.seconds_since_send)}s ago</span>
              </div>
            )}
            {health?.seconds_since_harvest != null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600">Last Harvest</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">{Math.round(health.seconds_since_harvest)}s ago</span>
              </div>
            )}
          </div>
        </div>

        {/* Reasons & Errors */}
        <div className="surface-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-500" />
            Health Diagnostics
          </h3>

          {/* Reasons */}
          {health?.reasons && health.reasons.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status Reasons</div>
              <div className="space-y-1.5">
                {health.reasons.map((r, i) => (
                  <div key={i} className={`text-sm p-2.5 rounded-xl ${statusBg} ${statusColor}`}>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent errors */}
          {health?.recent_errors && health.recent_errors.length > 0 ? (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Errors</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto hide-scrollbar">
                {health.recent_errors.map((err, i) => (
                  <div key={i} className="text-xs p-2.5 rounded-xl bg-red-50 text-red-700">
                    <span className="font-semibold">[{err.where}]</span> {err.error}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-sm text-slate-400">
              <div className="text-center">
                <CheckCircle2 size={20} className="mx-auto mb-1 text-emerald-400" />
                ไม่มี error ล่าสุด
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw counters */}
      {health?.counters && Object.keys(health.counters).length > 0 && (
        <div className="surface-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-violet-500" />
            Raw Counters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {Object.entries(health.counters)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, val]) => (
                <div key={key} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate" title={key}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-lg font-bold text-slate-700 mt-0.5">{val.toLocaleString()}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
