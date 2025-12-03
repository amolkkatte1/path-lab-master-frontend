import { useEffect, useState } from "react";
import "./UserList.css";
import EditUser from "./EditUser";  

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Individual column filters
  const [filters, setFilters] = useState({
    userId: "",
    name: "",
    labName: "",  // changed from email to labName
    mobile: "",
    city: "",
    type: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    console.log("Selected user:", user);  // you can do anything here
    // navigate("/edit-user", { state: { user } });
    };
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8088/user/list");
      const data = await res.json();
      setUsers(data.data);
      setFilteredUsers(data.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // 🔍 Column-wise filter
  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);

    const result = users.filter((u) => {
      return (
        String(u.userId).includes(updated.userId) &&
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(updated.name.toLowerCase()) &&
        u.labName?.toLowerCase().includes(updated.labName.toLowerCase()) &&  // changed from mailId
        String(u.personalMobileNumber).includes(updated.mobile) &&
        u.city?.toLowerCase().includes(updated.city.toLowerCase()) &&
        u.userTypeName?.toLowerCase().includes(updated.type.toLowerCase())
      );
    });

    setFilteredUsers(result);
  };

  return (
    <div className="user-list">
      <h2>User List</h2>

      <table>
        <thead>
          {/* Column Names */}
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Lab Name</th> {/* changed header */}
            <th>Mobile</th>
            <th>City</th>
            <th>Role</th>
          </tr>

          {/* Search Inputs Row */}
          <tr>
            <th>
              <input
                type="text"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </th>

            <th>
              <input
                type="text"
                placeholder="Name"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </th>

            <th>
              <input
                type="text"
                placeholder="Lab Name"
                value={filters.labName}
                onChange={(e) => handleFilterChange("labName", e.target.value)}
              />
            </th>

            <th>
              <input
                type="text"
                placeholder="Mobile"
                value={filters.mobile}
                onChange={(e) => handleFilterChange("mobile", e.target.value)}
              />
            </th>

            <th>
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />
            </th>

            <th>
              <input
                type="text"
                placeholder="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.userId}>
              <td style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} onClick={() => handleUserClick(u)}>
                {u.userId}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.labName}</td> {/* changed from mailId */}
              <td>{u.personalMobileNumber}</td>
              <td>{u.city}</td>
              <td>{u.userTypeName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
