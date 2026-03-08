import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ collapsed }) {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <ul>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/dashboard/chat">Chat</NavLink></li>
        <li><NavLink to="/dashboard/tasks">Tasks</NavLink></li>
        <li><NavLink to="/dashboard/announcements">Announcements</NavLink></li>
      </ul>
    </div>
  );
}

export default Sidebar;
