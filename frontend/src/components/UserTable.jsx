
import { RiDeleteBin6Line, RiLock2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import EditUserModal from "./EditUserModal";
import { useState } from "react";

function UserTable({ users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const openModal = (user) => {
      setSelectedUser(user); // Set the selected user to edit
      setIsModalOpen(true); // Show the modal
    };

    const closeModal = () => {
      setIsModalOpen(false); // Close the modal
      setSelectedUser(null); // Clear selected user
    };
  return (
    <table className="min-w-full text-sm text-left text-gray-800">
      <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
        <tr>
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Phone</th>
          <th className="px-4 py-3">Address</th>
          <th className="px-4 py-3">Password</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phoneNumber}</td>
              <td className="px-4 py-3">{user.address}</td>
              <td className="px-4 py-3 text-gray-400">
                <RiLock2Line size={16} />
              </td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3 text-blue-600 flex items-center space-x-2">
              <EditUserModal user={user} />
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-800 p-0"
                >

                </Button>
                <button className="text-red-600 hover:text-red-800 focus:outline-none">
                  <RiDeleteBin6Line size={18} />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
              No users found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default UserTable;
