import { useState } from 'react';
import { Copy, Check, Terminal, Code2, Link2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Docs = () => {
  const { apiUrl, userToken } = useAuth();
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  const baseUrl = apiUrl.replace(/\/$/, '');
  const displayToken = userToken || 'YOUR_API_KEY';

  const curlCommand = `curl -X POST ${baseUrl}/v1/chat/completions \\
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
  }'`;

  const pythonCode = `import openai

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

print(response.choices[0].message.content)`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
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
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

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
          <div className="flex items-center justify-between border-b border-blue-100 bg-slate-50/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-blue-300"></div>
                <div className="h-3 w-3 rounded-full bg-sky-300"></div>
                <div className="h-3 w-3 rounded-full bg-indigo-300"></div>
              </div>
              <h2 className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Terminal size={14} className="text-blue-600" />
                bash
              </h2>
            </div>
            <button
              onClick={() => copyToClipboard(curlCommand, setCopiedCurl)}
              className="btn-secondary px-3 py-2 text-xs"
            >
              {copiedCurl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copiedCurl ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-white p-6">
            <pre className="overflow-x-auto rounded-[24px] border border-blue-100 bg-slate-950 px-5 py-5 text-sm font-mono text-slate-100">
              <code>{curlCommand}</code>
            </pre>
          </div>
        </section>

        <section className="surface-card overflow-hidden rounded-[32px]">
          <div className="flex items-center justify-between border-b border-blue-100 bg-slate-50/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-blue-300"></div>
                <div className="h-3 w-3 rounded-full bg-sky-300"></div>
                <div className="h-3 w-3 rounded-full bg-indigo-300"></div>
              </div>
              <h2 className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Code2 size={14} className="text-blue-600" />
                python
              </h2>
            </div>
            <button
              onClick={() => copyToClipboard(pythonCode, setCopiedPython)}
              className="btn-secondary px-3 py-2 text-xs"
            >
              {copiedPython ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copiedPython ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-white p-6">
            <pre className="overflow-x-auto rounded-[24px] border border-blue-100 bg-slate-950 px-5 py-5 text-sm font-mono text-slate-100">
              <code>{pythonCode}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};
