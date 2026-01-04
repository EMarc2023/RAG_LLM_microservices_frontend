import { useState, useEffect, useRef } from 'react';
import axios, { CanceledError } from 'axios';
import ReactMarkdown from 'react-markdown';
import { XCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  context?: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const askAI = async () => {
    if (!input.trim() || isTyping) return;

    abortControllerRef.current = new AbortController();
    
    const userMsg: Message = { role: 'user', content: input };
    setChat((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8002/ask_ai', 
        { query: currentQuery },
        { signal: abortControllerRef.current.signal }
      );

      const aiMsg: Message = { 
        role: 'ai', 
        content: response.data.ai_answer || "No response found", 
        context: response.data.context_used
      };
      setChat((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      if (err instanceof CanceledError) {
        setChat((prev) => [...prev, { role: 'ai', content: '*Request cancelled by user.*' }]);
      } else {
        setChat((prev) => [...prev, { role: 'ai', content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}` }]);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const resetChat = () => {
    if (confirm("Clear all messages and input?")) {
      setChat([]);
      setInput('');
    }
  };

  const exportHistory = () => {
    const historyText = chat.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rag_history_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6 md:p-12 lg:p-20">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="space-y-1">
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">RAG Assistant</h1>
          <p className="text-xl text-slate-500 font-medium">Generative AI RAG Chatbot</p>
          <p className="text-sm text-slate-400">Powered by TinyLlama 1.1B</p>
        </header>

        {/* 1. INPUT CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all focus-within:shadow-md">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 text-xl text-slate-800 placeholder:text-slate-400 resize-none min-h-[140px]"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askAI())}
            disabled={isTyping}
          />
          
          <div className="flex items-center justify-between mt-6">
            {/* Utility Buttons */}
            <div className="flex gap-8">
              <button 
                onClick={resetChat} 
                className="text-slate-400 hover:text-slate-600 transition text-sm font-semibold"
              >
                Reset
              </button>
              <button 
                onClick={exportHistory}
                className="text-slate-400 hover:text-slate-600 transition text-sm font-semibold"
              >
                Export .txt
              </button>
            </div>

            {/* Conditional Action Button: Stop vs Ask AI */}
            {isTyping ? (
              <button 
                onClick={stopGeneration}
                className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                <XCircle size={18} /> Stop
              </button>
            ) : (
              <button 
                onClick={askAI}
                disabled={!input.trim()}
                className="px-12 py-3 bg-[#0070CC] hover:bg-[#005fa3] text-white rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
              >
                Ask AI
              </button>
            )}
          </div>
        </div>

        {/* 2. RESPONSE AREA */}
        <div className="space-y-6">
          {chat.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="space-y-10">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'opacity-60 border-b border-slate-50 pb-6' : ''}`}>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {msg.role === 'ai' ? 'Response' : 'Question'}
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.context && (
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        SOURCES: {msg.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isTyping && (
            <div className="flex items-center justify-center p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200">
              <div className="flex items-center gap-3 text-slate-400 font-medium italic">
                <Loader2 size={20} className="animate-spin text-[#0070CC]"/>
                <span>AI is searching and generating...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
}