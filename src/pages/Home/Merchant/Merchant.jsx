import React from "react";
import MerchantImg from "../../../assets/location-merchant.png";
import Bg from "../../../assets/be-a-merchant-bg.png";

const Merchant = () => {
  return (
    <section className="">
      <div data-aos="zoom-in-up" className="max-w-7xl mx-auto">
        <div className="relative min-h-[420px] rounded-[32px] overflow-hidden shadow-xl">
          {/* ✅ Background Image (subtle) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.06] dark:opacity-[0.10]"
            style={{ backgroundImage: `url(${Bg})` }}
          />

          {/* ✅ Theme-aware Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#03373D] via-[#024B52] to-[#035E5B] dark:from-[#0B1F23] dark:via-[#0A2A2C] dark:to-[#0F3A36]" />

          {/* ✅ Soft highlight (stronger in dark) */}
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-white/5 dark:bg-white/10 rounded-full blur-3xl" />

          {/* ✅ Extra depth layer (so it never blends into dark page) */}
          <div className="absolute inset-0 bg-black/0 dark:bg-black/20" />

          {/* Content */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-8 p-10 lg:p-14">
            {/* Left */}
            <div className="text-white space-y-6 max-w-xl">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight">
                Merchant and Customer Satisfaction is Our First Priority
              </h2>

              <p className="text-base lg:text-lg text-white/80 leading-relaxed">
                We offer the lowest delivery charge with the highest value along
                with 100% safety of your product. Pathao courier delivers your
                parcels in every corner of Bangladesh right on time.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {/* ✅ Primary button uses your theme primary */}
                <button className="btn rounded-full bg-primary text-primary-content border-none hover:opacity-90">
                  Become a Merchant
                </button>

                {/* ✅ Outline button stays visible in dark mode */}
                <button className="btn btn-outline rounded-full border-white/80 text-white hover:bg-white hover:text-[#03373D]">
                  Earn with ZapShift Courier
                </button>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden lg:flex justify-end">
              <img
                src={MerchantImg}
                alt="Merchant Illustration"
                className="max-w-lg opacity-85 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Merchant;
