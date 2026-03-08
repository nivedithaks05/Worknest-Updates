import { useState } from "react";
import { useUser, Task } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, X, Calendar } from "lucide-react";

const COLUMNS: { key: Task["status"]; title: string; dotColor: string }[] = [
  { key: "todo", title: "To Do", dotColor: "bg-muted-foreground" },
  { key: "inprogress", title: "In Progress", dotColor: "bg-primary" },
  { key: "done", title: "Done", dotColor: "bg-success" },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-primary/10 text-primary border-primary/20",
  Low: "bg-success/10 text-success border-success/20",
};

export default function Tasks() {
  const { tasks, addTask, deleteTask, updateTask } = useUser();
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      status: "todo",
      priority: newPriority,
      assignee: "You",
      dueDate: newDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      description: newDescription.trim(),
    });
    setNewTitle("");
    setNewPriority("Medium");
    setNewDueDate("");
    setNewDescription("");
    setShowModal(false);
  };

  const handleDrop = (status: Task["status"]) => {
    if (dragItem !== null) {
      updateTask(dragItem, { status });
      setDragItem(null);
    }
  };

  const formatDueDate = (d: string) => {
    if (!d) return "No date";
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Task Board</h2>
          <p className="text-sm text-muted-foreground mt-1">Drag tasks between columns to update status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary/30"); }}
              onDragLeave={e => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); }}
              onDrop={e => { e.currentTarget.classList.remove("ring-2", "ring-primary/30"); handleDrop(col.key); }}
              className="glass-card p-4 min-h-[320px] transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="font-display font-semibold text-sm">{col.title}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {colTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    draggable
                    onDragStart={() => setDragItem(task.id)}
                    onDragEnd={() => setDragItem(null)}
                    className={`group glass-card-hover p-3.5 cursor-grab active:cursor-grabbing ${
                      dragItem === task.id ? "opacity-40 ring-2 ring-primary scale-[0.97]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                        <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1 ml-5">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {task.assignee[0]}
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDueDate(task.dueDate)}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-10 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-surface p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg">Create New Task</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Task Title</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" placeholder="What needs to be done?" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Description (optional)</label>
                  <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={2} className="input-field resize-none" placeholder="Add more details..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {(["High", "Medium", "Low"] as const).map(p => (
                        <button
                          key={p} type="button" onClick={() => setNewPriority(p)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                            newPriority === p ? PRIORITY_STYLES[p] : "border-border text-muted-foreground hover:border-border/80"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Due Date</label>
                    <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="input-field" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-xs px-4 py-2">Cancel</button>
                  <button type="submit" className="btn-primary text-xs px-5 py-2"><Plus className="h-3.5 w-3.5" /> Create Task</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
