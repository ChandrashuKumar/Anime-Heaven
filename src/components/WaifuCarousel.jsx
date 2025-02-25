"use client";
import React, { useEffect, useRef } from "react";
import "flickity/css/flickity.css"
import "./flickity.css"

function WaifuCarousel() {
  // Create a ref to attach to the carousel container.
  const carouselRef = useRef(null);

  useEffect(() => {
    // Ensure we're running in the browser.
    if (typeof window !== "undefined" && carouselRef.current) {
      // Dynamically require Flickity to avoid SSR issues.
      const Flickity = require("flickity");

      // Initialize Flickity on the carousel element.
      const flkty = new Flickity(carouselRef.current, {
        imagesLoaded: true,
        percentPosition: false,
      });

      // Select all images within carousel cells.
      const imgs = carouselRef.current.querySelectorAll(".carousel-cell img");

      // Determine the proper transform property.
      const docStyle = document.documentElement.style;
      const transformProp =
        typeof docStyle.transform === "string" ? "transform" : "WebkitTransform";

      // Listen for the Flickity scroll event to adjust image positions.
      flkty.on("scroll", function () {
        flkty.slides.forEach(function (slide, i) {
          const img = imgs[i];
          const x = (slide.target + flkty.x) * -1 / 3;
          img.style[transformProp] = "translateX(" + x + "px)";
        });
      });
    }
  }, []);

  return (
    <div className="carousel mb-24 mx-12" ref={carouselRef}>
      <div className="carousel-cell" key="1">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/orange-tree.jpg"
          alt="orange tree"
        />
      </div>
      <div className="carousel-cell" key="2">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/one-world-trade.jpg"
          alt="One World Trade"
        />
      </div>
      <div className="carousel-cell" key="3">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/drizzle.jpg"
          alt="drizzle"
        />
      </div>
      <div className="carousel-cell" key="4">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/cat-nose.jpg"
          alt="cat nose"
        />
      </div>
      <div className="carousel-cell" key="5">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/contrail.jpg"
          alt="contrail"
        />
      </div>
      <div className="carousel-cell" key="6">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/golden-hour.jpg"
          alt="golden hour"
        />
      </div>
      <div className="carousel-cell" key="7">
        <img
          src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/82/flight-formation.jpg"
          alt="flight formation"
        />
      </div>
    </div>
  );
}

export default WaifuCarousel;
