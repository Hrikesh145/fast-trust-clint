import React from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { Link } from "react-router";
import SocialLogin from "../socialLogin/socialLogin";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { createUser } = useAuth();

  const onSubmit = (data) => {
    console.log(data);
    createUser(data.email, data.password)
      .then((result) => {
        const user = result.user;
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <h1 className="text-3xl font-bold text-center p-5">Create an account!</h1>
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            {/* First name */}
            <label className="label">First name</label>
            <input
              type="text"
              {...register("firstName", { required: true })}
              className="input"
              placeholder="First name"
            />
            {errors.firstName?.type === "required" && (
              <p className="text-red-600">First name is required</p>
            )}
            {/* Last name */}
            <label className="label">Last name</label>
            <input
              type="text"
              {...register("lastName", { required: true })}
              className="input"
              placeholder="Last name"
            />
            {errors.lastName?.type === "required" && (
              <p className="text-red-600">Last name is required</p>
            )}
            {/* Email */}
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="input"
              placeholder="Email"
            />
            {errors.email?.type === "required" && (
              <p className="text-red-600">Email is required</p>
            )}
            {/* Password */}
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

            <div>
              <p className="">
                Already have an account?{" "}
                <Link className=" btn-link text-secondary" to="/login">
                  Login
                </Link>
              </p>
            </div>
          </fieldset>
          <button className="btn btn-secondary mt-4 text-black text-center w-full">
            Register
          </button>
          <SocialLogin></SocialLogin>
        </form>
      </div>
    </div>
  );
};

export default Register;
