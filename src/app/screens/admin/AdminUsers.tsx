import { useNavigate } from "react-router";
import { ArrowLeft, Search, Filter, Crown, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";

export function AdminUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const users = [
    {
      id: 1,
      name: "Vương Giang Trường",
      email: "vuonggiangtruong@gmail.com",
      colorType: "Warm Autumn",
      isPremium: true,
      status: "active",
      joinDate: "2025-01-15",
      scans: 12,
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tran.thib@example.com",
      colorType: "Cool Summer",
      isPremium: false,
      status: "active",
      joinDate: "2025-02-20",
      scans: 3,
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "le.vanc@example.com",
      colorType: "Warm Spring",
      isPremium: true,
      status: "active",
      joinDate: "2024-12-10",
      scans: 24,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "pham.thid@example.com",
      colorType: "Cool Winter",
      isPremium: false,
      status: "active",
      joinDate: "2025-03-01",
      scans: 1,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoang.vane@example.com",
      colorType: "Warm Autumn",
      isPremium: true,
      status: "banned",
      joinDate: "2024-11-05",
      scans: 45,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">
              {users.length} total users
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {["All", "Premium", "Free", "Active", "Banned"].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Color Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Scans
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {user.joinDate}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {user.colorType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isPremium ? (
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-yellow-600">
                            Premium
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {user.scans}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "active" ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-medium">Banned</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                          View
                        </button>
                        {user.status === "active" ? (
                          <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                            Ban
                          </button>
                        ) : (
                          <button className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            Unban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
