"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Sparkles, Send, Bot, User, Database, ChevronRight, Loader2 } from "lucide-react";
import { IntelligenceResponse } from "@/lib/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: IntelligenceResponse;
};

export function ChatConsole() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "SentinelAI Intelligence online. Ask me about corridor analytics, repeat offenders, or resource allocation."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const result = await api.queryIntelligence(userMsg);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: result.answer,
        data: result
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Error querying intelligence engine. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/80">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Intelligence Console
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>

              {msg.data && (
                <div className="w-full space-y-2 mt-1">
                  {msg.data.recommendations.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
                      <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Actions</div>
                      <ul className="text-xs text-emerald-400 space-y-1">
                        {msg.data.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <ChevronRight className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {msg.data.data_sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.data.data_sources.map((src, i) => (
                        <div key={i} className="flex items-center gap-1 text-[9px] uppercase font-mono text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                          <Database className="w-2.5 h-2.5" />
                          {src}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 rounded-tl-none text-sm flex items-center gap-2">
              Analyzing traffic data...
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form 
          className="flex w-full items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query traffic intelligence..." 
            className="flex-1 bg-slate-950 border-slate-700 focus-visible:ring-amber-500/50"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
