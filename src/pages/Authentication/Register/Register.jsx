import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogin from "../socialLogin/socialLogin";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useAxios from "../../../hooks/useAxios"; 

const Register = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const axiosPublic = useAxios(); // baseURL = http://localhost:3000/

  const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { createUser, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  const onSubmit = async (data) => {
    try {
      // 1) Firebase create
      const result = await createUser(data.email, data.password);
      const user = result.user;

      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // 2) Update Firebase profile
      await updateUserProfile({
        displayName: fullName,
        photoURL: imageUrl || "",
      });

      // 3) Save user in DB (users collection)
      const nowISO = new Date().toISOString();

      const userInfo = {
        uid: user.uid,
        email: user.email,
        name: fullName,
        photoURL: imageUrl || "",
        provider: user.providerData?.[0]?.providerId || "password",

        createdAt: nowISO,
        lastLoginAt: nowISO,
      };

      await axiosPublic.post("/users", userInfo);

      toast.success("Registration successful!");
      navigate(from, { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Registration failed");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));

    setImageUrl(""); // reset uploaded image
  };

  const uploadImage = async () => {
    if (!imageFile) {
      toast.error("Please choose an image first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        formData,
      );

      const url = res.data.data.url;
      setImageUrl(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center p-5">Create an account!</h1>

      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <label className="label">First name</label>
            <input
              type="text"
              {...register("firstName", { required: true })}
              className="input"
              placeholder="First name"
            />
            {errors.firstName && (
              <p className="text-red-600">First name is required</p>
            )}

            <label className="label">Last name</label>
            <input
              type="text"
              {...register("lastName", { required: true })}
              className="input"
              placeholder="Last name"
            />
            {errors.lastName && (
              <p className="text-red-600">Last name is required</p>
            )}

            <label className="label">Upload Profile Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="input"
              accept="image/*"
            />

            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="preview"
                  className="w-28 h-28 rounded-full object-cover border"
                />
              </div>
            )}

            <button
              type="button"
              onClick={uploadImage}
              disabled={uploading || !imageFile || imageUrl}
              className={`btn mt-3 ${
                imageUrl ? "btn-success cursor-not-allowed" : "btn-primary"
              }`}
            >
              {uploading
                ? "Uploading..."
                : imageUrl
                  ? "Image Uploaded ✅"
                  : "Upload Image"}
            </button>

            {imageUrl && (
              <p className="text-green-600 text-sm mt-2 font-medium">
                ✅ Profile picture uploaded successfully
              </p>
            )}

            <label className="label">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="input"
              placeholder="Email"
            />
            {errors.email && <p className="text-red-600">Email is required</p>}

            <label className="label">Password</label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="input"
              placeholder="Password"
            />
            {errors.password?.type === "required" && (
              <p className="text-red-600">Password is required</p>
            )}
            {errors.password?.type === "minLength" && (
              <p className="text-red-600">
                Password must be 6 characters or longer
              </p>
            )}

            <p>
              Already have an account?{" "}
              <Link className="btn-link text-secondary" to="/login">
                Login
              </Link>
            </p>
          </fieldset>

          <button className="btn btn-secondary mt-4 text-black w-full">
            Register
          </button>
          <SocialLogin />
        </form>
      </div>
    </div>
  );
};

export default Register;
