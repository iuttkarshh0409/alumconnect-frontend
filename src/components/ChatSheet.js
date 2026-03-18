import React, { useEffect, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Send, Clock, CheckCheck } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WS_URL = API_URL ? API_URL.replace(/^http/, "ws") : "";

const ChatSheet = ({ open, onOpenChange, conversationId, otherParticipant }) => {
  const { getToken, userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !conversationId) return;

    fetchMessages();

    let socket;
    let reconnectTimeout = null;

    const connectWS = async () => {
      try {
        const token = await getToken();
        socket = new WebSocket(`${WS_URL}/ws/${conversationId}?token=${token}`);

        socket.onopen = () => console.log("Chat WS Connected");

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === "typing") {
              if (data.sender_id !== userId) {
                setIsOtherTyping(data.is_typing);
              }
              return;
            }

            if (data.type === "read_receipt") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.sender_id === data.reader_id || m.conversation_id !== data.conversation_id
                    ? m
                    : { ...m, read_at: new Date().toISOString() }
                )
              );
              return;
            }
            
            setMessages((prev) => {
              const exists = prev.some(m => m.message_id === data.message_id || (m.message_id?.startsWith("temp_") && m.content === data.content && m.sender_id === data.sender_id));
              if (exists) {
                return prev.map(m => (m.sender_id === data.sender_id && m.content === data.content && m.message_id?.startsWith("temp_")) ? data : m);
              }
              return [...prev, data];
            });
          } catch (err) {
            console.error("Message parse error", err);
          }
        };

        socket.onclose = () => {
          console.log("Chat WS Disconnected, reconnecting...");
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        setWs(socket);
      } catch (err) {
        reconnectTimeout = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (socket) {
        socket.onclose = null; // Detach to avoid triggers
        socket.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [open, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!open || !conversationId || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender_id !== userId && !lastMsg.read_at) {
      const markRead = async () => {
        try {
          const token = await getToken();
          await axios.post(`${API_URL}/api/conversations/${conversationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error("Failed to mark read", err);
        }
      };
      markRead();
    }
  }, [messages.length, open, conversationId, userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    ws.send(JSON.stringify({ type: "typing", is_typing: false }));

    const payload = { content: newMessage };
    ws.send(JSON.stringify(payload));

    const optimisticMsg = {
      message_id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage,
      created_at: new Date().toISOString(),
      read_at: null
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800">
        <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-[#002147] dark:text-white">
              {otherParticipant?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#002147] dark:text-slate-100">{otherParticipant?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 capitalize">{otherParticipant?.role || "Participant"}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => {
              const isMe = m.sender_id === userId;
              return (
                <div
                  key={m.message_id || i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isMe
                        ? "bg-[#002147] dark:bg-slate-800 text-white dark:text-emerald-400 rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-900/50 border dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="break-words leading-relaxed">{m.content}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end text-[9px] opacity-70">
                      <Clock className="w-2.5 h-2.5" />
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      {isMe && (
                        <CheckCheck className={`w-3 h-3 ${m.read_at ? "text-blue-400" : "text-slate-400"}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          {isOtherTyping && (
            <div className="flex justify-start px-2 mb-1">
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl px-3 py-1 text-[10px] text-slate-500 flex items-center gap-1 font-bold tracking-tight">
                <div className="flex gap-1 items-center">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Typing...</span>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (!ws) return;
                ws.send(JSON.stringify({ type: "typing", is_typing: true }));
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  if (ws) ws.send(JSON.stringify({ type: "typing", is_typing: false }));
                }, 1500);
              }}
              placeholder="Type your message..."
              className="flex-1 rounded-full text-sm h-9 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            <Button type="submit" size="icon" className="rounded-full h-9 w-9 bg-[#002147] hover:bg-[#002147]/90 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
