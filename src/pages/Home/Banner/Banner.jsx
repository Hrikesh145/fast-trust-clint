import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./Banner.css";
import bannerImg1 from "../../../assets/banner/banner1.png";
import bannerImg2 from "../../../assets/banner/banner2.png";
import bannerImg3 from "../../../assets/banner/banner3.png";

const Banner = () => {
  return (
    <Carousel
      autoPlay
      infiniteLoop
      interval={5000}
      transitionTime={800}
      showThumbs={false}
      showStatus={false}
      className="gorgeous-carousel"
    >
      <div className="slide-wrapper">
        <img src={bannerImg1} alt="Banner 1" />
        <div className="overlay">
          <h2>Timely Parcel Delivery</h2>
          <p>Your packages arrive on time, hassle-free</p>
        </div>
      </div>

      <div className="slide-wrapper">
        <img src={bannerImg2} alt="Banner 2" />
        <div className="overlay">
          <h2>Fast & Reliable Service</h2>
          <p>We ensure safe delivery every single time</p>
        </div>
      </div>

      <div className="slide-wrapper">
        <img src={bannerImg3} alt="Banner 3" />
        <div className="overlay">
          <h2>30-Minute Doorstep Delivery</h2>
          <p>Quick delivery right to your door</p>
        </div>
      </div>
    </Carousel>
  );
};

export default Banner;
