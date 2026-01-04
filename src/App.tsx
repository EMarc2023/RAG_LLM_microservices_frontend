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
  /* Base Background - This is your F3F3F3 */
  <div className="min-h-screen bg-[#F3F3F3] text-slate-800 font-sans antialiased selection:bg-blue-100">
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header Area */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          RAG Assistant
        </h1>
        <p className="text-slate-500 font-medium italic">
          TinyLlama 1.1B • TypeScript • React
        </p>
      </header>

      {/* SECTION 1: THE INPUT CARD */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 transition-all duration-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50/50">        <textarea 
          className="w-full bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder:text-slate-400 resize-none min-h-[120px] leading-relaxed"
          placeholder="What would you like to know?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askAI())}
          disabled={isTyping}
        />
      </div>

      {/* SECTION 2: THE ENHANCED BUTTON ROW */}
      <div className="flex items-center justify-center gap-4 my-8">
        {/* Secondary Buttons (Reset/Export) */}
        <button 
          onClick={resetChat} 
          className="px-6 py-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-full text-sm font-bold border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-400 hover:scale-105 active:scale-95"
        >
          Reset
        </button>
        
        <button 
          onClick={exportHistory}
          className="px-6 py-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-full text-sm font-bold border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-400 hover:scale-105 active:scale-95"
        >
          Export
        </button>

        {/* Main Action Button */}
        {isTyping ? (
          <button 
            onClick={stopGeneration}
            className="flex items-center gap-2 px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-red-200 hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <XCircle size={16} /> Stop
          </button>
        ) : (
          <button 
            onClick={askAI}
            disabled={!input.trim()}
            className="px-10 py-2.5 bg-[#0070CC] hover:bg-[#0062B3] text-white rounded-full text-sm font-bold shadow-md hover:shadow-blue-300 hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            Ask AI
          </button>
        )}
      </div>

      {/* SECTION 3: THE RESPONSE AREA */}
      <div className="space-y-6">
        {chat.length > 0 && (
          <div className={`bg-white rounded-[2rem] p-8 shadow-sm border ${isTyping ? 'border-blue-400 animate-pulse' : 'border-slate-200'} transition-colors duration-500`}>
            <div className="space-y-10">
              {chat.map((msg, i) => (
                <div key={i} className={`flex flex-col space-y-3 ${msg.role === 'user' ? 'opacity-40 grayscale pb-4 border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span className={msg.role === 'ai' ? 'text-blue-500' : 'text-slate-400'}>
                      {msg.role === 'ai' ? '● AI Assistant' : '○ Your Question'}
                    </span>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[17px]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.context && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono">
                        SRC: {msg.context}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isTyping && (
          <div className="flex items-center justify-center p-10 bg-white/40 border border-dashed border-slate-300 rounded-[2rem]">
            <div className="flex items-center gap-3 text-slate-400 font-medium">
              <Loader2 size={20} className="animate-spin text-[#0070CC]"/>
              <span className="text-sm tracking-wide">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  </div>
  );
}