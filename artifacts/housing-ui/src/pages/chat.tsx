import React, { useState, useRef, useEffect } from "react";
import { useAgentQuery } from "@workspace/api-client-react";
import { Send, Sparkles, Building, Search, ArrowRight, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "I'm a young professional making $60k/year. Where should I live?",
  "What are the safest neighborhoods with rent under $1,200?",
  "Where can I find affordable family-friendly areas in Chicago?"
];

function LoadingState() {
  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing Chicago housing data...",
    "Evaluating crime rates and affordability...",
    "Matching neighborhoods to your needs...",
    "Formulating recommendations..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full h-16 w-16" />
          <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center relative z-10 shadow-lg">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2 w-full max-w-sm">
          {steps.map((text, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 transition-opacity duration-500 ${
                index === step ? "opacity-100" : index < step ? "opacity-40" : "opacity-0"
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />
              <span className={`text-sm font-medium ${index === step ? "text-primary" : "text-muted-foreground"}`}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const agentMutation = useAgentQuery();

  const handleSend = (text: string) => {
    if (!text.trim() || agentMutation.isPending) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    agentMutation.mutate({ data: { question: text } }, {
      onSuccess: (data) => {
        setMessages(prev => [
          ...prev, 
          { id: (Date.now() + 1).toString(), role: "agent", content: data.answer }
        ]);
      },
      onError: (error) => {
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "agent", content: "I'm sorry, I encountered an error while processing your request. Please try again." }
        ]);
      }
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentMutation.isPending]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full h-[calc(100dvh-4rem)]">
      
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Building className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">
              Find Your Place in Chicago
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Ask our AI assistant to recommend neighborhoods based on your income, lifestyle, and priorities. Grounded in real civic data.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 text-left">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">Suggested queries</p>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="w-full text-left p-4 rounded-xl border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all shadow-sm hover:shadow group flex items-center justify-between"
              >
                <span className="text-card-foreground font-medium">{q}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col border rounded-xl bg-card shadow-sm overflow-hidden mt-4">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted/50 text-foreground rounded-tl-sm border"
                  }`}>
                    {msg.role === "agent" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Assistant</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {agentMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] w-full">
                    <LoadingState />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="w-full max-w-3xl mt-6">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center shadow-lg rounded-full bg-background border"
        >
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about renting in Chicago..."
            className="w-full pl-12 pr-14 py-6 text-base rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            disabled={agentMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 rounded-full h-10 w-10 transition-transform active:scale-95"
            disabled={!input.trim() || agentMutation.isPending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Powered by Chicago open data. AI can make mistakes, verify important details.
        </p>
      </div>

    </div>
  );
}
