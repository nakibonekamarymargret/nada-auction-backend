import UserTable from "@/components/UserTable";
import React, { useEffect, useState } from "react";
import UserService from "@/services/UserService";

function ProfilePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await UserService.getAll(token); // This now returns the full Axios response

        // Access the actual array of users from the response data
        const usersArray = response.data.ReturnObject || [];
        setUsers(usersArray);
      } catch (err) {
        console.error("Error fetching users:", err);
        // It's good practice to check if the error has a response with data for more specific messages
        const errorMessage =
          err.response?.data?.ReturnObject ||
          err.message ||
          "Failed to fetch users.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="flex justify-center items-start min-h-screen bg-gray-100 pt-16 px-4">
      <section className="w-full max-w-6xl bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          User Management
        </h2>
        <div className="overflow-x-auto">
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <UserTable users={users} />
          )}
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
