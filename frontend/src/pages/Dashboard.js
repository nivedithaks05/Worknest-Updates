import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  CheckSquare,
  Megaphone,
  Sparkles,
} from "lucide-react";

function Dashboard() {
  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", to: "/dashboard/chat", icon: MessageCircle },
    { name: "Tasks", to: "/dashboard/tasks", icon: CheckSquare },
    { name: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
    { name: "AI Career", to: "/dashboard/ai", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-slate-100 w-64 flex-shrink-0 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              W
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                WORKNEST
              </div>
              <div className="text-xs text-slate-400">
                Internal Dashboard
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
          Logged in as Admin
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400">Internal Communication System</p>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
