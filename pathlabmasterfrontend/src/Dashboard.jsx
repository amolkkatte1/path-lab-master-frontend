import { useState } from "react";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  // Sidebar styling
  const sidebarStyle = {
    width: collapsed ? "70px" : "220px",
    background: "#0d3b66",        // <-- New sidebar color (blue similar to screenshot)
    color: "#fff",
    padding: "20px",
    transition: "0.3s",
    overflow: "hidden",
    height: "100%"
  };

  const menuItemStyle = {
    padding: "12px 0",
    cursor: "pointer",
    fontSize: collapsed ? "0px" : "16px",
    transition: "0.3s",
    whiteSpace: "nowrap"
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ---------------- TOP HEADER ---------------- */}
      <div
        style={{
          background: "linear-gradient(to bottom, #ffffff, #e9e9e9)",
          borderBottom: "1px solid #ccc",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src="/logo.png"  // <-- Replace this with your logo path
          alt="genexEHR"
          style={{ height: "55px" }}
        />
      </div>

      {/* ---------------- MAIN SECTION ---------------- */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <div style={sidebarStyle}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "#144a8c",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              cursor: "pointer",
              width: "100%",
              marginBottom: "20px"
            }}
          >
            {collapsed ? "☰" : "Collapse"}
          </button>

          {!collapsed && <h3>Menu</h3>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={menuItemStyle}>Dashboard</li>
            <li style={menuItemStyle}>Users</li>
            <li style={menuItemStyle}>Reports</li>
            <li style={menuItemStyle}>Settings</li>
            <li style={menuItemStyle}>Logout</li>
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          <h1>Welcome to Laboratory Dashboard</h1>
          <p>This is your main content area.</p>
        </div>
      </div>
    </div>
  );
}
