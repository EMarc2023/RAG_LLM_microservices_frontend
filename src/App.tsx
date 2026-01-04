import { useState, useEffect, useRef } from 'react';
import axios, { CanceledError } from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, Loader2, Command, XCircle, Trash2, Download } from 'lucide-react';

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
  
  // Feature: AbortController (The "Stop" button logic)
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const askAI = async () => {
    if (!input.trim() || isTyping) return;

    // Initialize the kill switch
    abortControllerRef.current = new AbortController();
    
    const userMsg: Message = { role: 'user', content: input };
    setChat((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8002/ask_ai', 
        { query: currentQuery },
        { signal: abortControllerRef.current.signal } // Link signal to axios
      );

      const aiMsg: Message = { 
        role: 'ai', 
        content: response.data.ai_answer || "No response found", 
        context: response.data.context_used
      };
      
      setChat((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      if (err instanceof CanceledError) {
        setChat((prev) => [...prev, { role: 'ai', content: '_Request cancelled by user._' }]);
      } else {
        setChat((prev) => [...prev, { role: 'ai', content: `⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}` }]);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // FEATURE: Stop Button Logic
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // FEATURE: Reset Logic
  const resetChat = () => {
    if (confirm("Clear all messages and input?")) {
      setChat([]);
      setInput('');
    }
  };

  // FEATURE: Export Logic
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
    <div className="min-h-screen bg-[#F3F3F3] text-slate-900 font-sans p-8 md:p-16">      
    {/* Header */}
      <nav className="border-b border-slate-800 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Command size={20} className="text-white"/></div>
            <span>RAG<span className="text-blue-500">LAB</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={resetChat} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
              <Trash2 size={14}/> Reset
            </button>
            <button onClick={exportHistory} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
              <Download size={14}/> Export .txt
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container: Top Input Layout */}
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 p-6 gap-6">
        
        {/* 1. TOP: Input Bar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-xl">
          <div className="relative">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-500 resize-none min-h-[80px]"
              placeholder="Type your query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askAI())}
              disabled={isTyping}
            />
            <div className="flex justify-end mt-2">
              {isTyping ? (
                <button 
                  onClick={stopGeneration}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all animate-pulse"
                >
                  <XCircle size={18} /> Stop
                </button>
              ) : (
                <button 
                  onClick={askAI}
                  disabled={!input.trim()}
                  className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={18} /> Ask AI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. MIDDLE: Progress Indicator */}
        <div className={`h-1 w-full bg-slate-800 rounded-full overflow-hidden transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full bg-blue-500 animate-progress-stripes w-full"></div>
        </div>

        {/* 3. BOTTOM: Response Area (Fills space) */}
        <main className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 overflow-y-auto mb-4 relative">
          {chat.length === 0 && !isTyping && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Knowledge base ready. Ask your first question above.</p>
            </div>
          )}

          <div className="space-y-6">
            {chat.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === 'ai' ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}>
                  {msg.role === 'ai' ? <Bot size={16}/> : <User size={16}/>}
                </div>
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none shadow-lg'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                  {msg.context && (
                    <div className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                      SOURCES: {msg.context}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 items-center text-slate-500 text-xs italic">
                <Loader2 size={14} className="animate-spin text-blue-500"/>
                <span>AI is searching the vector database...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </main>
      </div>
    </div>
  );
}