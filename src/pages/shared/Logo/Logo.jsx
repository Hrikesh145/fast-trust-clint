import React from "react";
import fast_Logo from "../../../assets/logo.png";
import { Link } from "react-router";
const Logo = () => {
  return (
    <Link to="/">
      <div className="flex items-end">
        <img className="mb-2" src={fast_Logo} alt="Logo" />
        <p className="text-3xl font-extrabold -ml-3">Fast</p>
      </div>
    </Link>
  );
};

export default Logo;
