import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import Tasks from "./pages/tasks";
import Chat from "./pages/Chat";
import Announcements from "./pages/announcements";
import AICareer from "./pages/AICareer";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="ai" element={<AICareer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
