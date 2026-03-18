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
import { MessageSquare, Send, Clock, CheckCheck, ChevronLeft } from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const WS_URL = API_URL ? API_URL.replace(/^http/, "ws") : "";

const InboxSheet = ({ open, onOpenChange }) => {
  const { getToken, userId } = useAuth();
  const [view, setView] = useState("list"); // "list" | "chat"
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (error) {
       console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    if (open && view === "list") {
      fetchConversations();
    }
  }, [open, view]);

  useEffect(() => {
    if (view !== "chat" || !activeConvo) return;

    fetchMessages(activeConvo.conversation_id);

    let socket;
    let reconnectTimeout = null;
    let isConnected = false;

    const connectWS = async () => {
      try {
        const token = await getToken();
        socket = new WebSocket(`${WS_URL}/ws/${activeConvo.conversation_id}?token=${token}`);

        socket.onopen = () => {
          console.log("Inbox WS Connected");
          isConnected = true;
        };

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
          console.log("Inbox WS Disconnected, reconnecting...");
          isConnected = false;
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
         socket.onclose = null; // Detach to avoid reconnect loops triggers on unmount!
         socket.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [view, activeConvo]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    const payload = { content: newMessage };
    ws.send(JSON.stringify(payload));

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    ws.send(JSON.stringify({ type: "typing", is_typing: false }));

    const optimisticMsg = {
      message_id: `temp_${Date.now()}`,
      conversation_id: activeConvo.conversation_id,
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
        
        {view === "list" ? (
          <>
            <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <SheetTitle className="flex items-center gap-2 text-[#002147] dark:text-white">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Inbox
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              {conversations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No conversations yet</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {conversations.map((c) => (
                    <button
                      key={c.conversation_id}
                      onClick={() => {
                        setActiveConvo(c);
                        setView("chat");
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-center transition-all bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-white">
                          {c.other_participant?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#002147] dark:text-slate-200">{c.other_participant?.name || "Participant"}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{c.last_message?.content || "No messages yet"}</p>
                        </div>
                      </div>
                      {c.unread_count > 0 && (
                        <div className="bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {c.unread_count}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <>
            <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => { setView("list"); setActiveConvo(null); setMessages([]); }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <SheetTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-[#002147] dark:text-white">
                  {activeConvo?.other_participant?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#002147] dark:text-slate-100">{activeConvo?.other_participant?.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{activeConvo?.other_participant?.role}</p>
                </div>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => {
                  const isMe = m.sender_id === userId;
                  return (
                    <div key={m.message_id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-[#002147] dark:bg-slate-800 text-white dark:text-emerald-400 rounded-br-none" : "bg-slate-100 dark:bg-slate-900/50 border dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"}`}>
                        <p className="break-words leading-relaxed">{m.content}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end text-[9px] opacity-70">
                          <Clock className="w-2.5 h-2.5" />
                          {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          {isMe && <CheckCheck className={`w-3 h-3 ${m.read_at ? "text-blue-400" : "text-slate-400"}`} />}
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
                  placeholder="Type message..." 
                  className="flex-1 rounded-full h-9 text-sm" 
                />
                <Button type="submit" size="icon" className="rounded-full h-9 w-9 bg-[#002147] hover:bg-[#002147]/90 text-white"><Send className="w-4 h-4" /></Button>
              </div>
            </form>
          </>
        )}

      </SheetContent>
    </Sheet>
  );
};

export default InboxSheet;
