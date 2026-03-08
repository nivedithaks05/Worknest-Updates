import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "user";

export interface Announcement {
  id: number;
  title: string;
  author: string;
  date: string;
  priority: "High Priority" | "General";
  type: "high" | "general";
  content: string;
  category: string;
}

export interface Task {
  id: number;
  title: string;
  status: "todo" | "inprogress" | "done";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  dueDate: string;
  description?: string;
}

export interface MockEmployee {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  department: string;
  joinDate: string;
}

interface UserState {
  isAuthenticated: boolean;
  role: UserRole | null;
  username: string | null;
  email: string | null;
}

interface UserContextType {
  user: UserState;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  announcements: Announcement[];
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  deleteAnnouncement: (id: number) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (t: Omit<Task, "id">) => void;
  deleteTask: (id: number) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  employees: MockEmployee[];
  addEmployee: (e: Omit<MockEmployee, "id">) => void;
  updateEmployee: (id: number, updates: Partial<MockEmployee>) => void;
  deleteEmployee: (id: number) => void;
}

// Hardcoded accounts
const ACCOUNTS: Record<string, { password: string; role: UserRole; name: string }> = {
  "admin@worknest.com": { password: "password", role: "admin", name: "Admin" },
  "user@worknest.com": { password: "password", role: "user", name: "Alex Chen" },
};

const defaultAnnouncements: Announcement[] = [
  {
    id: 1, title: "Q2 Product Launch Timeline", author: "Alex Johnson",
    date: "March 5, 2026", priority: "High Priority", type: "high", category: "Product",
    content: "We are targeting the last week of May for the Q2 product launch. Please review the updated milestones and ensure your team is aligned with the revised deliverables. All design assets must be finalized by April 15th.",
  },
  {
    id: 2, title: "New Hybrid Work Policy", author: "HR Team",
    date: "March 2, 2026", priority: "General", type: "general", category: "Policy",
    content: "Starting next month, we are introducing a more flexible hybrid work model. Employees can choose up to three remote days per week. Please fill out the preference form by March 15th.",
  },
  {
    id: 3, title: "Security Training Reminder", author: "IT Security",
    date: "February 28, 2026", priority: "High Priority", type: "high", category: "IT",
    content: "All employees are required to complete the updated security awareness training before the end of this month to keep systems compliant. Non-compliance may result in restricted access.",
  },
  {
    id: 4, title: "Town Hall Meeting – Q1 Recap", author: "Leadership Team",
    date: "February 20, 2026", priority: "General", type: "general", category: "Events",
    content: "Join us for the quarterly town hall where we will share company performance, upcoming initiatives, and an open Q&A session with the executive team.",
  },
];

const defaultTasks: Task[] = [
  { id: 1, title: "Design system audit", status: "todo", priority: "High", assignee: "You", dueDate: "2026-03-15", description: "Review and update all design tokens" },
  { id: 2, title: "Write API documentation", status: "todo", priority: "Medium", assignee: "You", dueDate: "2026-03-18", description: "Document all REST endpoints" },
  { id: 3, title: "Review PR #247", status: "inprogress", priority: "High", assignee: "You", dueDate: "2026-03-10", description: "Code review for auth module" },
  { id: 4, title: "Update onboarding flow", status: "inprogress", priority: "Medium", assignee: "You", dueDate: "2026-03-12", description: "Redesign the new user experience" },
  { id: 5, title: "Deploy v2.1 hotfix", status: "done", priority: "High", assignee: "You", dueDate: "2026-03-05", description: "Critical bug fix deployed" },
  { id: 6, title: "Team standup notes", status: "done", priority: "Low", assignee: "You", dueDate: "2026-03-04", description: "Weekly standup summary" },
];

const defaultEmployees: MockEmployee[] = [
  { id: 1, name: "Alex Johnson", email: "alex@worknest.io", role: "admin", status: "active", department: "Engineering", joinDate: "2024-01-15" },
  { id: 2, name: "Sarah Chen", email: "sarah@worknest.io", role: "user", status: "active", department: "Design", joinDate: "2024-03-20" },
  { id: 3, name: "Mike Rivera", email: "mike@worknest.io", role: "user", status: "active", department: "Marketing", joinDate: "2024-06-10" },
  { id: 4, name: "Priya Patel", email: "priya@worknest.io", role: "user", status: "inactive", department: "Product", joinDate: "2024-02-28" },
  { id: 5, name: "Jordan Lee", email: "jordan@worknest.io", role: "user", status: "active", department: "Engineering", joinDate: "2025-01-05" },
];

const UserContext = createContext<UserContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(() =>
    loadFromStorage("worknest_user", { isAuthenticated: false, role: null, username: null, email: null })
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadFromStorage("worknest_announcements", defaultAnnouncements)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage("worknest_tasks", defaultTasks)
  );
  const [employees, setEmployees] = useState<MockEmployee[]>(() =>
    loadFromStorage("worknest_employees", defaultEmployees)
  );

  useEffect(() => { localStorage.setItem("worknest_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("worknest_announcements", JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem("worknest_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("worknest_employees", JSON.stringify(employees)); }, [employees]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const account = ACCOUNTS[email.toLowerCase()];
    if (!account) return { success: false, error: "Account not found. Try admin@worknest.com or user@worknest.com" };
    if (account.password !== password) return { success: false, error: "Invalid password. Hint: password" };
    setUser({ isAuthenticated: true, role: account.role, username: account.name, email: email.toLowerCase() });
    return { success: true };
  };

  const logout = () => {
    setUser({ isAuthenticated: false, role: null, username: null, email: null });
  };

  const addAnnouncement = (a: Omit<Announcement, "id">) => {
    setAnnouncements(prev => [{ ...a, id: Date.now() }, ...prev]);
  };
  const deleteAnnouncement = (id: number) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };
  const addTask = (t: Omit<Task, "id">) => {
    setTasks(prev => [...prev, { ...t, id: Date.now() }]);
  };
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const addEmployee = (e: Omit<MockEmployee, "id">) => {
    setEmployees(prev => [...prev, { ...e, id: Date.now() }]);
  };
  const updateEmployee = (id: number, updates: Partial<MockEmployee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const deleteEmployee = (id: number) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  return (
    <UserContext.Provider value={{
      user, login, logout,
      announcements, addAnnouncement, deleteAnnouncement,
      tasks, setTasks, addTask, deleteTask, updateTask,
      employees, addEmployee, updateEmployee, deleteEmployee,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
