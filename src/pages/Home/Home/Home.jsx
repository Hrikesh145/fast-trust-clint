import React from "react";
import Banner from "../Banner/Banner";
import OurServices from "../Services/OurServices";
import LogoMarquee from "../Logo_Marquee/LogoMarquee";
import Benefits from "../Benefits/Benefits";
import Merchant from "../Merchant/Merchant";
import Reviews from "../Reviews/Reviews";

const Home = () => {
  return (
    <div className="flex flex-col gap-20">
      <Banner></Banner>
      <OurServices></OurServices>
      <LogoMarquee></LogoMarquee>
      <Benefits></Benefits>
      <Merchant></Merchant>
      <Reviews></Reviews>
    </div>
  );
};

export default Home;
