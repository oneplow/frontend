import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

interface DocsProps {
  apiUrl: string;
  userToken: string;
}

export default function Docs({ apiUrl, userToken }: DocsProps) {
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
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Terminal size={20} className="text-primary" /> API Documentation
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Use the endpoints below to integrate with our models. We provide an OpenAI-compatible API.
        </p>
      </div>

      <div className="p-6 space-y-8 text-left">
        {/* Authentication Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Authentication</h3>
          <p className="text-sm text-slate-600 mb-4">
            Authenticate your API requests using your API key in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Authorization</code> header.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono text-slate-700 break-all">
            Authorization: Bearer {displayToken}
          </div>
        </section>

        {/* Endpoints Section */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Code2 size={18} className="text-slate-600" /> /v1/chat/completions
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Creates a model response for the given chat conversation. This endpoint is fully compatible with the OpenAI API format.
          </p>

          <div className="space-y-6">
            {/* cURL Example */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-slate-800 text-slate-200 px-4 py-2 rounded-t-xl text-xs font-medium border-b border-slate-700">
                <span>cURL</span>
                <button
                  onClick={() => copyToClipboard(curlCommand, setCopiedCurl)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  {copiedCurl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedCurl ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-300 p-4 rounded-b-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {curlCommand}
              </pre>
            </div>

            {/* Python Example */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-slate-800 text-slate-200 px-4 py-2 rounded-t-xl text-xs font-medium border-b border-slate-700">
                <span>Python (OpenAI SDK)</span>
                <button
                  onClick={() => copyToClipboard(pythonCode, setCopiedPython)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  {copiedPython ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedPython ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-300 p-4 rounded-b-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {pythonCode}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
