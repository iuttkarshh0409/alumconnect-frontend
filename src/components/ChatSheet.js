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
    const connectWS = async () => {
      const token = await getToken();
      socket = new WebSocket(`${WS_URL}/ws/${conversationId}?token=${token}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "read_receipt") {
          // Update reads dynamically
          setMessages((prev) =>
            prev.map((m) =>
              m.sender_id === data.reader_id || m.conversation_id !== data.conversation_id
                ? m
                : { ...m, read_at: new Date().toISOString() }
            )
          );
          return;
        }
        setMessages((prev) => [...prev, data]);
      };

      socket.onclose = () => console.log("WebSocket Disconnected");
      setWs(socket);
    };

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, [open, conversationId]);

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

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full text-sm h-9 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
          <Button type="submit" size="icon" className="rounded-full h-9 w-9 bg-[#002147] hover:bg-[#002147]/90 text-white">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
