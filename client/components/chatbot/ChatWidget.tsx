"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  AlertTriangle,
  Bot,
  User,
  ChevronRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// -- Types ----------------------------------------------------------
interface ChatCTA {
  label: string;
  href: string;
  variant: "primary" | "outline";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
  cta?: ChatCTA;
  timestamp: Date;
}

// -- Quick-reply chips shown on greeting -------------------------
const QUICK_REPLIES = [
  "Book an appointment",
  "Treatment prices",
  "Meet our dentists",
  "Clinic hours",
];

// -- Main component --------------------------------------------------
export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // -- Message history ------------------------------------------------
  const [messages, setMessages] = useState<Message[]>([{
    id: "greeting",
    role: "assistant",
    content:
      "Hi! I'm your SmileCare assistant. Ask me about treatments, book appointments, or get answers to your dental questions.",
    timestamp: new Date(),
  }]);

  // -- Auto-open greeting (only on homepage, not on booking/payment) --
  useEffect(() => {
    const pathname = window.location.pathname;
    const isSensitivePage = pathname.includes("/book") || 
                           pathname.includes("/appointment") || 
                           pathname.includes("/payment");
    
    if (!hasAutoOpened && !isSensitivePage) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  // -- Auto-focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // -- Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -- Clear badge when user opens chat
  const handleToggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setShowBadge(false);
  }, [isOpen]);

  // -- Send message to AI backend
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      try {
        const res = await fetch(`${API}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            userId: user?.id || null,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "Sorry, I couldn't process that.",
          isEmergency: data.isEmergency || false,
          cta: data.cta,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I'm having trouble connecting. Please try again later.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, user]
  );

  // -- Quick reply handler
  const handleQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  // -- Keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // -- CTA button handler
  const handleCTAClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={handleToggleChat}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {showBadge && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            1
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <Bot size={24} />
              <div>
                <h3 className="font-semibold">SmileCare Assistant</h3>
                <p className="text-xs text-teal-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={handleToggleChat}
              className="rounded-full p-1 transition-colors hover:bg-teal-700"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <Bot size={16} className="text-teal-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.isEmergency && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle size={16} />
                      <span className="font-semibold">Emergency Detected</span>
                    </div>
                  )}
                  // ✅ AFTER (works with react-markdown v9+)
<div className="prose prose-sm max-w-none">
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      a: ({ href, children }) => (
        <a href={href} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>

                  {msg.cta && (
                    <button
                      onClick={() => handleCTAClick(msg.cta!.href)}
                      className={`mt-3 flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        msg.cta.variant === "primary"
                          ? "bg-teal-600 text-white hover:bg-teal-700"
                          : "border border-teal-600 text-teal-600 hover:bg-teal-50"
                      }`}
                    >
                      <span>{msg.cta.label}</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Quick replies (show only after greeting) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="rounded-full border border-teal-600 px-4 py-2 text-sm text-teal-600 transition-colors hover:bg-teal-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                  <Bot size={16} className="text-teal-600" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
