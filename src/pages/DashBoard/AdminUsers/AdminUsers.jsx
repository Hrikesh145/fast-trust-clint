import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { FaSearch, FaUserShield, FaUserTimes } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AdminUsers = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  //  Debounce input (prevents too many API calls)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const enabled = !!user && debounced.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["userSearch", debounced],
    enabled,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/search?q=${encodeURIComponent(debounced)}&limit=10`);
      return res.data;
    },
  });

  const users = data?.users || [];

  const roleBadge = (role) => {
    const key = String(role || "user").toLowerCase();
    if (key === "admin") return "badge badge-success";
    if (key === "rider") return "badge badge-info";
    return "badge badge-primary";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await axiosSecure.patch(`/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success(`Role updated to ${vars.role}`);
      queryClient.invalidateQueries({ queryKey: ["userSearch"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const confirmRoleChange = async (u, role) => {
    const actionText = role === "admin" ? "Make Admin" : "Remove Admin";
    const result = await Swal.fire({
      title: `${actionText}?`,
      html: `Change role for <strong>${u.email}</strong> to <strong>${role}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: actionText,
      confirmButtonColor: role === "admin" ? "#10b981" : "#ef4444",
    });

    if (!result.isConfirmed) return;
    updateRoleMutation.mutate({ id: u._id, role });
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin User Management</h1>
        <p className="text-gray-600 mt-2">
          Search users and promote/demote admin without loading everyone.
        </p>
      </div>

      {/* Search box */}
      <div className="bg-base-100 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="btn btn-ghost btn-sm">
            <FaSearch />
          </div>
          <input
            className="input input-bordered w-full"
            placeholder="Search by email or name (min 2 chars)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-2 text-sm opacity-70">
          {debounced.length < 2 ? "Type at least 2 characters to search." : `Searching: "${debounced}"`}
        </div>
      </div>

      {/* Results */}
      {enabled && isLoading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-lg shadow-lg">
          <p className="text-xl text-gray-500">
            {debounced.length >= 2 ? "No users found" : "Start searching to see users"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th>#</th>
                <th>User</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => (
                <tr key={u._id} className="hover">
                  <td className="font-semibold">{idx + 1}</td>

                  <td>
                    <div className="font-bold">{u.name || "—"}</div>
                    <div className="text-sm opacity-70">{u.email}</div>
                  </td>

                  <td>
                    <span className={`${roleBadge(u.role)} font-bold`}>
                      {String(u.role || "user").toUpperCase()}
                    </span>
                  </td>

                  <td>{formatDate(u.createdAt)}</td>

                  <td>
                    <div className="flex gap-2">
                      {String(u.role).toLowerCase() !== "admin" ? (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={updateRoleMutation.isPending}
                          title="Make Admin"
                          onClick={() => confirmRoleChange(u, "admin")}
                        >
                          <FaUserShield />
                        </button>
                      ) : (
                        <button
                          className="btn btn-error btn-sm"
                          disabled={updateRoleMutation.isPending}
                          title="Remove Admin (set role to user)"
                          onClick={() => confirmRoleChange(u, "user")}
                        >
                          <FaUserTimes />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;