import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import warehousesData from "../../../public/warehouses.json";
import "./SenderParcel.css";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// -------- Cost Logic (Edit based on your business rules) ----------
function calculateDeliveryCost({
  parcelType,
  senderCenter,
  receiverCenter,
  weight,
}) {
  const base = parcelType === "document" ? 60 : 100;

  const centerFee = senderCenter === receiverCenter ? 0 : 30;

  const w = Number(weight || 0);
  const weightFee = parcelType === "non-document" ? Math.max(0, w) * 15 : 0;

  return base + centerFee + weightFee;
}

// -------- Save Logic (Replace with Firebase/Backend later) ----------
async function saveParcelToDB(parcelDoc) {
  const old = JSON.parse(localStorage.getItem("parcels") || "[]");
  localStorage.setItem("parcels", JSON.stringify([parcelDoc, ...old]));
}

const SendParcel = () => {
  const { user } = useAuth();

  // ✅ logged-in user info
  const userDisplayName = user?.displayName || "";
  const userEmail = user?.email || "";
  const userUid = user?.uid || "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // parcel
      parcelType: "document",
      parcelTitle: "",
      parcelWeight: "",

      // ✅ Extra (recommended)
      paymentType: "cod", // "COD" | "PAID"
      codAmount: "", // number (if COD)
      isFragile: false, // boolean
      parcelValue: "", // number (optional)
      pickupTimeSlot: "4pm-7pm", // string
      // expectedDeliveryDateISO -> usually backend sets later (optional)
      // assignedRiderId -> backend/admin sets later (optional)

      // sender
      senderName: userDisplayName,
      senderContact: "",
      senderRegion: "",
      senderCenter: "",
      senderArea: "",
      senderAddress: "",
      pickupInstruction: "",

      // receiver
      receiverName: "",
      receiverContact: "",
      receiverRegion: "",
      receiverCenter: "",
      receiverArea: "",
      receiverAddress: "",
      deliveryInstruction: "",
    },
    mode: "onTouched",
  });

  const axiosSecure = useAxiosSecure();

  // ✅ if auth user loads later, update senderName once
  useEffect(() => {
    if (userDisplayName) setValue("senderName", userDisplayName);
  }, [userDisplayName, setValue]);

  const parcelType = watch("parcelType");
  const paymentType = watch("paymentType");

  const senderRegion = watch("senderRegion");
  const senderCenter = watch("senderCenter");

  const receiverRegion = watch("receiverRegion");
  const receiverCenter = watch("receiverCenter");

  // Regions from JSON
  const regions = useMemo(() => {
    const set = new Set(warehousesData.map((w) => w.region));
    return Array.from(set).sort();
  }, []);

  // Service Centers = districts (from JSON)
  const senderCenters = useMemo(() => {
    if (!senderRegion) return [];
    return warehousesData
      .filter((w) => w.region === senderRegion)
      .map((w) => w.district)
      .sort();
  }, [senderRegion]);

  const receiverCenters = useMemo(() => {
    if (!receiverRegion) return [];
    return warehousesData
      .filter((w) => w.region === receiverRegion)
      .map((w) => w.district)
      .sort();
  }, [receiverRegion]);

  // Covered areas
  const senderAreas = useMemo(() => {
    if (!senderRegion || !senderCenter) return [];
    const w = warehousesData.find(
      (x) => x.region === senderRegion && x.district === senderCenter,
    );
    return w?.covered_area || [];
  }, [senderRegion, senderCenter]);

  const receiverAreas = useMemo(() => {
    if (!receiverRegion || !receiverCenter) return [];
    const w = warehousesData.find(
      (x) => x.region === receiverRegion && x.district === receiverCenter,
    );
    return w?.covered_area || [];
  }, [receiverRegion, receiverCenter]);

  // Reset center + area when region changes
  useEffect(() => {
    setValue("senderCenter", "");
    setValue("senderArea", "");
  }, [senderRegion, setValue]);

  useEffect(() => {
    setValue("receiverCenter", "");
    setValue("receiverArea", "");
  }, [receiverRegion, setValue]);

  // Reset area when center changes
  useEffect(() => {
    setValue("senderArea", "");
  }, [senderCenter, setValue]);

  useEffect(() => {
    setValue("receiverArea", "");
  }, [receiverCenter, setValue]);

  // ✅ helper: tracking id
  const generateTrackingId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
    return `TRK-${Date.now()}`;
  };

  const onSubmit = async (data) => {
    // ✅ must be logged in to save creator email
    if (!userEmail) {
      toast.error("Please login to book a parcel.");
      return;
    }

    // ✅ simple payment validation
    if (data.paymentType === "cod") {
      const cod = Number(data.codAmount || 0);
      if (cod <= 0) {
        toast.error("COD amount is required for Cash on Delivery.");
        return;
      }
    }

    const cost = calculateDeliveryCost({
      parcelType: data.parcelType,
      senderCenter: data.senderCenter,
      receiverCenter: data.receiverCenter,
      weight: data.parcelWeight,
    });

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } bg-base-200 shadow-xl rounded-xl p-4 flex items-center gap-4 w-[92vw] max-w-md`}
        >
          <div className="flex-1">
            <p className="font-semibold text-sm">Delivery Cost</p>
            <p className="text-lg font-bold">৳ {cost}</p>
            <p className="text-xs text-base-content/60 mt-1">
              Confirm to place booking.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-xs btn-primary"
              //   onClick={async () => {
              //     toast.dismiss(t.id);

              //     const nowISO = new Date().toISOString();
              //     const trackingId = generateTrackingId();

              //     const parcelDoc = {
              //       ...data,

              //       // normalize numbers (optional but recommended)
              //       parcelWeight:
              //         data.parcelType === "non-document"
              //           ? Number(data.parcelWeight || 0)
              //           : 0,
              //       codAmount:
              //         data.paymentType === "COD"
              //           ? Number(data.codAmount || 0)
              //           : 0,
              //       parcelValue: Number(data.parcelValue || 0),

              //       // cost
              //       deliveryCost: cost,

              //       // creator info
              //       createdBy: {
              //         uid: userUid,
              //         email: userEmail,
              //         displayName: userDisplayName,
              //       },

              //       // time
              //       createdAtISO: nowISO,

              //       // tracking
              //       trackingId,

              //       // status timeline
              //       status: "created",
              //       statusHistory: [{ status: "created", timeISO: nowISO }],

              //       // fields for future tracking/admin usage
              //       expectedDeliveryDateISO: "", // backend/admin sets later
              //       assignedRiderId: "", // backend/admin sets later
              //     };

              //     await saveParcelToDB(parcelDoc);
              //     toast.success("Parcel booked successfully!");
              //     reset();
              //   }}
              onClick={async () => {
                toast.dismiss(t.id);

                const nowISO = new Date().toISOString();
                const trackingId = generateTrackingId();

                const parcelDoc = {
                  ...data,

                  deliveryCost: cost,

                  createdBy: {
                    uid: userUid,
                    email: userEmail,
                    displayName: userDisplayName,
                  },

                  createdAtISO: nowISO,
                  trackingId,

                  status: "created",
                  statusHistory: [{ status: "created", timeISO: nowISO }],
                };

                await saveParcelToDB(parcelDoc);

                // // ✅ FULL DETAILS IN CONSOLE (everything)
                // console.group("✅ Parcel Confirmed (Full Details)");
                // console.log("Tracking ID:", parcelDoc.trackingId);
                // console.log("Created At (ISO):", parcelDoc.createdAtISO);
                // console.log("Status:", parcelDoc.status);

                // console.group("👤 Creator (Logged in user)");
                // console.log("UID:", parcelDoc.createdBy.uid);
                // console.log("Email:", parcelDoc.createdBy.email);
                // console.log("Display Name:", parcelDoc.createdBy.displayName);
                // console.groupEnd();

                // console.group("📦 Parcel Info");
                // console.log("Type:", parcelDoc.parcelType);
                // console.log("Title:", parcelDoc.parcelTitle);
                // console.log("Weight:", parcelDoc.parcelWeight);
                // console.log("Delivery Cost:", parcelDoc.deliveryCost);
                // console.groupEnd();

                // console.group("📍 Sender");
                // console.log("Name:", parcelDoc.senderName);
                // console.log("Contact:", parcelDoc.senderContact);
                // console.log("Region:", parcelDoc.senderRegion);
                // console.log("Center:", parcelDoc.senderCenter);
                // console.log("Area:", parcelDoc.senderArea);
                // console.log("Address:", parcelDoc.senderAddress);
                // console.log("Pickup Instruction:", parcelDoc.pickupInstruction);
                // console.groupEnd();

                // console.group("📍 Receiver");
                // console.log("Name:", parcelDoc.receiverName);
                // console.log("Contact:", parcelDoc.receiverContact);
                // console.log("Region:", parcelDoc.receiverRegion);
                // console.log("Center:", parcelDoc.receiverCenter);
                // console.log("Area:", parcelDoc.receiverArea);
                // console.log("Address:", parcelDoc.receiverAddress);
                // console.log(
                //   "Delivery Instruction:",
                //   parcelDoc.deliveryInstruction
                // );
                // console.groupEnd();

                console.log("🧾 Full parcelDoc object:", parcelDoc);
                console.groupEnd();

                // save to db

                axiosSecure
                  .post("/parcels", parcelDoc)
                  .then((response) => {
                    console.log("Parcel saved to DB:", response.data);
                    if (response.data.insertedId) {
                      // TODO: Payment page redirection
                    }
                  })
                  .catch((error) => {
                    console.error("Error saving parcel to DB:", error);
                  });

                // ✅ Also show all parcels stored so far
                const all = JSON.parse(localStorage.getItem("parcels") || "[]");
                console.log("📚 All saved parcels in localStorage:", all);

                toast.success("Parcel booked successfully!");
                reset();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: 10000 },
    );
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-base-100 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h1 className="text-3xl font-bold">Send A Parcel</h1>
              <p className="text-base-content/70 font-medium">
                Enter your parcel details
              </p>

              <div className="divider" />

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* ================= Parcel Info ================= */}
                <div>
                  <h2 className="text-sm font-bold text-base-content/80 mb-3">
                    Parcel Info
                  </h2>

                  <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        className="radio radio-success radio-sm"
                        value="document"
                        {...register("parcelType", { required: true })}
                      />
                      <span className="text-sm">Document</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        className="radio radio-success radio-sm"
                        value="non-document"
                        {...register("parcelType", { required: true })}
                      />
                      <span className="text-sm">Not-Document</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Parcel Name
                        </span>
                      </label>
                      <input
                        className={`input input-bordered w-full ${
                          errors.parcelTitle ? "input-error" : ""
                        }`}
                        placeholder="Parcel Name"
                        {...register("parcelTitle", {
                          required: "Parcel name is required",
                        })}
                      />
                      {errors.parcelTitle && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.parcelTitle.message}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Parcel Weight (KG)
                        </span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input input-bordered w-full"
                        placeholder="Parcel Weight (KG)"
                        disabled={parcelType !== "non-document"}
                        {...register("parcelWeight")}
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          {parcelType === "non-document"
                            ? "Optional (used for cost calculation)"
                            : "Weight only for Non-Document"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* ================= Extra Recommended Fields ================= */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Payment Type */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Payment Type
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        {...register("paymentType", {
                          required: "Payment type is required",
                        })}
                      >
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="paid">Paid</option>
                      </select>
                      {errors.paymentType && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.paymentType.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* COD Amount (only meaningful if COD) */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          COD Amount
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="COD Amount"
                        disabled={paymentType !== "cod"}
                        {...register("codAmount")}
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          {paymentType === "COD"
                            ? "Required if COD"
                            : "Not needed for PAID"}
                        </span>
                      </label>
                    </div>

                    {/* Fragile */}
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success"
                          {...register("isFragile")}
                        />
                        <span className="label-text font-semibold">
                          Fragile Item
                        </span>
                      </label>
                    </div>

                    {/* Parcel Value */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Parcel Value (Optional)
                        </span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="Parcel Value"
                        {...register("parcelValue")}
                      />
                    </div>

                    {/* Pickup Time Slot */}
                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Pickup Time Slot
                        </span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        {...register("pickupTimeSlot")}
                      >
                        <option value="4pm-7pm">4pm - 7pm (Approx.)</option>
                        <option value="10am-1pm">10am - 1pm</option>
                        <option value="1pm-4pm">1pm - 4pm</option>
                        <option value="7pm-10pm">7pm - 10pm</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ================= Sender + Receiver ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender */}
                  <div>
                    <h2 className="text-sm font-bold text-base-content/80 mb-3">
                      Sender Details
                    </h2>

                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Sender Name
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.senderName ? "input-error" : ""
                          }`}
                          placeholder="Sender Name"
                          {...register("senderName", {
                            required: "Sender name is required",
                          })}
                        />
                        {errors.senderName && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.senderName.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Sender Contact
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.senderContact ? "input-error" : ""
                          }`}
                          placeholder="Sender Phone No"
                          {...register("senderContact", {
                            required: "Sender contact is required",
                          })}
                        />
                        {errors.senderContact && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.senderContact.message}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Region + Service Center */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Select Region
                            </span>
                          </label>
                          <select
                            className={`select select-bordered w-full ${
                              errors.senderRegion ? "select-error" : ""
                            }`}
                            {...register("senderRegion", {
                              required: "Sender region is required",
                            })}
                          >
                            <option value="" disabled>
                              Select Region
                            </option>
                            {regions.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          {errors.senderRegion && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.senderRegion.message}
                              </span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Select Service Center
                            </span>
                          </label>
                          <select
                            className={`select select-bordered w-full ${
                              errors.senderCenter ? "select-error" : ""
                            }`}
                            {...register("senderCenter", {
                              required: "Sender service center is required",
                            })}
                            disabled={!senderRegion}
                          >
                            <option value="" disabled>
                              {senderRegion
                                ? "Select Service Center"
                                : "Select Region first"}
                            </option>
                            {senderCenters.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {errors.senderCenter && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.senderCenter.message}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Covered Area */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Select Covered Area
                          </span>
                        </label>
                        <select
                          className={`select select-bordered w-full ${
                            errors.senderArea ? "select-error" : ""
                          }`}
                          {...register("senderArea", {
                            required: "Sender covered area is required",
                          })}
                          disabled={!senderCenter}
                        >
                          <option value="" disabled>
                            {senderCenter
                              ? "Select Covered Area"
                              : "Select Service Center first"}
                          </option>
                          {senderAreas.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                        {errors.senderArea && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.senderArea.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Address
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.senderAddress ? "input-error" : ""
                          }`}
                          placeholder="Address"
                          {...register("senderAddress", {
                            required: "Sender address is required",
                          })}
                        />
                        {errors.senderAddress && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.senderAddress.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Pick up Instruction
                          </span>
                        </label>
                        <textarea
                          className={`textarea textarea-bordered w-full ${
                            errors.pickupInstruction ? "textarea-error" : ""
                          }`}
                          placeholder="Pickup Instruction"
                          rows={3}
                          {...register("pickupInstruction", {
                            required: "Pickup instruction is required",
                          })}
                        />
                        {errors.pickupInstruction && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.pickupInstruction.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <p className="text-xs text-base-content/60">
                        * PickUp Time 4pm-7pm Approx.
                      </p>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div>
                    <h2 className="text-sm font-bold text-base-content/80 mb-3">
                      Receiver Details
                    </h2>

                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Receiver Name
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.receiverName ? "input-error" : ""
                          }`}
                          placeholder="Receiver Name"
                          {...register("receiverName", {
                            required: "Receiver name is required",
                          })}
                        />
                        {errors.receiverName && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.receiverName.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Receiver Contact
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.receiverContact ? "input-error" : ""
                          }`}
                          placeholder="Receiver Contact No"
                          {...register("receiverContact", {
                            required: "Receiver contact is required",
                          })}
                        />
                        {errors.receiverContact && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.receiverContact.message}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Region + Service Center */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Select Region
                            </span>
                          </label>
                          <select
                            className={`select select-bordered w-full ${
                              errors.receiverRegion ? "select-error" : ""
                            }`}
                            {...register("receiverRegion", {
                              required: "Receiver region is required",
                            })}
                          >
                            <option value="" disabled>
                              Select Region
                            </option>
                            {regions.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          {errors.receiverRegion && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.receiverRegion.message}
                              </span>
                            </label>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">
                              Select Service Center
                            </span>
                          </label>
                          <select
                            className={`select select-bordered w-full ${
                              errors.receiverCenter ? "select-error" : ""
                            }`}
                            {...register("receiverCenter", {
                              required: "Receiver service center is required",
                            })}
                            disabled={!receiverRegion}
                          >
                            <option value="" disabled>
                              {receiverRegion
                                ? "Select Service Center"
                                : "Select Region first"}
                            </option>
                            {receiverCenters.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {errors.receiverCenter && (
                            <label className="label">
                              <span className="label-text-alt text-error">
                                {errors.receiverCenter.message}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Covered Area */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Select Covered Area
                          </span>
                        </label>
                        <select
                          className={`select select-bordered w-full ${
                            errors.receiverArea ? "select-error" : ""
                          }`}
                          {...register("receiverArea", {
                            required: "Receiver covered area is required",
                          })}
                          disabled={!receiverCenter}
                        >
                          <option value="" disabled>
                            {receiverCenter
                              ? "Select Covered Area"
                              : "Select Service Center first"}
                          </option>
                          {receiverAreas.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                        {errors.receiverArea && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.receiverArea.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Address
                          </span>
                        </label>
                        <input
                          className={`input input-bordered w-full ${
                            errors.receiverAddress ? "input-error" : ""
                          }`}
                          placeholder="Address"
                          {...register("receiverAddress", {
                            required: "Receiver address is required",
                          })}
                        />
                        {errors.receiverAddress && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.receiverAddress.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">
                            Delivery Instruction
                          </span>
                        </label>
                        <textarea
                          className={`textarea textarea-bordered w-full ${
                            errors.deliveryInstruction ? "textarea-error" : ""
                          }`}
                          placeholder="Delivery Instruction"
                          rows={3}
                          {...register("deliveryInstruction", {
                            required: "Delivery instruction is required",
                          })}
                        />
                        {errors.deliveryInstruction && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.deliveryInstruction.message}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn bg-lime-300 hover:bg-lime-400 text-black border-0 px-10"
                    disabled={isSubmitting}
                  >
                    Proceed to Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendParcel;
