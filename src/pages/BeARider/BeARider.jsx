import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import warehousesData from "../../../public/warehouses.json";
import riderImage from "../../assets/agent-pending.png";
import useAuth from "../../hooks/useAuth";

// react-icons
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaMotorcycle,
  FaClipboardList,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";


const BeARider = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
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
      name: "",
      drivingLicense: "",
      email: "",
      region: "",
      district: "",
      nid: "",
      phone: "",
      bikeModel: "",
      bikeRegNo: "",
      about: "",
    },
    mode: "onTouched",
  });

  // ✅ Auto-fill from logged-in user
  useEffect(() => {
    if (userDisplayName) setValue("name", userDisplayName);
    if (userEmail) setValue("email", userEmail);
  }, [userDisplayName, userEmail, setValue]);

  const region = watch("region");
  const district = watch("district");

  // ✅ Regions
  const regions = useMemo(() => {
    const set = new Set(warehousesData.map((w) => w.region));
    return Array.from(set).sort();
  }, []);

  // ✅ Districts by Region
  const districts = useMemo(() => {
    if (!region) return [];
    return warehousesData
      .filter((w) => w.region === region)
      .map((w) => w.district)
      .sort();
  }, [region]);

  // ✅ Reset district + area when region changes
  useEffect(() => {
    setValue("district", "");
    setValue("area", "");
  }, [region, setValue]);

  // ✅ Reset area when district changes
  useEffect(() => {
    setValue("area", "");
  }, [district, setValue]);

  // ✅ Updated onSubmit with try-catch + redirect
  const onSubmit = async (data) => {
    const riderDoc = {
      ...data,
      createdBy: {
        uid: userUid,
        email: userEmail || data.email,
        displayName: userDisplayName || data.name,
      },
      createdAtISO: new Date().toISOString(),
      status: "pending",
    };

    console.log("🛵 Rider Application Form Data:", riderDoc);

    try {
      const res = await axiosSecure.post("/riders", riderDoc);
      if (res.data.insertedId) {
        Swal.fire({
          title: "Success!",
          text: "Your rider application submitted successfully!",
          icon: "success",
          confirmButtonColor: "#84cc16",
        }).then(() => {
          reset();
          navigate("/", { replace: true });
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to submit application",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // ✅ Confirm FIRST, then trigger react-hook-form submit
  const handleConfirmAndSubmit = async () => {
    const result = await Swal.fire({
      title: "Confirm Application?",
      text: "Do you want to submit your rider application?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#84cc16",
    });

    if (!result.isConfirmed) return;

    handleSubmit(onSubmit)();
  };

  // ✅ Reusable input wrapper
  const Field = ({ label, icon, error, children }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-base-content">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-20 py-20 rounded-3xl">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT SIDE: text + form */}
          <div>
            <h1 className="text-5xl font-extrabold text-slate-800">
              Be a Rider
            </h1>
            <p className="text-slate-500 mt-3 max-w-xl leading-relaxed">
              Enjoy fast, reliable parcel delivery with real-time tracking and
              zero hassle. From personal packages to business shipments — we
              deliver on time, every time.
            </p>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Tell us about yourself
              </h2>
              <div className="h-[1px] bg-slate-200 mt-3 mb-6" />
            </div>

            {/* ✅ prevent native submit */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Name */}
              <Field
                label="Your Name"
                icon={<FaUser />}
                error={errors.name?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.name ? "input-error" : ""
                  }`}
                  placeholder="Your Name"
                  {...register("name", { required: "Name is required" })}
                />
              </Field>

              {/* Driving License */}
              <Field
                label="Driving License Number"
                icon={<FaIdCard />}
                error={errors.drivingLicense?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.drivingLicense ? "input-error" : ""
                  }`}
                  placeholder="Driving License Number"
                  {...register("drivingLicense", {
                    required: "Driving license is required",
                  })}
                />
              </Field>

              {/* Email */}
              <Field
                label="Your Email"
                icon={<FaEnvelope />}
                error={errors.email?.message}
              >
                <input
                  type="email"
                  disabled={!!userEmail}
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="Your Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
              </Field>

              {/* Region */}
              <Field
                label="Your Region"
                icon={<FaMapMarkerAlt />}
                error={errors.region?.message}
              >
                <select
                  className={`select select-bordered w-full pl-10 ${
                    errors.region ? "select-error" : ""
                  }`}
                  {...register("region", { required: "Region is required" })}
                >
                  <option value="" disabled>
                    Select your Region
                  </option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              {/* District */}
              <Field
                label="Your District"
                icon={<FaMapMarkerAlt />}
                error={errors.district?.message}
              >
                <select
                  className={`select select-bordered w-full pl-10 ${
                    errors.district ? "select-error" : ""
                  }`}
                  {...register("district", {
                    required: "District is required",
                  })}
                  disabled={!region}
                >
                  <option value="" disabled>
                    {region ? "Select your District" : "Select Region first"}
                  </option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              {/* NID */}
              <Field
                label="NID No"
                icon={<FaIdCard />}
                error={errors.nid?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.nid ? "input-error" : ""
                  }`}
                  placeholder="NID"
                  {...register("nid", { required: "NID is required" })}
                />
              </Field>

              {/* Phone - ✅ Updated with Bangladesh validation */}
              <Field
                label="Phone Number"
                icon={<FaPhoneAlt />}
                error={errors.phone?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.phone ? "input-error" : ""
                  }`}
                  placeholder="01XXXXXXXX"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^01[3-9]\d{8}$/,
                      message: "Enter valid Bangladesh phone (01XXXXXXXX)",
                    },
                  })}
                />
              </Field>

              {/* Bike Model */}
              <Field
                label="Bike Brand Model and Year"
                icon={<FaMotorcycle />}
                error={errors.bikeModel?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.bikeModel ? "input-error" : ""
                  }`}
                  placeholder="Bike Brand Model and Year"
                  {...register("bikeModel", {
                    required: "Bike model is required",
                  })}
                />
              </Field>

              {/* Bike Reg */}
              <Field
                label="Bike Registration Number"
                icon={<FaMotorcycle />}
                error={errors.bikeRegNo?.message}
              >
                <input
                  className={`input input-bordered w-full pl-10 ${
                    errors.bikeRegNo ? "input-error" : ""
                  }`}
                  placeholder="Bike Registration Number"
                  {...register("bikeRegNo", {
                    required: "Bike registration is required",
                  })}
                />
              </Field>

              {/* About */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-base-content">
                  Tell Us About Yourself
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-4 text-gray-500 z-10 pointer-events-none">
                    <FaClipboardList />
                  </span>
                  <textarea
                    className={`textarea textarea-bordered w-full pl-10 ${
                      errors.about ? "textarea-error" : ""
                    }`}
                    rows={3}
                    placeholder="Tell Us About Yourself"
                    {...register("about", {
                      required: "This field is required",
                      minLength: {
                        value: 10,
                        message: "Write at least 10 characters",
                      },
                    })}
                  />
                </div>
                {errors.about && (
                  <p className="text-error text-xs">{errors.about.message}</p>
                )}
              </div>

              {/* ✅ Submit (confirm first) */}
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                disabled={isSubmitting}
                className="btn w-full bg-lime-300 hover:bg-lime-400 text-black border-0 mt-2"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: only image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src={riderImage}
              alt="Rider"
              className="w-full max-w-md object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeARider;
