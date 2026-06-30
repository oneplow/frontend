import { useState, useEffect, useMemo } from 'react';
import { 
  Search, RefreshCw, ChevronRight, ChevronLeft, X, Copy, FileSearch
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';
import { ProviderLogoBadge } from '../components/ProviderLogoBadge';
import { Select } from '../components/Select';
import { useAppSettings } from '../context/AppSettingsContext';

interface RequestLog {
  id: string;
  username?: string;
  model: string;
  method: string;
  url: string;
  is_success: boolean;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  created_at: number;
  request_count?: number;
}

export const LogsPage = () => {
  const { isAdmin, apiUrl, userToken } = useAuth();
  const { language } = useAppSettings();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const copy =
    language === 'th'
      ? isAdmin
        ? {
            overview: 'ภาพรวม',
            title: 'บันทึกคำขอทั้งระบบ',
            description: 'ตรวจสอบและวิเคราะห์คำขอ API ของผู้ใช้ทั้งหมดแบบเรียลไทม์',
            searchPlaceholder: 'ค้นหาจาก request id ชื่อผู้ใช้ หรือโมเดล...',
            statusOptions: { all: 'ทุกสถานะ', success: 'สำเร็จ', error: 'ผิดพลาด' },
            modelOptions: { all: 'ทุกโมเดล' },
            timeOptions: { all: 'ทุกช่วงเวลา', today: 'วันนี้' },
            actions: { refresh: 'รีเฟรช' },
            table: {
              request: 'คำขอ',
              user: 'ผู้ใช้',
              model: 'โมเดล',
              status: 'สถานะ',
              tokens: 'โทเคน',
              latency: 'เวลา',
              retries: 'ลองซ้ำ',
              time: 'เวลา',
            },
            empty: 'ไม่พบคำขอของระบบตามตัวกรองที่เลือก',
            pagination: 'แสดง 1 ถึง {count} จากทั้งหมด {total} รายการ',
            perPage: '100 / หน้า',
            details: 'รายละเอียดคำขอ',
            fields: {
              requestId: 'Request ID',
              username: 'ผู้ใช้',
              endpoint: 'ปลายทาง',
              provider: 'ผู้ให้บริการ',
              status: 'สถานะ',
              tokens: 'โทเคน',
              inputTokens: 'โทเคนขาเข้า',
              outputTokens: 'โทเคนขาออก',
              totalTokens: 'โทเคนรวม',
              latency: 'เวลา',
              retries: 'จำนวนครั้งที่ลองซ้ำ',
              createdAt: 'สร้างเมื่อ',
            },
            providerUnknown: 'ผู้ให้บริการไม่ทราบชื่อ',
            total: 'รวม',
            input: 'เข้า',
            output: 'ออก',
            seconds: 'วินาที',
            unknownUser: 'ไม่ทราบผู้ใช้',
          }
        : {
            overview: 'ภาพรวม',
            title: 'บันทึกคำขอ',
            description: 'ตรวจสอบและวิเคราะห์คำขอ API แบบเรียลไทม์',
            searchPlaceholder: 'ค้นหาจาก request id หรือโมเดล...',
            statusOptions: { all: 'ทุกสถานะ', success: 'สำเร็จ', error: 'ผิดพลาด' },
            modelOptions: { all: 'ทุกโมเดล' },
            timeOptions: { all: 'ทุกช่วงเวลา', today: 'วันนี้' },
            actions: { refresh: 'รีเฟรช' },
            table: {
              request: 'คำขอ',
              user: 'ผู้ใช้',
              model: 'โมเดล',
              status: 'สถานะ',
              tokens: 'โทเคน',
              latency: 'เวลา',
              retries: 'ลองซ้ำ',
              time: 'เวลา',
            },
            empty: 'ไม่พบคำขอตามตัวกรองที่เลือก',
            pagination: 'แสดง 1 ถึง {count} จากทั้งหมด {total} รายการ',
            perPage: '100 / หน้า',
            details: 'รายละเอียดคำขอ',
            fields: {
              requestId: 'Request ID',
              username: 'ผู้ใช้',
              endpoint: 'ปลายทาง',
              provider: 'ผู้ให้บริการ',
              status: 'สถานะ',
              tokens: 'โทเคน',
              inputTokens: 'โทเคนขาเข้า',
              outputTokens: 'โทเคนขาออก',
              totalTokens: 'โทเคนรวม',
              latency: 'เวลา',
              retries: 'จำนวนครั้งที่ลองซ้ำ',
              createdAt: 'สร้างเมื่อ',
            },
            providerUnknown: 'ผู้ให้บริการไม่ทราบชื่อ',
            total: 'รวม',
            input: 'เข้า',
            output: 'ออก',
            seconds: 'วินาที',
            unknownUser: 'ไม่ทราบผู้ใช้',
          }
      : isAdmin
        ? {
            overview: 'Overview',
            title: 'System Request Logs',
            description: 'Inspect and analyze API requests across all users in real time.',
            searchPlaceholder: 'Search by request id, username, or model...',
            statusOptions: { all: 'All status', success: 'Success', error: 'Error' },
            modelOptions: { all: 'All models' },
            timeOptions: { all: 'All time', today: 'Today' },
            actions: { refresh: 'Refresh' },
            table: {
              request: 'Request',
              user: 'User',
              model: 'Model',
              status: 'Status',
              tokens: 'Tokens',
              latency: 'Latency',
              retries: 'Retries',
              time: 'Time',
            },
            empty: 'No system requests found matching your filters.',
            pagination: 'Showing 1 to {count} of {total} results',
            perPage: '100 / page',
            details: 'Request details',
            fields: {
              requestId: 'Request ID',
              username: 'User',
              endpoint: 'Endpoint',
              provider: 'Provider',
              status: 'Status',
              tokens: 'Tokens',
              inputTokens: 'Input tokens',
              outputTokens: 'Output tokens',
              totalTokens: 'Total tokens',
              latency: 'Latency',
              retries: 'Retries',
              createdAt: 'Created at',
            },
            providerUnknown: 'Unknown Provider',
            total: 'total',
            input: 'in',
            output: 'out',
            seconds: 'seconds',
            unknownUser: 'Unknown user',
          }
        : {
            overview: 'Overview',
            title: 'Request logs',
            description: 'Inspect and analyze API requests in real time.',
            searchPlaceholder: 'Search by request id or model...',
            statusOptions: { all: 'All status', success: 'Success', error: 'Error' },
            modelOptions: { all: 'All models' },
            timeOptions: { all: 'All time', today: 'Today' },
            actions: { refresh: 'Refresh' },
            table: {
              request: 'Request',
              user: 'User',
              model: 'Model',
              status: 'Status',
              tokens: 'Tokens',
              latency: 'Latency',
              retries: 'Retries',
              time: 'Time',
            },
            empty: 'No requests found matching your filters.',
            pagination: 'Showing 1 to {count} of {total} results',
            perPage: '100 / page',
            details: 'Request details',
            fields: {
              requestId: 'Request ID',
              username: 'User',
              endpoint: 'Endpoint',
              provider: 'Provider',
              status: 'Status',
              tokens: 'Tokens',
              inputTokens: 'Input tokens',
              outputTokens: 'Output tokens',
              totalTokens: 'Total tokens',
              latency: 'Latency',
              retries: 'Retries',
              createdAt: 'Created at',
            },
            providerUnknown: 'Unknown Provider',
            total: 'total',
            input: 'in',
            output: 'out',
            seconds: 'seconds',
            unknownUser: 'Unknown user',
          };

  const token = userToken;
  const cleanUrl = apiUrl.replace(/\/$/, '');

  const aggregatePromptLogs = (rawLogs: RequestLog[]) => {
    const aggregated: RequestLog[] = [];

    rawLogs.forEach((log) => {
      if (aggregated.length === 0) {
        aggregated.push({ ...log, request_count: log.request_count ?? 1 });
        return;
      }

      const last = aggregated[aggregated.length - 1];
      const samePromptWindow = Math.abs(last.created_at - log.created_at) <= 90;
      const sameRequestShape =
        last.model === log.model &&
        (last.username || '') === (log.username || '') &&
        last.method === log.method &&
        last.url === log.url;

      if (sameRequestShape && samePromptWindow) {
        last.input_tokens += log.input_tokens || 0;
        last.output_tokens += log.output_tokens || 0;
        last.latency_ms += log.latency_ms || 0;
        last.is_success = last.is_success && log.is_success;
        last.request_count = (last.request_count || 1) + (log.request_count || 1);
      } else {
        aggregated.push({ ...log, request_count: log.request_count ?? 1 });
      }
    });

    return aggregated;
  };

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/admin/logs' : '/user/logs';
      const res = await fetch(`${cleanUrl}${endpoint}?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const rawLogs = data.logs || [];
        setLogs(aggregatePromptLogs(rawLogs));
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [cleanUrl, token, isAdmin]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search
      const searchValue = search.toLowerCase();
      if (
        search &&
        !log.id.toLowerCase().includes(searchValue) &&
        !log.model.toLowerCase().includes(searchValue) &&
        !(log.username || '').toLowerCase().includes(searchValue)
      ) {
        return false;
      }
      // Status
      if (statusFilter === 'success' && !log.is_success) return false;
      if (statusFilter === 'error' && log.is_success) return false;
      // Model
      if (modelFilter !== 'all' && log.model !== modelFilter) return false;
      // Time
      if (timeFilter === 'today') {
        const created = new Date(log.created_at * 1000);
        const now = new Date();
        if (
          created.getFullYear() !== now.getFullYear() ||
          created.getMonth() !== now.getMonth() ||
          created.getDate() !== now.getDate()
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, search, statusFilter, modelFilter, timeFilter]);

  const uniqueModels = useMemo(() => {
    const models = new Set<string>();
    logs.forEach(l => models.add(l.model));
    return Array.from(models);
  }, [logs]);

  const getModelIcon = (model: string) => {
    const m = model.toLowerCase();
    const normalized = m.replace(/[^a-z0-9]/g, '');
    if (m.includes('claude') || normalized.includes('opus') || normalized.includes('sonnet') || normalized.includes('haiku')) return "/anthropic.svg";
    if (m.includes('gpt') || m.includes('o1') || m.includes('o3') || m.includes('dall-e')) return "/openai.svg";
    if (m.includes('gemini')) return "/google.svg";
    if (m.includes('llama') || m.includes('meta')) return "/meta.svg";
    if (m.includes('mimo')) return "/xiaomi.svg";
    if (m.includes('mistral') || m.includes('mixtral')) return "/minimax.svg"; // Fallback to minimax icon if no mistral icon exists
    if (m.includes('deepseek')) return "/deepseek.svg";
    return "/icons.svg";
  };

  const getProvider = (model: string) => {
    const m = model.toLowerCase();
    const normalized = m.replace(/[^a-z0-9]/g, '');
    if (m.includes('claude') || normalized.includes('opus') || normalized.includes('sonnet') || normalized.includes('haiku')) return "Anthropic";
    if (m.includes('gpt') || m.includes('o1') || m.includes('o3') || m.includes('dall-e')) return "OpenAI";
    if (m.includes('gemini')) return "Google";
    if (m.includes('llama') || m.includes('meta')) return "Meta";
    if (m.includes('mimo')) return "Xiaomi MiMo";
    if (m.includes('mistral') || m.includes('mixtral')) return "Mistral AI";
    if (m.includes('deepseek')) return "DeepSeek";
    if (m.includes('cohere') || m.includes('command')) return "Cohere";
    return copy.providerUnknown;
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000);
    const locale = language === 'th' ? 'th-TH' : 'en-US';
    return {
      time: d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: language !== 'th' }),
      date: d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] p-4 lg:p-6 pb-20 relative min-h-screen">
      {loading && <PageLoader />}
      
      
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center text-[15px] font-medium app-muted">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">{copy.overview}</Link>
        <ChevronRight size={14} className="mx-2 opacity-50" />
        <span className="app-text">{copy.title}</span>
      </div>

      <div className="mb-6">
        <h1 className="mb-1 text-[28px] font-bold tracking-tight app-text">{copy.title}</h1>
        <p className="text-[15px] app-muted">{copy.description}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input-field w-full rounded-xl py-2.5 pl-10 pr-4 text-[14px] shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap pb-1 md:pb-0">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="min-w-[140px]"
            options={[
              { value: 'all', label: copy.statusOptions.all },
              { value: 'success', label: copy.statusOptions.success },
              { value: 'error', label: copy.statusOptions.error },
            ]}
          />
          
          <Select
            value={modelFilter}
            onChange={setModelFilter}
            className="min-w-[150px]"
            options={[
              { value: 'all', label: copy.modelOptions.all },
              ...uniqueModels.map((m) => ({ value: m, label: m })),
            ]}
          />
          
          <Select
            value={timeFilter}
            onChange={setTimeFilter}
            className="min-w-[140px]"
            options={[
              { value: 'all', label: copy.timeOptions.all },
              { value: 'today', label: copy.timeOptions.today },
            ]}
          />
          
          <button 
            onClick={fetchLogs}
            className="app-button-secondary flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-bold shadow-sm whitespace-nowrap"
          >
            <RefreshCw size={16} />
            {copy.actions.refresh}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="app-panel overflow-hidden rounded-[16px] flex min-h-[400px] flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider app-muted" style={{ borderBottom: '1px solid var(--app-border)', backgroundColor: 'var(--app-surface-muted)' }}>
                <th className="px-6 py-4">{copy.table.request}</th>
                  {isAdmin && <th className="px-6 py-4">{copy.table.user}</th>}
                <th className="px-6 py-4">{copy.table.model}</th>
                <th className="px-6 py-4">{copy.table.status}</th>
                <th className="px-6 py-4 text-right">{copy.table.tokens}</th>
                <th className="px-6 py-4 text-right">{copy.table.latency}</th>
                <th className="px-6 py-4 text-right">{copy.table.retries}</th>
                <th className="px-6 py-4">{copy.table.time}</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--app-surface)' }}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 px-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-text-muted)' }}>
                        <FileSearch size={24} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[15px] font-semibold app-text">{copy.empty}</span>
                        <span className="block text-[13px] app-muted">
                          {language === 'th'
                            ? 'ลองเปลี่ยนตัวกรองหรือช่วงเวลา แล้วกดรีเฟรชอีกครั้ง'
                            : 'Try adjusting your filters or time range, then refresh.'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice((currentPage - 1) * 10, currentPage * 10).map(log => {
                  const t = formatDate(log.created_at);
                  const totalTokens = log.input_tokens + log.output_tokens;
                  const tokensStr = totalTokens >= 1000 ? `${(totalTokens/1000).toFixed(1)}k` : totalTokens;
                  const inStr = log.input_tokens >= 1000 ? `${(log.input_tokens/1000).toFixed(1)}k` : log.input_tokens;
                  
                  return (
                    <tr 
                      key={log.id} 
                      className="cursor-pointer transition-colors group"
                      style={{ borderBottom: '1px solid var(--app-border)' }}
                      onClick={() => setSelectedLog(log)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--app-surface-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold app-text flex items-center gap-2">
                          {log.id.split('-')[0] + '...'} 
                          <Copy size={12} className="app-muted group-hover:text-blue-500" />
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] app-muted">{log.method} {log.url}</div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="font-bold app-text">{log.username || copy.unknownUser}</div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProviderLogoBadge src={getModelIcon(log.model)} alt="Model" size="sm" />
                          <div>
                            <div className="text-[13px] font-bold app-text">{log.model}</div>
                            <div className="text-[11px] app-muted">{getProvider(log.model)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.is_success ? (
                           <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             {copy.statusOptions.success}
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-bold text-red-600">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                             {copy.statusOptions.error}
                           </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold app-text">{tokensStr} {copy.total}</div>
                        <div className="text-[11px] app-muted">{inStr} {copy.input} • {log.output_tokens} {copy.output}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold app-text">
                        {(log.latency_ms / 1000).toFixed(1)}s
                      </td>
                      <td className="px-6 py-4 text-right font-medium app-muted">
                        0
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold app-text">{t.time}</div>
                            <div className="text-[11px] app-muted">{t.date}</div>
                          </div>
                          <ChevronRight size={16} className="app-muted group-hover:text-blue-500 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          {filteredLogs.length > 10 && (
            <div className="flex items-center justify-between border-t p-4" style={{ borderColor: 'var(--app-border)' }}>
              <div className="text-sm app-muted">
                {language === 'th' ? `แสดง ${(currentPage - 1) * 10 + 1} ถึง ${Math.min(currentPage * 10, filteredLogs.length)} จาก ${filteredLogs.length}` : `Showing ${(currentPage - 1) * 10 + 1} to ${Math.min(currentPage * 10, filteredLogs.length)} of ${filteredLogs.length}`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--app-border)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium app-text mx-2">
                  {currentPage} / {Math.ceil(filteredLogs.length / 10)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLogs.length / 10), p + 1))}
                  disabled={currentPage === Math.ceil(filteredLogs.length / 10)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--app-border)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
          <div className="app-panel relative h-full w-full max-w-md animate-[slideIn_0.3s_ease-out] flex flex-col">
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--app-border)' }}>
              <h2 className="text-[18px] font-bold app-text">{copy.details}</h2>
              <button onClick={() => setSelectedLog(null)} className="app-muted hover:text-[var(--app-text)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.requestId}</label>
                <div className="flex items-center justify-between group">
                  <span className="text-[14px] font-mono app-text">{selectedLog.id}</span>
                  <Copy size={14} className="app-muted cursor-pointer hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {isAdmin && (
                <div>
                  <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.username}</label>
                  <div className="text-[15px] app-text">{selectedLog.username || copy.unknownUser}</div>
                </div>
              )}
              
              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.endpoint}</label>
                <div className="text-[14px] font-mono app-text">{selectedLog.method} {selectedLog.url}</div>
              </div>
              
              <div>
                <label className="mb-2 block text-[13px] font-bold app-muted">{copy.table.model}</label>
                <div className="flex items-center gap-3">
                  <ProviderLogoBadge src={getModelIcon(selectedLog.model)} alt="Model" size="sm" />
                  <div>
                    <span className="text-[15px] font-bold app-text">{selectedLog.model}</span>
                    <span className="ml-2 text-[13px] app-muted">({getProvider(selectedLog.model)})</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.provider}</label>
                <div className="text-[15px] app-text">{getProvider(selectedLog.model)}</div>
              </div>
              
              <div>
                <label className="mb-2 block text-[13px] font-bold app-muted">{copy.fields.status}</label>
                {selectedLog.is_success ? (
                   <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-600">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     {copy.statusOptions.success}
                   </span>
                ) : (
                   <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[13px] font-bold text-red-600">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     {copy.statusOptions.error}
                   </span>
                )}
              </div>
              
              <div className="rounded-2xl p-5" style={{ border: '1px solid var(--app-border)', backgroundColor: 'var(--app-surface-muted)' }}>
                <h3 className="mb-4 text-[12px] font-bold uppercase tracking-widest app-muted">{copy.fields.tokens}</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between items-center">
                    <span className="app-muted">{copy.fields.inputTokens}</span>
                    <span className="font-bold app-text">{selectedLog.input_tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-muted">{copy.fields.outputTokens}</span>
                    <span className="font-bold app-text">{selectedLog.output_tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--app-border)' }}>
                    <span className="font-medium app-muted">{copy.fields.totalTokens}</span>
                    <span className="font-bold app-text">{(selectedLog.input_tokens + selectedLog.output_tokens).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.latency}</label>
                <div className="text-[15px] app-text">{(selectedLog.latency_ms / 1000).toFixed(1)} {copy.seconds}</div>
              </div>
              
              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.retries}</label>
                <div className="text-[15px] app-text">0</div>
              </div>
              

              <div>
                <label className="mb-1 block text-[13px] font-bold app-muted">{copy.fields.createdAt}</label>
                <div className="text-[15px] app-text">{formatDate(selectedLog.created_at).date}, {formatDate(selectedLog.created_at).time}</div>
              </div>
              
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
