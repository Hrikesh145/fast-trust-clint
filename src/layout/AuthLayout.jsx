import React from "react";
import Navbar from "../pages/shared/Navbar/Navbar";
import Footer from "../pages/shared/Footer/Footer";
import authImage from "../assets/authImage.png";
import { Outlet } from "react-router";
import Logo from "../pages/shared/Logo/Logo";

const AuthLayout = () => {
  return (
    <div>
      <Navbar></Navbar>
      <main className="max-w-7xl mx-auto">
        <div>
          <div className="bg-[#FAFDF0] p-12 rounded-lg shadow-lg ">
            <main className="max-w-7xl mx-auto ">
              <div>
                <Logo></Logo>
              </div>
              <div className="hero-content flex flex-col lg:flex-row-reverse items-center gap-10">
                {/* IMAGE */}
                <div className="flex flex-1 justify-center items-center">
                  <img
                    src={authImage}
                    className="max-w-sm rounded-lg shadow-2xl"
                  />
                </div>

                {/* FORM / OUTLET */}
                <div className="flex flex-1 justify-center items-center ">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
};

export default AuthLayout;
