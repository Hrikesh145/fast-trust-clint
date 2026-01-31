import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const PaymentForm = () => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const { parcelId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const { isPending, data: parcelInfo = {} } = useQuery({
    queryKey: ["parcels", parcelId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      return res.data;
    },
  });

  if (isPending) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  // ✅ ensure number (your codAmount can be string)
  const amount = Number(parcelInfo.codAmount) || 0;
  const amountInCents = Math.round(amount * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setProcessing(false);
      return;
    }

    try {
      // Step 1: create PaymentIntent (server returns clientSecret)
      const intentRes = await axiosSecure.post("/create-payment-intent", {
        amountInCents,
      });

      const cs = intentRes.data.clientSecret;
      if (!cs) throw new Error("No clientSecret returned from server");
      setClientSecret(cs);

      // Step 2: confirm payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(cs, {
          payment_method: {
            card,
            billing_details: {
              name: user?.displayName || "Customer",
              email: user?.email || undefined,
            },
          },
        });

      if (confirmError) {
        setError(confirmError.message);
        return;
      }

      // Step 3: if succeeded, save to DB + mark parcel paid
      if (paymentIntent?.status === "succeeded") {
        const paymentData = {
          parcelId,
          paymentIntentId: paymentIntent.id,
          userEmail: user?.email,
          userName: user?.displayName,
          amount,
        };

        const paymentRes = await axiosSecure.post("/payments", paymentData);

        // ✅ adjust this check if your backend returns insertedId instead
        if (paymentRes?.data?.payment || paymentRes?.data?.insertedId) {
          setPaid(true);

          // ✅ redirect to my parcels page (change route if yours is different)
          navigate("/dashboard/myParcels");
        } else {
          setError("Payment succeeded but DB save not confirmed.");
        }
      } else {
        setError(`Payment not completed. Status: ${paymentIntent?.status}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <CardElement />
        <button
          type="submit"
          className="btn btn-secondary text-black font-semibold"
          disabled={!stripe || !elements || processing || paid}
        >
          {processing ? "Processing..." : paid ? "Paid" : `Pay $${amount}`}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;
