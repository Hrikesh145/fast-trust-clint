import { useState } from "react";
import { useQuery, useQueryClient, useMutation, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaMotorcycle,
  FaEnvelope  
} from "react-icons/fa";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";


const PendingRiders = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selectedRider, setSelectedRider] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // ✅ Fetch pending riders with pagination
  const {
    data: { riders = [], pagination } = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pendingRiders", page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/pending-riders?page=${page}&limit=${limit}`);
      return res.data;
    },
    enabled: !!user,
  });

  // ✅ Approve rider mutation
  const approveMutation = useMutation({
    mutationFn: (riderId) => axiosSecure.patch(`/riders/${riderId}/approve`),
    onSuccess: () => {
      toast.success("Rider approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingRiders"] });
      setSelectedRider(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve rider");
    },
  });

  // ✅ Reject rider mutation
  const rejectMutation = useMutation({
    mutationFn: (riderId) => axiosSecure.patch(`/riders/${riderId}/reject`),
    onSuccess: () => {
      toast.success("Rider application rejected!");
      queryClient.invalidateQueries({ queryKey: ["pendingRiders"] });
      setSelectedRider(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject rider");
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pending Riders</h1>
        <p className="text-gray-600 mt-2">
          Total: {pagination?.total || 0} rider{pagination?.total !== 1 ? "s" : ""} | Page {page} of {pagination?.pages || 1}
        </p>
      </div>

      {riders.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No pending riders found</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-200">
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Region</th>
                  <th>District</th>
                  <th>NID</th>
                  <th>Bike</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider, index) => (
                  <tr key={rider._id} className="hover">
                    <td className="font-semibold">{(page - 1) * limit + index + 1}</td>
                    <td>
                      <div className="font-bold">{rider.name}</div>
                      <div className="text-sm opacity-60">{rider.createdBy?.email}</div>
                    </td>
                    <td className="font-mono">{rider.phone}</td>
                    <td>
                      <span className="badge badge-primary">{rider.region}</span>
                    </td>
                    <td>{rider.district}</td>
                    <td className="font-mono text-sm">{rider.nid}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{rider.bikeModel}</span>
                        <span className="text-xs opacity-75">{rider.bikeRegNo}</span>
                      </div>
                    </td>
                    <td>{formatDate(rider.createdAtISO)}</td>
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
                              title: "Approve Rider?",
                              text: `Approve ${rider.name}?`,
                              icon: "question",
                              showCancelButton: true,
                              confirmButtonText: "Approve",
                              confirmButtonColor: "#10b981",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                approveMutation.mutate(rider._id);
                              }
                            });
                          }}
                          className="btn btn-success btn-sm"
                          title="Approve"
                          disabled={approveMutation.isPending}
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: "Reject Application?",
                              text: `Reject ${rider.name}'s application?`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Reject",
                              confirmButtonColor: "#ef4444",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                rejectMutation.mutate(rider._id);
                              }
                            });
                          }}
                          className="btn btn-error btn-sm"
                          title="Reject"
                          disabled={rejectMutation.isPending}
                        >
                          <FaTimes />
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
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              <span className="font-semibold">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page === pagination.pages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ Rider Details Modal */}
      {selectedRider && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
              <FaUser className="text-3xl" />
              Rider Details - {selectedRider.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaUser className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Name</div>
                    <div>{selectedRider.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaPhone className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Phone</div>
                    <div className="font-mono">{selectedRider.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaIdCard className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">NID</div>
                    <div className="font-mono">{selectedRider.nid}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaMotorcycle className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Bike Details</div>
                    <div>{selectedRider.bikeModel}</div>
                    <div className="text-sm opacity-75">{selectedRider.bikeRegNo}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaEnvelope className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Email</div>
                    <div>{selectedRider.createdBy?.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaMapMarkerAlt className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">Location</div>
                    <div className="badge badge-primary">{selectedRider.region}</div>
                    <div>{selectedRider.district}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <FaIdCard className="mt-1 text-primary" />
                  <div>
                    <div className="font-semibold text-lg">License</div>
                    <div>{selectedRider.drivingLicense}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-base-100 rounded-lg">
                  <div className="w-12 h-12 bg-base-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-info">📝</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">About</div>
                    <div className="whitespace-pre-wrap">{selectedRider.about || "No description"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} className="btn btn-outline">
                Close
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Approve Rider?",
                    text: `Approve ${selectedRider.name}?`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Approve",
                    confirmButtonColor: "#10b981",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      approveMutation.mutate(selectedRider._id);
                    }
                  });
                }}
                className="btn btn-success"
                disabled={approveMutation.isPending}
              >
                <FaCheck className="mr-2" />
                Approve Rider
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Reject Application?",
                    text: `Reject ${selectedRider.name}'s application?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Reject",
                    confirmButtonColor: "#ef4444",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      rejectMutation.mutate(selectedRider._id);
                    }
                  });
                }}
                className="btn btn-error"
                disabled={rejectMutation.isPending}
              >
                <FaTimes className="mr-2" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {selectedRider && <div className="modal-backdrop" onClick={closeModal} />}
    </div>
  );
};

export default PendingRiders;
