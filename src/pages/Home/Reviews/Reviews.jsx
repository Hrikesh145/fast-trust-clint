import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import customer from "../../../assets/customer-top.png";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("/reviews.json")
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, []);

  // Generate star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${
          i < rating ? "text-yellow-400" : "text-gray-300"
        } text-sm`}
      />
    ));
  };

  return (
    <section className="py-10 bg-gradient-to-b from-base-200 to-base-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-10" data-aos="fade-down">
          {/* Customer Image */}
          <div className="flex justify-center mb-3">
            <img
              src={customer}
              alt="Happy Customers"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-4">
            What Our Customers Are <span className="text-primary">Saying</span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Don't just take our word for it - hear from our satisfied customers
            who trust us with their deliveries every day
          </p>

          {/* Decorative Lines */}
          <div className="mt-6 flex justify-center gap-2">
            <span className="w-12 h-1 bg-primary rounded-full" />
            <span className="w-8 h-1 bg-primary/50 rounded-full" />
            <span className="w-4 h-1 bg-primary/30 rounded-full" />
          </div>
        </div>

        {/* Slider */}
        <div className="relative" data-aos="fade-up" data-aos-delay="200">
          {/* Custom Navigation Buttons */}
          <button
            className="review-prev absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10
                             h-12 w-12 rounded-full bg-white dark:bg-base-100 shadow-xl 
                             flex items-center justify-center hover:bg-primary hover:text-white
                             transition-all duration-300 group border-2 border-primary/20"
          >
            <svg
              className="w-6 h-6 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="review-next absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10
                             h-12 w-12 rounded-full bg-primary shadow-xl 
                             flex items-center justify-center hover:bg-primary-focus
                             transition-all duration-300 group"
          >
            <svg
              className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <Swiper
            className="reviewSwiper pb-12"
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            centeredSlides
            loop={reviews.length > 2}
            slidesPerView={1.1}
            spaceBetween={30}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            navigation={{
              prevEl: ".review-prev",
              nextEl: ".review-next",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 2.5 },
              1280: { slidesPerView: 3 },
            }}
          >
            {reviews.map((r) => (
              <SwiperSlide key={r.id}>
                <div
                  className="review-card bg-base-100 rounded-3xl p-8 shadow-xl border-2 border-base-300 
                                hover:border-primary/50 transition-all duration-300 h-full flex flex-col"
                >
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <FaQuoteLeft className="text-2xl text-primary" />
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-base-content/80 text-base leading-relaxed mb-6 flex-grow italic">
                    "{r.review}"
                  </p>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-6">
                    {renderStars(r.ratings)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-base-300">
                    <div className="relative">
                      <img
                        src={r.user_photoURL}
                        alt={r.userName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-base-100"></div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base-content text-lg">
                        {r.userName}
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Verified Customer
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
