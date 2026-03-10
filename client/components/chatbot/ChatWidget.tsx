"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/lib/api-base";
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

const QUICK_REPLIES = [
  "Book an appointment",
  "Treatment prices",
  "Meet our dentists",
  "Clinic hours",
];

const HIDDEN_PATH_PREFIXES = ["/booking", "/login", "/register", "/signup", "/auth/callback"];
const HIDDEN_PATH_MATCHES = ["/payment"];

export default function ChatWidget() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const shouldHide = HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    HIDDEN_PATH_MATCHES.some((segment) => pathname.includes(segment));

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content:
        "Hi! I'm your SmileCare assistant. Ask me about treatments, book appointments, or get answers to your dental questions.",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    if (shouldHide) {
      setIsOpen(false);
      return;
    }

    if (!hasAutoOpened && window.innerWidth >= 1024) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened, shouldHide]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setShowBadge(false);
  }, [isOpen]);

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
        const apiBaseUrl = getApiBaseUrl();
        const res = await fetch(`${apiBaseUrl}/api/chatbot/message`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            userId: user?.id || null,
            history: messages.map((m) => ({
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
          content: data.data?.reply || data.reply || "Sorry, I couldn't process that.",
          isEmergency: data.data?.isEmergency || data.isEmergency || false,
          cta: data.data?.cta || data.cta,
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
            content: "Sorry, I'm having trouble connecting. Please try again later.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, user]
  );

  const handleQuickReply = (text: string) => {
    void handleSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(inputValue);
    }
  };

  const handleCTAClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleToggleChat}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {showBadge && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            1
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 z-50 flex h-[min(70vh,32rem)] flex-col rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[22rem]">
          <div
            className="flex items-center justify-between rounded-t-2xl px-4 py-3 text-white sm:px-5 sm:py-4"
            style={{ background: "var(--primary)" }}
          >
            <div className="flex items-center gap-3">
              <Bot size={22} />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">SmileCare Assistant</h3>
                <p className="text-[11px] text-white/70 sm:text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={handleToggleChat}
              className="rounded-full p-1 transition-colors hover:bg-white/20"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 sm:p-4 sm:space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
                    <Bot size={15} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-sm sm:max-w-[78%] sm:px-4 sm:py-3 ${msg.role === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"}`}
                >
                  {msg.isEmergency && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      <AlertTriangle size={16} />
                      <span className="font-semibold">Emergency Detected</span>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none break-words">
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
                      className={`mt-3 flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors ${msg.cta.variant === "primary" ? "bg-primary text-white hover:opacity-90" : "border border-primary text-primary hover:bg-primary/5"}`}
                    >
                      <span>{msg.cta.label}</span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary sm:h-8 sm:w-8">
                    <User size={15} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="rounded-full border border-primary px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/5 sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
                  <Bot size={15} className="text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="min-h-11 flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-4 sm:py-3"
              />
              <button
                onClick={() => void handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 sm:text-xs">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
