import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EditUser({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();
//   const [user, setUser] = useState(state?.user || {});

  if (!user) return <div>No user data found!</div>;

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8088/user/update/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      alert("User updated successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit User: {user.userId}</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:
          <input type="text" value={user.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
        </label><br />
        <label>Last Name:
          <input type="text" value={user.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
        </label><br />
        <label>Personal Mobile:
          <input type="text" value={user.personalMobileNumber} onChange={(e) => handleChange("personalMobileNumber", e.target.value)} />
        </label><br />
        <label>Email:
          <input type="email" value={user.mailId} onChange={(e) => handleChange("mailId", e.target.value)} />
        </label><br />
        <label>Lab Name:
          <input type="text" value={user.labName} onChange={(e) => handleChange("labName", e.target.value)} />
        </label><br />
        <label>City:
          <input type="text" value={user.city} onChange={(e) => handleChange("city", e.target.value)} />
        </label><br />
        <label>Role:
          <input type="text" value={user.userTypeName} onChange={(e) => handleChange("userTypeName", e.target.value)} />
        </label><br />
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate("/")}>Cancel</button>
      </form>
    </div>
  );
}
