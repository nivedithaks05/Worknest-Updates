import React from "react";
import LiveChat from "../components/LiveChat";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const { user } = useAuth();

  return <LiveChat currentUser={user} userRole={user?.role} />;
}

export default Chat;
