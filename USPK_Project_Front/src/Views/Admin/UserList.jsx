import { useState } from 'react';
// Удалите импорт иконок
// import { Pencil, Trash2, Shield, X } from 'lucide-react';

const UserList = ({ users = [], onEdit, onDelete, onChangeRole, isLoading = false }) => {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const handleChangeRole = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    const submitRoleChange = async () => {
        await onChangeRole(selectedUser.id, newRole);
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'moderator': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-8 text-center text-gray-500">
                    Нет пользователей для отображения
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role || 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2 text-xs transition-colors"
                                            title="Редактировать"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleChangeRole(user)}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2 text-xs transition-colors"
                                            title="Сменить роль"
                                        >
                                            🛡️ Role
                                        </button>
                                        <button
                                            onClick={() => onDelete(user)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                                            title="Удалить"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Сменить роль пользователя</h3>
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Пользователь: <span className="font-medium">{selectedUser?.username}</span>
                        </p>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        >
                            <option value="User">User</option>
                            <option value="Moderator">Moderator</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={submitRoleChange}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserList;