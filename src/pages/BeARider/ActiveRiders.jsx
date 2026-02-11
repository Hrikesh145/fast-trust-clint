import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { 
  FaEye, 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaMotorcycle,
  FaBan,
  FaEnvelope,
  FaIdCard
} from "react-icons/fa";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";

const ActiveRiders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selectedRider, setSelectedRider] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  // ✅ Fetch ACTIVE riders (status: "approved")
  const {
    data: { riders = [], pagination } = {},
    isLoading,
  } = useQuery({
    queryKey: ["activeRiders", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.append("search", search);
      const res = await axiosSecure.get(`/active-riders?${params}`);
      return res.data;
    },
    enabled: !!user,
  });

  // ✅ Deactivate rider mutation
  const deactivateMutation = useMutation({
    mutationFn: (riderId) => axiosSecure.patch(`/riders/${riderId}/deactivate`),
    onSuccess: () => {
      toast.success("Rider deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeRiders"] });
      setSelectedRider(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to deactivate rider");
    },
  });

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openModal = (rider) => setSelectedRider(rider);
  const closeModal = () => setSelectedRider(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />
      
      {/* Header + Search */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Active Riders</h1>
        <p className="text-gray-600 mt-2">
          Total: {pagination?.total || 0} active rider{pagination?.total !== 1 ? "s" : ""}
        </p>
        
        {/* Search */}
        <div className="mt-4 max-w-md">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      {riders.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No active riders found</p>
          {search && <p className="text-sm text-gray-400 mt-2">Try different search term</p>}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Bike</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider, index) => (
                  <tr key={rider._id} className="hover">
                    <td className="font-semibold">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td>
                      <div className="font-bold">{rider.name}</div>
                      <div className="text-sm opacity-60">{rider.createdBy?.email}</div>
                    </td>
                    <td className="font-mono">{rider.phone}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="badge badge-success">{rider.region}</span>
                        <span className="text-sm">{rider.district}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{rider.bikeModel}</span>
                        <span className="text-xs opacity-75">{rider.bikeRegNo}</span>
                      </div>
                    </td>
                    <td>{formatDate(rider.approvedAt || rider.createdAtISO)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(rider)}
                          className="btn btn-info btn-sm"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: "Deactivate Rider?",
                              text: `Deactivate ${rider.name}? They won't receive new orders.`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Deactivate",
                              confirmButtonColor: "#ef4444",
                              cancelButtonText: "Cancel",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deactivateMutation.mutate(rider._id);
                              }
                            });
                          }}
                          className="btn btn-warning btn-sm"
                          title="Deactivate"
                          disabled={deactivateMutation.isPending}
                        >
                          <FaBan />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || deactivateMutation.isPending}
                className="btn btn-outline"
              >
                Previous
              </button>
              <span className="font-semibold">
                Page {page} of {pagination.pages || 1}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page === pagination.pages || deactivateMutation.isPending}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ FIXED Modal */}
      {selectedRider && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
              <FaUser className="text-3xl text-success" />
              Active Rider Details - {selectedRider.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaUser className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">Name</div>
                    <div className="text-xl">{selectedRider.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaPhone className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">Phone</div>
                    <div className="font-mono text-xl">{selectedRider.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaIdCard className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">NID</div>
                    <div className="font-mono">{selectedRider.nid}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaMotorcycle className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">Bike</div>
                    <div>{selectedRider.bikeModel}</div>
                    <div className="text-sm opacity-75">{selectedRider.bikeRegNo}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaEnvelope className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">Email</div>
                    <div>{selectedRider.createdBy?.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaMapMarkerAlt className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">Location</div>
                    <div className="badge badge-success">{selectedRider.region}</div>
                    <div>{selectedRider.district}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <FaIdCard className="mt-1 text-success" />
                  <div>
                    <div className="font-semibold text-lg">License</div>
                    <div>{selectedRider.drivingLicense}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg border">
                  <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mt-1">
                    <span className="text-info">📝</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">About</div>
                    <div className="whitespace-pre-wrap max-h-20 overflow-y-auto">
                      {selectedRider.about || "No description provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={closeModal} 
                className="btn btn-outline"
                disabled={deactivateMutation.isPending}
              >
                Close
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Deactivate Rider?",
                    text: `Deactivate ${selectedRider.name}?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Deactivate",
                    confirmButtonColor: "#ef4444",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      deactivateMutation.mutate(selectedRider._id);
                    }
                  });
                }}
                className="btn btn-warning"
                disabled={deactivateMutation.isPending}
              >
                <FaBan className="mr-2" />
                Deactivate Rider
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal} />
        </div>
      )}

    </div>
  );
};

export default ActiveRiders;
