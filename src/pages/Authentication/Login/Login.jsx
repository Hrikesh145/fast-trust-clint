import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogin from "../socialLogin/socialLogin";
import useAuth from "../../../hooks/useAuth";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {signIn} = useAuth
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/";
  const onSubmit = (data) => {
    // console.log(data);
    signIn(data.email,data.password)
    .then(result =>{
      const loggedUser = result.user;
      console.log(loggedUser);
      navigate(from,{replace:true});
    })
    .catch(error =>{
      console.log(error.message);
    })
  };
  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <h1 className="text-3xl font-bold text-center p-5">Welcome Back!</h1>
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="input"
              placeholder="Email"
            />

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
              <a className="link link-hover">Forgot password?</a>
            </div>
          </fieldset>
          <button className="btn btn-secondary text-black mt-4 text-center w-full">Login</button>
        </form>
        <div>
          <p className="">
            New to this website?{" "}
            <Link className=" btn-link text-secondary" to="/register">
              Register
            </Link>
          </p>
        </div>
        <SocialLogin></SocialLogin>
      </div>
    </div>
  );
};

export default Login;
