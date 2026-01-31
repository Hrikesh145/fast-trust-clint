import { useQuery } from "@tanstack/react-query";
import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaEye, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const { data: parcels = [], isLoading, refetch } = useQuery({
    queryKey: ["myParcels", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user.email}`);
      return res.data;
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

  // ✅ FIXED: works for paid / PAID / cod / COD
  const getPaymentBadge = (paymentType) => {
    const key = String(paymentType || "").toLowerCase();
    const badges = {
      paid: "badge-success",
      cod: "badge-warning",
      unpaid: "badge-error",
      pending: "badge-info",
    };
    return badges[key] || "badge-ghost";
  };

  const getPaymentLabel = (paymentType) => {
    const key = String(paymentType || "").toLowerCase();
    if (key === "paid") return "PAID";
    if (key === "cod") return "COD";
    return paymentType;
  };

  const handleViewDetails = (parcel) => {
    console.log("View details:", parcel);
  };

  const handlePay = (id) => {
    navigate(`/dashboard/payment/${id}`);
  };

  const handleDelete = async (parcel) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Do you want to delete <strong>"${parcel.parcelTitle}"</strong>?<br><small>Tracking ID: ${parcel.trackingId}</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axiosSecure.delete(`/parcels/${parcel._id}`);
      refetch();

      Swal.fire({
        title: "Deleted!",
        text: "Your parcel has been deleted successfully.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to delete parcel. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Parcels</h1>
        <p className="text-gray-600 mt-2">
          Total: {parcels.length} parcel{parcels.length !== 1 ? "s" : ""}
        </p>
      </div>

      {parcels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No parcels found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Payment Status</th>
                <th>Cost (৳)</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {parcels.map((parcel, index) => (
                <tr key={parcel._id} className="hover">
                  <td className="font-semibold">{index + 1}</td>

                  <td>
                    <div className="font-bold">{parcel.parcelTitle}</div>
                    <div className="text-sm opacity-50">
                      {parcel.trackingId?.slice(0, 8)}...
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        parcel.parcelType === "document"
                          ? "badge-primary"
                          : "badge-secondary text-black"
                      } font-semibold`}
                    >
                      {parcel.parcelType === "document"
                        ? "📄 Document"
                        : "📦 Non-Document"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${getPaymentBadge(
                        parcel.paymentType
                      )} badge-lg font-bold`}
                    >
                      {getPaymentLabel(parcel.paymentType)}
                    </span>
                  </td>

                  <td className="font-semibold text-lg">
                    ৳{parcel.deliveryCost}
                  </td>

                  <td>{formatDate(parcel.createdAtISO)}</td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(parcel)}
                        className="btn btn-info btn-sm"
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      {/* ✅ FIXED: hide Pay button when PAID */}
                      {String(parcel.paymentType || "").toLowerCase() !==
                        "paid" && (
                        <button
                          onClick={() => handlePay(parcel._id)}
                          className="btn btn-success btn-sm"
                          title="Pay Now"
                        >
                          <FaMoneyBillWave />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(parcel)}
                        className="btn btn-error btn-sm"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
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

export default MyParcels;
