import { useState, useEffect } from "react";
import api from "../api/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const COLUMN_CONFIG = {
  todo: {
    title: "To Do",
    borderClass: "border-gray-200",
    accentClass: "text-gray-600 bg-gray-100",
  },
  inprogress: {
    title: "In Progress",
    borderClass: "border-blue-200",
    accentClass: "text-blue-600 bg-blue-50",
  },
  done: {
    title: "Done",
    borderClass: "border-green-200",
    accentClass: "text-green-600 bg-green-50",
  },
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-600 border-red-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function Tasks() {
  // 1. Initial State (Empty at first, we fetch data on load)
  const [columns, setColumns] = useState({ todo: [], inprogress: [], done: [] });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState("all"); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Fetch Tasks from Django Backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("tasks/");
      const allTasks = response.data;

      // Organize tasks into columns based on status
      // Note: We add default 'priority' and 'assignee' because the backend might not send them yet
      const processTask = (t) => ({
        ...t,
        priority: t.priority || "Medium", // Default for UI
        assignee: "You", // Default for UI (since backend sends user ID)
        dueDate: t.due_date // Map backend 'due_date' to frontend 'dueDate'
      });

      const organized = {
        todo: allTasks.filter(t => t.status === 'todo').map(processTask),
        inprogress: allTasks.filter(t => t.status === 'inprogress').map(processTask),
        done: allTasks.filter(t => t.status === 'done').map(processTask)
      };
      setColumns(organized);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Unable to load tasks from server.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Add Task (POST to Backend)
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
        const payload = {
            title: newTaskTitle.trim(),
            status: "todo",
            due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
        };

        const response = await api.post("tasks/", payload);
        
        // Add the new task from server to the UI immediately
        const newTaskForUI = {
            ...response.data,
            priority: "Medium",
            assignee: "You",
            dueDate: response.data.due_date
        };

        setColumns((prev) => ({
            ...prev,
            todo: [...prev.todo, newTaskForUI],
        }));

        setNewTaskTitle("");
        // Re-fetch to stay in sync with backend
        fetchTasks();
    } catch (error) {
        console.error("Error adding task:", error);
        setError("Unable to create task. Please try again.");
    }
  };

  // 4. Delete Task (DELETE to Backend)
  const deleteTask = async (columnKey, id) => {
    if(!window.confirm("Delete this task?")) return;
    
    // Optimistic Update (Remove from UI immediately)
    setColumns((prev) => ({
      ...prev,
      [columnKey]: prev[columnKey].filter((task) => task.id !== id),
    }));

    // Send delete request
    try {
        await api.delete(`tasks/${id}/`);
    } catch (error) {
        console.error("Error deleting task:", error);
        setError("Unable to delete task. Refreshing the board.");
        fetchTasks(); // Revert on error
    }
  };

  // 5. Drag & Drop (PATCH to Backend)
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol === destCol && source.index === destination.index) return;

    // Calculate new state
    const sourceTasks = Array.from(columns[sourceCol] || []);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    const destTasks = sourceCol === destCol 
        ? sourceTasks 
        : Array.from(columns[destCol] || []);

    // Update status in object if moving columns
    if (sourceCol !== destCol) {
        movedTask.status = destCol;
    }

    destTasks.splice(destination.index, 0, movedTask);

    const newColumns = {
        ...columns,
        [sourceCol]: sourceTasks,
        [destCol]: destTasks,
    };

    setColumns(newColumns);

    // If column changed, save to Backend
    if (sourceCol !== destCol) {
        try {
            await api.patch(`tasks/${movedTask.id}/`, {
                status: destCol
            });
        } catch (error) {
            console.error("Error updating status:", error);
            setError("Unable to update task status. It will sync on refresh.");
        }
    }
  };

  // --- Helper Functions (From your code) ---
  const formatDueDate = (dateStr) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const filterTasks = (tasks) => {
    if (filter === "mine") return tasks.filter((t) => t.assignee === "You");
    if (filter === "dueSoon") {
      const now = new Date();
      const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return tasks.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= now && d <= inSevenDays;
      });
    }
    return tasks;
  };

  const columnOrder = ["todo", "inprogress", "done"];

  // --- Render ---
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Task Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize work across your team with drag &amp; drop.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600">
            {['all', 'mine', 'dueSoon'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full capitalize ${
                    filter === f ? "bg-gray-900 text-white" : "hover:bg-gray-100"
                    }`}
                >
                    {f === 'dueSoon' ? 'Due Soon' : f === 'mine' ? 'My Tasks' : 'All Tasks'}
                </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Quick add task..."
              className="w-full sm:w-52 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addTask}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Task
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-xs text-gray-500 animate-pulse">
          Loading tasks from WorkNest...
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {columnOrder.map((columnKey) => {
            const config = COLUMN_CONFIG[columnKey];
            const tasks = filterTasks(columns[columnKey] || []);

            return (
              <Droppable key={columnKey} droppableId={columnKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col rounded-xl border ${config.borderClass} bg-gray-50/60 p-3 md:p-4 min-h-[260px] transition-shadow ${
                      snapshot.isDraggingOver ? "shadow-md bg-white" : "shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.accentClass}`}>
                          {config.title}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {tasks.length} task{tasks.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {tasks.map((task, index) => {
                        const priority = task.priority || "Medium";
                        const priorityStyle = PRIORITY_STYLES[priority];
                        
                        return (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`group bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-pointer transition-all hover:shadow-md hover:border-blue-200 ${
                                  dragSnapshot.isDragging ? "ring-2 ring-blue-500 ring-offset-1" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-[13px] font-semibold text-gray-900 line-clamp-2">
                                    {task.title}
                                  </p>
                                  <span className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityStyle}`}>
                                    {priority}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-semibold text-white">
                                      {(task.assignee || "You").substring(0, 1)}
                                    </div>
                                    <span className="text-[11px] text-gray-500">
                                      {task.assignee}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] text-gray-400">Due</span>
                                    <span className="text-[11px] font-medium text-gray-700">
                                      {formatDueDate(task.dueDate)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => deleteTask(columnKey, task.id)}
                                  className="mt-2 hidden text-[11px] text-red-500 hover:text-red-600 group-hover:inline-flex self-end w-full justify-end"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {tasks.length === 0 && (
                        <p className="text-[11px] text-gray-400 text-center py-4">
                          No tasks in this column.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Tasks;