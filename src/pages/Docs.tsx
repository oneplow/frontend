import { useState } from 'react';
import { Copy, Check, Terminal, Code2, Link2, Sparkles, Braces } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Tab = 'curl-linux' | 'curl-windows' | 'javascript' | 'python';

export const Docs = () => {
  const { apiUrl, userToken } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('curl-linux');

  const baseUrl = apiUrl.replace(/\/$/, '');
  const displayToken = userToken || 'YOUR_API_KEY';

  const codeExamples: Record<Tab, { label: string; icon: any; code: string }> = {
    'curl-linux': {
      label: 'cURL (Linux/macOS)',
      icon: Terminal,
      code: `curl -X POST ${baseUrl}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${displayToken}" \\
  -d '{
    "model": "default",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`,
    },
    'curl-windows': {
      label: 'cURL (Windows CMD)',
      icon: Terminal,
      code: `curl -X POST ${baseUrl}/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer ${displayToken}" -d "{\\"model\\": \\"default\\", \\"messages\\": [{\\"role\\": \\"user\\", \\"content\\": \\"Hello!\\"}]}"`,
    },
    javascript: {
      label: 'JavaScript',
      icon: Braces,
      code: `const response = await fetch("${baseUrl}/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${displayToken}",
  },
  body: JSON.stringify({
    model: "default",
    messages: [
      { role: "user", content: "Hello!" }
    ],
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);`,
    },
    python: {
      label: 'Python',
      icon: Code2,
      code: `import openai

client = openai.OpenAI(
    base_url="${baseUrl}/v1",
    api_key="${displayToken}",
)

response = client.chat.completions.create(
    model="default",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`,
    },
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentExample = codeExamples[activeTab];
  const IconComponent = currentExample.icon;

  const tabs: Tab[] = ['curl-linux', 'curl-windows', 'javascript', 'python'];

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">API Documentation</h2>
            <p className="mt-1 text-sm text-slate-500">
              เรียนรู้วิธีเชื่อมต่อระบบผ่าน endpoint ที่รองรับรูปแบบเดียวกับ OpenAI SDK พร้อมตัวอย่างใช้งานที่คัดลอกไปใช้ต่อได้ทันที
            </p>
          </div>
          <div className="badge-blue hidden sm:flex">
            <Sparkles size={12} />
            Quick Start
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="surface-card rounded-[32px] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Link2 size={20} className="text-blue-600" />
            Base Endpoint
          </h2>
          <div className="code-block flex items-center justify-between p-4">
            <code className="text-sm font-mono text-slate-900">{baseUrl}/v1</code>
          </div>
          <p className="mt-3 text-sm text-slate-500">All API requests should be prefixed with this base URL.</p>
        </section>

        <section className="surface-card overflow-hidden rounded-[32px]">
          {/* Tab Header */}
          <div className="flex items-center justify-between border-b border-blue-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const example = codeExamples[tab];
                const TabIcon = example.icon;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white hover:text-slate-700'
                    }`}
                  >
                    <TabIcon size={13} />
                    {example.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => copyToClipboard(currentExample.code)}
              className="btn-secondary px-3 py-1.5 text-xs ml-2 shrink-0"
            >
              {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copiedCode ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Code Block */}
          <div className="bg-white p-6">
            <pre className="overflow-x-auto rounded-[24px] border border-blue-100 bg-slate-950 px-5 py-5 text-sm font-mono text-slate-100">
              <code>{currentExample.code}</code>
            </pre>
          </div>
        </section>

        {/* Streaming Example */}
        <section className="surface-card rounded-[32px] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles size={20} className="text-purple-500" />
            Streaming Response
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            เพิ่ม <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">"stream": true</code> ในคำขอเพื่อรับ response แบบ real-time ทีละ token
          </p>

          <pre className="overflow-x-auto rounded-[24px] border border-blue-100 bg-slate-950 px-5 py-5 text-sm font-mono text-slate-100">
            <code>{`# Python Streaming Example
import openai

client = openai.OpenAI(
    base_url="${baseUrl}/v1",
    api_key="${displayToken}",
)

stream = client.chat.completions.create(
    model="default",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
print()`}</code>
          </pre>
        </section>

        {/* Notes */}
        <section className="surface-card rounded-[32px] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Code2 size={20} className="text-emerald-500" />
            Notes
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
              ระบบรองรับ OpenAI-compatible format — สามารถใช้ <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">openai</code> SDK ได้เลยโดยเปลี่ยน base_url
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
              สำหรับ Windows CMD ต้องใช้ double quotes และ escape ด้วย <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">\"</code> แทน single quotes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
              ใช้ <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">"model": "default"</code> หรือระบุชื่อโมเดลเฉพาะจากหน้า API Keys ได้
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
              ดูรายชื่อโมเดลที่รองรับได้จาก <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">GET /v1/models</code>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
