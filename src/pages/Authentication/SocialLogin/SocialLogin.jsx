import React from "react";
import useAuth from "../../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import useAxios from "../../../hooks/useAxios";

const SocialLogin = () => {
  const { signInWithGoogle } = useAuth();
  const axiosPublic = useAxios();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      const nowISO = new Date().toISOString();

      const userInfo = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: user.providerData?.[0]?.providerId || "google.com",

        createdAt: nowISO,
        lastLoginAt: nowISO,
      };

      await axiosPublic.post("/users", userInfo);

      toast.success("Google login successful!");
      navigate(from, { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Google login failed");
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-4">
      <p>Or</p>
      <button
        onClick={handleGoogleSignIn}
        className="btn bg-white text-black border-[#e5e5e5] text-center w-full"
      >
        
        Login with Google
      </button>
    </div>
  );
};

export default SocialLogin;
