import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const TrackParcel = () => {
  const axiosSecure = useAxiosSecure();
  const [trackingId, setTrackingId] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const {
    data: parcel,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["trackParcel", submittedId],
    enabled: false,
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/track/${submittedId}`);
      return res.data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) {
      toast.error("Please enter a tracking ID");
      return;
    }
    setSubmittedId(id);
    await refetch();
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered") return "badge-success";
    if (s === "in_transit") return "badge-info";
    if (s === "picked_up") return "badge-warning";
    if (s === "created") return "badge-neutral";
    if (s === "cancelled") return "badge-error";
    return "badge-ghost";
  };

  const prettyStatus = (status) => {
    const s = String(status || "").toLowerCase();
    if (!s) return "UNKNOWN";
    return s.replaceAll("_", " ").toUpperCase();
  };

  const copyTrackingId = () => {
    if (!parcel?.trackingId) return;
    navigator.clipboard.writeText(parcel.trackingId);
    toast.success("Tracking ID copied!");
  };

  // ✅ cost helpers (handles string/number/empty)
  const paymentKey = String(parcel?.paymentType || "").toLowerCase();
  const deliveryCost = Number(parcel?.deliveryCost || 0);
  const codAmount = Number(parcel?.codAmount || 0);
  const showCOD = codAmount > 0; // ✅ show COD + total if codAmount exists
  const totalCost = deliveryCost + codAmount;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Track Parcel</h1>
        <p className="text-base-content/70 mt-1">
          Enter your tracking ID to see the latest status and history.
        </p>
      </div>

      {/* Search */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Tracking ID (e.g. 041b73c5-6fb8-441f-98fe-538cd857df19)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isFetching}
            >
              {isFetching ? "Tracking..." : "Track"}
            </button>
          </form>

          <div className="text-xs opacity-60 mt-2">
            Tip: Copy tracking ID from “My Parcels” table using the 📋 icon.
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="alert alert-error">
          <span>
            {error?.response?.data?.message ||
              error?.message ||
              "Parcel not found. Please check your tracking ID."}
          </span>
        </div>
      )}

      {/* Result */}
      {parcel && !isFetching && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="card-title">Parcel Summary</h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={copyTrackingId}
                    title="Copy tracking ID"
                    type="button"
                  >
                    📋
                  </button>
                </div>

                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">Tracking ID</span>
                    <span className="font-mono">{parcel.trackingId}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">Title</span>
                    <span className="font-semibold">
                      {parcel.parcelTitle || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">Type</span>
                    <span className="font-semibold">
                      {parcel.parcelType === "document"
                        ? "Document"
                        : "Non-Document"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">Payment</span>
                    <span className="font-semibold">
                      {parcel.paymentType || "—"}
                    </span>
                  </div>

                  {/* ✅ FIXED TOTAL LOGIC */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between gap-3">
                      <span className="opacity-60">Delivery Cost</span>
                      <span className="font-semibold">৳{deliveryCost}</span>
                    </div>

                    {showCOD ? (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="opacity-60">COD Amount</span>
                          <span className="font-semibold">৳{codAmount}</span>
                        </div>

                        <div className="flex justify-between gap-3 border-t pt-1">
                          <span className="font-bold">Total</span>
                          <span className="font-bold">৳{totalCost}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between gap-3 border-t pt-1">
                        <span className="font-bold">
                          {paymentKey === "paid" ? "Total Paid" : "Total"}
                        </span>
                        <span className="font-bold">৳{deliveryCost}</span>
                      </div>
                    )}
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">From</span>
                    <span className="font-semibold">
                      {parcel.senderCenter || parcel.senderRegion || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">To</span>
                    <span className="font-semibold">
                      {parcel.receiverCenter || parcel.receiverRegion || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="opacity-60">Created</span>
                    <span className="font-semibold">
                      {formatDateTime(parcel.createdAtISO)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status + Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="card-title">Current Status</h2>
                  <span
                    className={`badge ${statusBadge(
                      parcel.status,
                    )} badge-lg font-bold`}
                  >
                    {prettyStatus(parcel.status)}
                  </span>
                </div>
                <p className="text-sm opacity-70 mt-2">
                  This is the latest known status of your parcel.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Status Timeline</h2>

                {!parcel.statusHistory || parcel.statusHistory.length === 0 ? (
                  <div className="alert alert-info mt-3">
                    <span>No status updates yet.</span>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {[...parcel.statusHistory]
                      .sort((a, b) => new Date(b.timeISO) - new Date(a.timeISO))
                      .map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 w-3 h-3 rounded-full bg-current opacity-60"></div>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {prettyStatus(item.status)}
                            </div>
                            <div className="text-xs opacity-60">
                              {formatDateTime(item.timeISO)}
                            </div>
                          </div>
                          <span
                            className={`badge ${statusBadge(
                              item.status,
                            )} badge-sm`}
                          >
                            {prettyStatus(item.status)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;
