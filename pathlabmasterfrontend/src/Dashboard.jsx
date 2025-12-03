import { useState, useEffect } from "react";
import UserList from "./componants/User/UserList";

 // import the new component

export default function Dashboard({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState("Dashboard"); // track which menu is active

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formattedTime = currentTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const sidebarStyle = {
    width: collapsed ? "70px" : "220px",
    background: "#0d3b66",
    color: "#fff",
    padding: "20px",
    transition: "0.3s",
    overflow: "hidden",
    height: "100%",
  };

  const menuItemStyle = {
    padding: "12px 0",
    cursor: "pointer",
    fontSize: collapsed ? "0px" : "16px",
    transition: "0.3s",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top header */}
      <div style={{ background: "linear-gradient(to bottom, #ffffff, #e9e9e9)", borderBottom: "1px solid #ccc", height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <img src="/PM1.png" alt="" style={{ height: "100px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "#d9f2f2", padding: "6px 12px", borderRadius: "6px", textAlign: "left", fontSize: "14px", lineHeight: "1.2" }}>
            <div>{formattedDate}</div>
            <div>{formattedTime} Asia/Calcutta</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "bold" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: "14px", color: "#555" }}>{user.userTypeName}</div>
          </div>
        </div>
      </div>

      {/* Main section */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "#144a8c", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", width: "100%", marginBottom: "20px" }}>
            {collapsed ? "☰" : "X"}
          </button>

          {!collapsed && <h3>Menu</h3>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={menuItemStyle} onClick={() => setActiveMenu("Dashboard")}>Dashboard</li>
            <li style={menuItemStyle} onClick={() => setActiveMenu("Users")}>Users</li>
            <li style={menuItemStyle} onClick={() => setActiveMenu("Reports")}>Reports</li>
            <li style={menuItemStyle} onClick={() => setActiveMenu("Settings")}>Settings</li>
            <li style={menuItemStyle}>Logout</li>
          </ul>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px" }}>
          {activeMenu === "Dashboard" && (
            <>
              <h1>Welcome to Laboratory Dashboard</h1>
            </>
          )}
          {activeMenu === "Users" && <UserList />}
        </div>
      </div>
    </div>
  );
}
