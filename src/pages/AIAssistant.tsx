import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";

interface AiMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  summarize: `📋 **Here's your workspace summary:**\n\n• You have **{pending}** pending tasks across your board\n• **{announcements}** active announcements, including **{highPri}** high priority\n• The latest update is: "{latestTitle}"\n• Your most urgent task is due {urgentDue}\n\nWant me to draft a status update email based on this?`,
  email: `📧 **Draft Email:**\n\nSubject: Weekly Status Update – {date}\n\nHi Team,\n\nHere's a quick update on my progress this week:\n\n✅ Completed: {doneTasks}\n🔄 In Progress: {inprogressTasks}\n📋 Upcoming: {todoTasks}\n\nLet me know if you need any clarification.\n\nBest regards,\n{user}`,
  priorities: `🎯 **Your Current Priorities:**\n\n{priorityList}\n\nI'd recommend focusing on the item with the earliest due date first.`,
  message: `💬 **Draft Team Message:**\n\nHey team! 👋\n\nQuick update from my side:\n\n• Currently working on {currentWork}\n• Next up: {nextWork}\n• On track for our sprint goals\n\nCheers,\n{user}`,
  default: `I can help you with:\n\n• **"Summarize my updates"** – Quick overview\n• **"Draft an email"** – Professional status update\n• **"What are my priorities?"** – High-priority items\n• **"Help me draft a message"** – Team communications\n\nWhat would you like? 🚀`,
};

export default function AIAssistant() {
  const { user, tasks, announcements } = useUser();
  const [messages, setMessages] = useState<AiMessage[]>([
    { id: 1, role: "assistant", content: `Hey ${user.username || "there"}! 👋 I'm your WorkNest AI Copilot. I can summarize updates, draft emails, prioritize your tasks, and more.\n\nTry one of the quick actions below or just ask me anything!` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const getResponse = (query: string): string => {
    const q = query.toLowerCase();
    const pending = tasks.filter(t => t.status !== "done").length;
    const highPri = announcements.filter(a => a.type === "high").length;
    const date = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    const doneTasks = tasks.filter(t => t.status === "done").map(t => t.title).join(", ") || "None yet";
    const inprogressTasks = tasks.filter(t => t.status === "inprogress").map(t => t.title).join(", ") || "None";
    const todoTasks = tasks.filter(t => t.status === "todo").map(t => t.title).join(", ") || "None";
    const latestTitle = announcements[0]?.title || "No announcements";
    const urgentTask = tasks.filter(t => t.status !== "done").sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    const urgentDue = urgentTask ? new Date(urgentTask.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "N/A";
    const priorityList = tasks.filter(t => t.status !== "done").sort((a, b) => { const o = { High: 0, Medium: 1, Low: 2 }; return o[a.priority] - o[b.priority]; }).map((t, i) => { const icon = t.priority === "High" ? "🔴" : t.priority === "Medium" ? "🟡" : "🟢"; return `${i + 1}. ${icon} **${t.title}** – Due ${new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`; }).join("\n") || "No pending tasks!";
    const currentWork = tasks.filter(t => t.status === "inprogress").map(t => t.title).join(", ") || "planning next steps";
    const nextWork = tasks.filter(t => t.status === "todo").slice(0, 2).map(t => t.title).join(", ") || "reviewing backlog";

    let response = MOCK_RESPONSES.default;
    if (q.includes("summar")) response = MOCK_RESPONSES.summarize;
    else if (q.includes("email") || q.includes("draft an")) response = MOCK_RESPONSES.email;
    else if (q.includes("priorit") || q.includes("urgent") || q.includes("focus")) response = MOCK_RESPONSES.priorities;
    else if (q.includes("message") || q.includes("draft a m") || q.includes("write")) response = MOCK_RESPONSES.message;

    return response.replace("{pending}", String(pending)).replace("{announcements}", String(announcements.length)).replace("{highPri}", String(highPri)).replace("{user}", user.username || "User").replace("{date}", date).replace("{doneTasks}", doneTasks).replace("{inprogressTasks}", inprogressTasks).replace("{todoTasks}", todoTasks).replace("{latestTitle}", latestTitle).replace("{urgentDue}", urgentDue).replace("{priorityList}", priorityList).replace("{currentWork}", currentWork).replace("{nextWork}", nextWork);
  };

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: getResponse(msg) }]);
      setTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const quickActions = [
    { label: "📋 Summarize updates", msg: "Summarize my recent updates" },
    { label: "📧 Draft an email", msg: "Draft a status update email" },
    { label: "🎯 My priorities", msg: "What are my priorities?" },
    { label: "💬 Draft a message", msg: "Help me draft a team message" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">AI Copilot</h2>
          <p className="text-sm text-muted-foreground mt-1">Your workspace assistant — summarize, draft, and plan.</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> AI Powered
        </div>
      </div>

      <div className="glass-card flex flex-col h-[calc(100vh-240px)] min-h-[400px]">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-lg rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pb-2 flex gap-2 flex-wrap">
          {quickActions.map(action => (
            <button key={action.label} onClick={() => sendMessage(action.msg)} disabled={typing}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !typing) sendMessage(); }} placeholder="Ask me anything..." disabled={typing} className="input-field flex-1" />
            <button onClick={() => sendMessage()} disabled={typing || !input.trim()} className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
