import { useEffect, useState } from "react";
import "./Benefits.css";

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);

  useEffect(() => {
    fetch("/benefits.json")
      .then((res) => res.json())
      .then((data) => setBenefits(data))
      .catch((err) => console.error("Error loading benefits:", err));
  }, []);

  return (
    <section className=" benefits-section ">
      <div className="max-w-6xl mx-auto ">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Experience excellence with our premium delivery services designed for your convenience
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`benefit-card ${index % 2 === 0 ? 'benefit-left' : 'benefit-right'}`}
            >
              <div data-aos="fade-right" className="benefit-card-inner">
                {/* Image Container */}
                <div className="benefit-image-wrapper">
                  <div className="benefit-image-container">
                    <img
                      src={benefit.image}
                      alt={benefit.title}
                      className="benefit-image"
                    />
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="benefit-divider"></div>

                {/* Content Container */}
                <div className="benefit-content">
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
