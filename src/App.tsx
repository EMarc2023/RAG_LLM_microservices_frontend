import{ useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, Database, Loader2, Command} from 'lucide-react';

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

  // Auto-scroll to bottom whenever chat updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const askAI = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input };
    setChat((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    try {
      console.log("Sending query to Orchestrator:", currentQuery);
      
      // Adjust the URL and payload as per the backend API
      const response = await axios.post('http://localhost:8002/ask_ai', { 
        query: currentQuery 
      });

      console.log("Full Backend Response:", response.data);

      // LOGIC CHECK: Ensure these keys match your Python @app.post return statement
      const aiMsg: Message = { 
        role: 'ai', 
        content: response.data.ai_answer || response.data.response || "No answer key found in JSON", 
        context: response.data.context_used || "No context provided"
      };
      
      setChat((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      
      if (err instanceof Error) {
      console.error("Error message:", err.message); // Accessing the message property safely
      } else {
      console.error("Connection Error Details:", err);
      }
      
      setChat((prev) => [...prev, { 
        role: 'ai', 
        content: `⚠️ Error: ${err}. Check browser console (F12) for details.` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Command size={20} className="text-white"/></div>
            <span>RAG<span className="text-blue-500">LAB</span></span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1"><Database size={12}/> PORT: 8002</span>
            <span className="flex items-center gap-1 text-green-500"><Sparkles size={12}/> ONLINE</span>
          </div>
        </div>
      </nav>

      {/* Chat Messages */}
      <main className="flex-1 max-w-3xl w-full mx-auto py-8 px-6 overflow-y-auto">
        {chat.length === 0 && (
          <div className="text-center py-20 animate-in fade-in duration-700">
            <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4 text-blue-500">
              <Bot size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Knowledge base active</h2>
            <p className="text-slate-500 text-sm">Ask me anything about the stored documents.</p>
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
              
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {msg.context && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <Database size={10}/> SOURCES: {msg.context}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4 items-center text-slate-500 text-xs animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-blue-500"/>
              </div>
              <span>Searching vector database...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Bar */}
      <div className="p-6 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A] to-transparent sticky bottom-0">
        <div className="max-w-3xl mx-auto relative group">
          <input 
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-500 backdrop-blur-xl"
            placeholder="Type your query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAI()}
          />
          <button 
            onClick={askAI}
            disabled={isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-3 uppercase tracking-widest font-medium">
          Powered by TinyLlama-1.1B • Local RAG Engine
        </p>
      </div>
    </div>
  );
}