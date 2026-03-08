import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Send, Hash, Users } from "lucide-react";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

const CHANNELS = [
  { id: "general", name: "General", desc: "Company-wide chat", online: 12 },
  { id: "engineering", name: "Engineering", desc: "Dev discussions", online: 8 },
  { id: "random", name: "Random", desc: "Off-topic fun", online: 15 },
  { id: "announcements", name: "Announcements", desc: "Read-only updates", online: 0 },
];

const MOCK_REPLIES = [
  "Got it, thanks for the update! 👍",
  "Let me check and get back to you.",
  "Sounds good, I'll prioritize that.",
  "Can we discuss this in the standup?",
  "Sure thing! I'll push the changes today.",
  "Great idea! Let's sync on this tomorrow.",
  "On it! Will update the ticket shortly.",
];

const MOCK_USERS = ["Sarah", "Mike", "Priya", "Jordan", "Alex"];

export default function Chat() {
  const { user } = useUser();
  const [activeChannel, setActiveChannel] = useState("general");
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({
    general: [
      { id: 1, sender: "Sarah", content: "Hey team! Quick sync on the Q2 goals? 🎯", timestamp: new Date(Date.now() - 3600000), isMe: false },
      { id: 2, sender: user.username || "You", content: "Sure, let me pull up the doc.", timestamp: new Date(Date.now() - 1800000), isMe: true },
      { id: 3, sender: "Mike", content: "I'll join in 5 mins, finishing up a PR review", timestamp: new Date(Date.now() - 900000), isMe: false },
    ],
    engineering: [
      { id: 10, sender: "Jordan", content: "Has anyone tested the new API endpoint?", timestamp: new Date(Date.now() - 7200000), isMe: false },
      { id: 11, sender: "Alex", content: "Yes, all integration tests passing ✅", timestamp: new Date(Date.now() - 5400000), isMe: false },
    ],
    random: [
      { id: 20, sender: "Priya", content: "Who's up for lunch? 🍕", timestamp: new Date(Date.now() - 1200000), isMe: false },
    ],
    announcements: [
      { id: 30, sender: "Admin", content: "📢 New hybrid work policy starts next month. Check announcements for details.", timestamp: new Date(Date.now() - 86400000), isMe: false },
    ],
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = channelMessages[activeChannel] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      sender: user.username || "You",
      content: input.trim(),
      timestamp: new Date(),
      isMe: true,
    };
    setChannelMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }));
    setInput("");

    if (activeChannel !== "announcements") {
      setTimeout(() => {
        const sender = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        setChannelMessages(prev => ({
          ...prev,
          [activeChannel]: [...(prev[activeChannel] || []), {
            id: Date.now() + 1,
            sender,
            content: MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)],
            timestamp: new Date(),
            isMe: false,
          }],
        }));
      }, 1000 + Math.random() * 1000);
    }
  };

  const activeChannelData = CHANNELS.find(c => c.id === activeChannel)!;

  return (
    <div className="glass-card overflow-hidden flex h-[calc(100vh-180px)] min-h-[400px]">
      {/* Channel List */}
      <aside className="w-60 flex-shrink-0 border-r border-border flex-col bg-secondary/30 hidden md:flex overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-sm">Channels</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{CHANNELS.length} channels</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-all ${
                activeChannel === ch.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Hash className="h-4 w-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <span className="block truncate">{ch.name}</span>
                <span className="text-[10px] text-muted-foreground block">{ch.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile channel bar */}
      <div className="md:hidden flex overflow-x-auto border-b border-border bg-secondary/30 flex-shrink-0">
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
              activeChannel === ch.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            <Hash className="h-3 w-3" /> {ch.name}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-5 border-b border-border flex items-center justify-between bg-card flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-display font-semibold text-sm">{activeChannelData.name}</span>
            <span className="h-2 w-2 rounded-full bg-success" />
          </div>
          {activeChannelData.online > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {activeChannelData.online} online
            </div>
          )}
        </header>

        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 ${
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                {!msg.isMe && (
                  <p className="text-[10px] font-semibold text-primary mb-0.5">{msg.sender}</p>
                )}
                <p className="text-sm break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.isMe ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {activeChannel !== "announcements" ? (
          <div className="border-t border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message #${activeChannelData.name}...`}
                className="input-field flex-1"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-border p-3 bg-card text-center text-xs text-muted-foreground">
            This channel is read-only
          </div>
        )}
      </div>
    </div>
  );
}
