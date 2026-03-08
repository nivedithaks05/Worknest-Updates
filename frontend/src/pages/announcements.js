import { useState } from "react";

function Announcements() {
  // Mock admin flag
  const isAdmin = true;

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Q2 Product Launch Timeline",
      author: "Alex Johnson",
      date: "March 5, 2026",
      priority: "High Priority",
      type: "high",
      snippet:
        "We are targeting the last week of May for the Q2 product launch. Please review the updated milestones and ensure your team is aligned...",
    },
    {
      id: 2,
      title: "New Hybrid Work Policy",
      author: "HR Team",
      date: "March 2, 2026",
      priority: "General",
      type: "general",
      snippet:
        "Starting next month, we are introducing a more flexible hybrid work model. Employees can choose up to three remote days per week...",
    },
    {
      id: 3,
      title: "Security Training Reminder",
      author: "IT Security",
      date: "February 28, 2026",
      priority: "High Priority",
      type: "high",
      snippet:
        "All employees are required to complete the updated security awareness training before the end of this month to keep systems compliant...",
    },
    {
      id: 4,
      title: "Town Hall Meeting",
      author: "Leadership Team",
      date: "February 20, 2026",
      priority: "General",
      type: "general",
      snippet:
        "Join us for the quarterly town hall where we will share company performance, upcoming initiatives, and an open Q&A session...",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newHighPriority, setNewHighPriority] = useState(false);

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const next = {
      id: Date.now(),
      title: newTitle.trim(),
      author: "You",
      date: formattedDate,
      priority: newHighPriority ? "High Priority" : "General",
      type: newHighPriority ? "high" : "general",
      snippet:
        newContent.length > 160
          ? newContent.slice(0, 157).concat("...")
          : newContent,
    };

    setAnnouncements((prev) => [next, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewHighPriority(false);
    setShowForm(false);
  };

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Announcements
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stay up to date with company-wide updates and important notices.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowForm((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showForm ? "Cancel" : "Post New Announcement"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form
          onSubmit={handleCreateAnnouncement}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your announcement..."
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={newHighPriority}
                onChange={(e) => setNewHighPriority(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Mark as high priority
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Publish
            </button>
          </div>
        </form>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {announcements.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <article
              key={item.id}
              className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              {/* Priority badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    item.type === "high"
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {item.priority}
                </span>
              </div>

              <header className="mb-3 pr-28">
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Posted by{" "}
                  <span className="font-medium text-gray-700">
                    {item.author}
                  </span>{" "}
                  • {item.date}
                </p>
              </header>

              <p
                className={`text-sm text-gray-700 mb-2 transition-all duration-200 ${
                  isExpanded ? "" : "line-clamp-2"
                }`}
              >
                {item.snippet}
              </p>

              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Announcements;