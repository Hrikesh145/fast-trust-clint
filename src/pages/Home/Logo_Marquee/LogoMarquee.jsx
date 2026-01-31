import React from 'react';
import './LogoMarquee.css';
import Logo1 from '../../../assets/brands/amazon.png';
import Logo2 from '../../../assets/brands/amazon_vector.png';
import Logo3 from '../../../assets/brands/casio.png';  
import Logo4 from '../../../assets/brands/moonstar.png';  
import Logo5 from '../../../assets/brands/randstad.png';  
import Logo6 from '../../../assets/brands/star.png';  
import Logo7 from '../../../assets/brands/start_people.png';



const LogoMarquee = () => {
  
  const logos = [
    Logo1,
    Logo2,
    Logo3,
    Logo4,
    Logo5,
    Logo6,
    Logo7,

  ];

  return (
    <section className=" overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Optional Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Trusted By Leading Companies
          </h2>
          <p className="text-lg text-base-content/70">
            Partnering with industry leaders
          </p>
        </div>

        {/* Marquee Container */}
        <div className="logo-marquee-wrapper">
          <div className="logo-marquee">
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div key={`logo-1-${index}`} className="logo-item">
                <img 
                  src={logo} 
                  alt={`Company ${index + 1}`}
                  className="logo-image"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div key={`logo-2-${index}`} className="logo-item">
                <img 
                  src={logo} 
                  alt={`Company ${index + 1}`}
                  className="logo-image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
