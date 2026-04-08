import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, RotateCcw } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "bot";
  content: string;
}

const API_URL = "https://ms-agente-rag-481810000953.us-east1.run.app/chat";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const threadId = useMemo(() => `thread_${crypto.randomUUID()}`, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ thread_id: threadId, message: text }),
      });

      if (!res.ok) throw new Error("Error en la respuesta");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Ocurrió un error al conectar con el asistente. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    window.location.reload();
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Asistente IA</h1>
            <p className="text-xs text-muted-foreground">En línea</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={resetChat} title="Nueva conversación">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chat-bot">
              <Bot className="h-7 w-7" />
            </div>
            <p className="text-sm">¡Hola! Soy tu asistente. Escribe un mensaje para empezar.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chat-bot">
              <Bot className="h-4 w-4 text-chat-bot-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-chat-bot px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
};

export default Index;
