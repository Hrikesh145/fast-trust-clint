import React from "react";
import { NavLink, Outlet } from "react-router";
import {
  FiHome,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiMenu,
} from "react-icons/fi";
import Logo from "../pages/shared/Logo/Logo";

const DashBoardLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 
     ${
       isActive
         ? "bg-primary text-primary-content shadow-md"
         : "text-base-content/80 hover:bg-base-300 hover:text-base-content"
     }`;

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-100">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        {/* Top Navbar */}
        <div className="navbar sticky top-0 z-20 bg-base-200/80 backdrop-blur border-b border-base-300 px-4">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-ghost btn-square"
            >
              <FiMenu className="text-xl" />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-xs text-base-content/60 -mt-1">
              Manage parcels, payments & profile
            </p>
          </div>

          {/* Optional right side */}
          <div className="flex-none gap-2">
            <div className="badge badge-outline hidden sm:inline-flex">
              Active
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <div className="rounded-2xl bg-base-200/50 border border-base-300 shadow-sm p-4 md:p-6 min-h-[calc(100vh-120px)]">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <aside className="w-80 min-h-full bg-base-200 border-r border-base-300">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/20 to-secondary/10">
            <Logo />
            <div className="mt-3">
              <h3 className="text-base font-semibold">Welcome back 👋</h3>
              <p className="text-sm text-base-content/70">
                Quick access menu
              </p>
            </div>
          </div>

          {/* Menu */}
          <ul className="menu p-4 gap-2">
            <li>
              <NavLink to="/" className={navLinkClass}>
                <FiHome className="text-lg" />
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/myParcels" className={navLinkClass}>
                <FiPackage className="text-lg" />
                My Parcels
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/paymentHistory" className={navLinkClass}>
                <FiCreditCard className="text-lg" />
                Payment History
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/pendingRiders" className={navLinkClass}>
                <FiCreditCard className="text-lg" />
                Pending Riders
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/activeRiders" className={navLinkClass}>
                <FiCreditCard className="text-lg" />
                Active Riders
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/track" className={navLinkClass}>
                <FiMapPin className="text-lg" />
                Track a Parcel
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard/profile" className={navLinkClass}>
                <FiUser className="text-lg" />
                Update Profile
              </NavLink>
            </li>

            <div className="mt-4 divider" />

            {/* Optional footer area */}
            <div className="px-2 text-xs text-base-content/60">
              © {new Date().getFullYear()} • Dashboard
            </div>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default DashBoardLayout;
