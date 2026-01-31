import { useEffect, useState } from "react";
import "./OurServices.css";
import {
  FaShippingFast,
  FaGlobeAsia,
  FaBoxes,
  FaMoneyBillWave,
  FaWarehouse,
  FaUndoAlt,
  FaTruck,
} from "react-icons/fa";

const OurServices = () => {
  const [services, setServices] = useState([]);

  const getIcon = (title) => {
    const iconMap = {
      "Express & Standard Delivery": FaShippingFast,
      "Nationwide Delivery": FaGlobeAsia,
      "Fulfillment Solution": FaBoxes,
      "Cash on Home Delivery": FaMoneyBillWave,
      "Corporate Service / Contract In Logistics": FaWarehouse,
      "Parcel Return": FaUndoAlt,
    };
    return iconMap[title] || FaTruck;
  };

  useEffect(() => {
    fetch("/services.json")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading services:", err));
  }, []);

  return (
    <section className="py-20 px-4 bg-[#03373D] rounded-4xl ">
      <div className="max-w-7xl mx-auto ">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-4 text-white">
            Our Services
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto text-white">
            Discover our comprehensive delivery solutions designed to meet all
            your shipping needs
          </p>

          <div className="mt-4 flex justify-center">
            <span className="w-10 h-[3px] bg-primary rounded-full" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = getIcon(service.title);

            return (
              <div
                key={index}
                className="service-card bg-base-100 rounded-2xl shadow-lg
                           transition-all duration-300 hover:-translate-y-2
                           hover:shadow-2xl"
              >
                <div className="p-8 text-center">
                  {/* Icon */}
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center transition-all duration-300 service-icon">
                      <Icon className="text-4xl text-primary" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-base-content mb-4">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base-content/70 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
