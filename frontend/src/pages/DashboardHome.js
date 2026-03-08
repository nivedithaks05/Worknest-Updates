import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Mail,
  Megaphone,
  Users,
  Plus,
  MessageCircle,
} from "lucide-react";

function DashboardHome() {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Welcome back, <span className="text-blue-600">User</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of what&apos;s happening in WORKNEST.
          </p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
            {today}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,1.25fr)] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Pending Tasks */}
            <button
              type="button"
              onClick={() => navigate("/dashboard/tasks")}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pending Tasks
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">12</p>
              </div>
            </button>

            {/* Unread Messages */}
            <button
              type="button"
              onClick={() => navigate("/dashboard/chat")}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Unread Messages
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">5</p>
              </div>
            </button>

            {/* Announcements */}
            <button
              type="button"
              onClick={() => navigate("/dashboard/announcements")}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Announcements
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">3</p>
              </div>
            </button>

            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Team Members
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Recent Activity
              </h3>
              <span className="text-xs text-gray-400">Last 24 hours</span>
            </div>

            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Project update uploaded
                  </p>
                  <p className="text-xs text-gray-500">
                    Marketing Q2 roadmap added to Announcements.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    New task assigned
                  </p>
                  <p className="text-xs text-gray-500">
                    &quot;Prepare weekly summary&quot; assigned to you.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Team discussion started
                  </p>
                  <p className="text-xs text-gray-500">
                    New chat thread in #general about product launch.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Actions sidebar */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/tasks")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/chat")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" />
                New Message
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">
              Tip for today
            </p>
            <p>
              Keep your tasks up to date so your team always has a clear
              picture of what you&apos;re working on.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DashboardHome;