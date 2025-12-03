import { useState } from "react";
import Dashboard from "./Dashboard";
import "./Login.css";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8088/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const result = await response.json();

      // result should match your Response class structure
      // {
      //   status: "SUCCESS",
      //   statusCode: 200,
      //   message: "Login success",
      //   data: {...}
      // }

      if (result.status === "SUCCESS" && result.statusCode === 1) {
        setIsLoggedIn(true);
      } else {
        alert(result.message || "Invalid login");
      }
    } catch (error) {
      alert("Unable to login. Server error.");
    }
  };

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Log in to your Laboratory</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
