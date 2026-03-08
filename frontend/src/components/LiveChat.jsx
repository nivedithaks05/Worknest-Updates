import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Search, Pencil, Trash2 } from "lucide-react";

function LiveChat({ userRole, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const bottomRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connect to WebSockets
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/chat/");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "chat_message") {
        setMessages((prev) => {
          // Prevent duplicates if already there
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } else if (data.action === "edit_message") {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.id ? { ...m, content: data.content } : m))
        );
      } else if (data.action === "delete_message") {
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    
    wsRef.current.send(
      JSON.stringify({
        action: "chat_message",
        sender_id: currentUser?.id || 1, // Fallback to 1 if not provided
        content: input,
      })
    );
    setInput("");
  };

  const handleEdit = (msgId, currentContent) => {
    if (userRole !== "Admin") return;
    setEditingId(msgId);
    setEditContent(currentContent);
  };

  const saveEdit = () => {
    if (!editContent.trim() || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        action: "edit_message",
        id: editingId,
        content: editContent,
      })
    );
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (msgId) => {
    if (userRole !== "Admin" || !wsRef.current) return;
    if (window.confirm("Are you sure you want to delete this message?")) {
      wsRef.current.send(
        JSON.stringify({
          action: "delete_message",
          id: msgId,
        })
      );
    }
  };

  // Static users list from original mock, just for UI
  const [users, setUsers] = useState([
    { id: 1, name: "General Channel", active: true, status: "Online" },
    { id: 2, name: "Project Hub", active: false, status: "Offline" },
  ]);
  const activeUser = users.find((u) => u.active) || users[0];

  return (
    <div className="h-full min-h-[480px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex flex-1 min-h-0">
        <aside className="w-80 max-w-xs border-r border-gray-200 bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Channels</h2>
            <div className="mt-2 relative">
              <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search channels"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="py-2">
              {users.map((user) => (
                <li key={user.id}>
                  <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${user.active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${user.status === "Online" ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-medium">{user.name}</p>
                      <p className="text-[11px] text-gray-400">{user.status}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          <header className="h-14 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                {activeUser.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activeUser.name}</p>
                <p className="text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Live
                  </span>
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-3 overflow-y-auto bg-gray-50">
            <div className="space-y-4 text-sm">
              {messages.map((msg) => {
                const isMe = msg.sender_id === (currentUser?.id || 1);
                const isEditing = editingId === msg.id;

                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`group relative max-w-xs sm:max-w-md rounded-2xl px-3 py-2 shadow-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"}`}>
                      {!isMe && <p className="text-[10px] font-semibold text-gray-500 mb-1">{msg.sender_name}</p>}
                      
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            className="text-gray-900 p-1 rounded text-sm w-full"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit();
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                          />
                          <div className="flex gap-2 text-xs">
                            <button onClick={saveEdit} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-800 px-2 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                      )}

                      <p className={`mt-1 text-[10px] ${isMe ? "text-blue-100/80" : "text-gray-500/80"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>

                      {/* Admin Controls */}
                      {userRole === "Admin" && !isEditing && (
                        <div className={`absolute -top-3 ${isMe ? "-left-16" : "-right-16"} opacity-0 group-hover:opacity-100 transition-opacity flex bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden`}>
                          <button onClick={() => handleEdit(msg.id, msg.content)} className="p-1.5 text-blue-600 hover:bg-gray-50 bg-white" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <div className="w-px bg-gray-200" />
                          <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-red-600 hover:bg-gray-50 bg-white" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <Paperclip className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full rounded-full border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button onClick={sendMessage} className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LiveChat;
