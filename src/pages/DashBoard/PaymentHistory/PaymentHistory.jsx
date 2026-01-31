import React, { useMemo } from "react";
import useAuth from "../../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { isPending, data: payments = [] } = useQuery({
    queryKey: ["payments", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      // ✅ your backend should return payment history by user
      // If your route is /payments/me then use that instead
      const res = await axiosSecure.get(`/payments?email=${user.email}`);
      return res.data;
    },
  });

  const sortedPayments = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [payments]);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
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
    if (s === "succeeded") return "badge-success";
    if (s === "processing") return "badge-info";
    if (s === "requires_payment_method" || s === "failed") return "badge-error";
    return "badge-ghost";
  };

  const money = (amount, currency) => {
    const c = String(currency || "").toUpperCase();
    if (c === "USD") return `$${Number(amount || 0).toFixed(2)}`;
    return `${Number(amount || 0).toFixed(2)} ${c}`;
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-base-content/70">
            Total payments:{" "}
            <span className="font-semibold">{sortedPayments.length}</span>
          </p>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat py-3">
            <div className="stat-title">Total Paid</div>
            <div className="stat-value text-xl">
              {money(
                sortedPayments.reduce(
                  (sum, p) => sum + Number(p.amount || 0),
                  0,
                ),
                sortedPayments[0]?.currency || "USD",
              )}
            </div>
            <div className="stat-desc">{user?.email}</div>
          </div>
        </div>
      </div>

      {sortedPayments.length === 0 ? (
        <div className="alert alert-info">
          <span>No payment history found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>#</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Provider</th>
                <th>Parcel</th>
                <th>Payment ID</th>
              </tr>
            </thead>

            <tbody>
              {sortedPayments.map((p, index) => (
                <tr key={p._id} className="hover">
                  <td className="font-semibold">{index + 1}</td>

                  <td>
                    <div className="font-semibold">
                      {formatDateTime(p.createdAt)}
                    </div>
                    <div className="text-xs opacity-60">
                      {p.userName || "—"}
                    </div>
                  </td>

                  <td className="font-bold text-lg">
                    {money(p.amount, p.currency)}
                    <div className="text-xs opacity-60">
                      {p.amountInCents} cents
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${statusBadge(p.status)} badge-lg font-bold`}
                    >
                      {String(p.status || "").toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-outline">
                      {String(p.paymentMethod || "—").toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-neutral">
                      {String(p.provider || "—").toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <div className="font-semibold">{p.parcelName || "—"}</div>
                    <div className="text-xs opacity-60">{p.userEmail}</div>
                  </td>

                  <td>
                    <div className="font-mono text-sm">
                      {String(p.paymentIntentId || "").slice(0, 12)}...
                    </div>
                    <div className="text-xs opacity-60">click to copy</div>
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

export default PaymentHistory;
