"use client";
import React, { useEffect, useRef } from "react";
import "./wp.css";

function WaifuCarousel() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Initialize dataset attributes
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = "0";
    track.dataset.percentage = "0";

    // Handlers
    const handleOnDown = (e) => {
      track.dataset.mouseDownAt = e.clientX;
    };

    const handleOnUp = () => {
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage;
    };

    const handleOnMove = (e) => {
      if (track.dataset.mouseDownAt === "0") return;

      const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
      const maxDelta = window.innerWidth / 2;
      const percentage = (mouseDelta / maxDelta) * -100;
      const nextPercentageUnconstrained =
        parseFloat(track.dataset.prevPercentage) + percentage;
      const nextPercentage = Math.max(
        Math.min(nextPercentageUnconstrained, 0),
        -100
      );
      track.dataset.percentage = nextPercentage;

      // Animate the track
      track.animate(
        { transform: `translate(${nextPercentage}%, -50%)` },
        { duration: 1200, fill: "forwards" }
      );

      // Animate each image's object position
      for (const image of track.getElementsByClassName("image")) {
        image.animate(
          { objectPosition: `${100 + nextPercentage}% center` },
          { duration: 1200, fill: "forwards" }
        );
      }
    };

    // Event listeners for mouse/touch events
    window.addEventListener("mousedown", handleOnDown);
    window.addEventListener("touchstart", (e) =>
      handleOnDown(e.touches[0])
    );
    window.addEventListener("mouseup", handleOnUp);
    window.addEventListener("touchend", (e) =>
      handleOnUp(e.touches[0])
    );
    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", (e) =>
      handleOnMove(e.touches[0])
    );

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousedown", handleOnDown);
      window.removeEventListener("touchstart", (e) =>
        handleOnDown(e.touches[0])
      );
      window.removeEventListener("mouseup", handleOnUp);
      window.removeEventListener("touchend", (e) =>
        handleOnUp(e.touches[0])
      );
      window.removeEventListener("mousemove", handleOnMove);
      window.removeEventListener("touchmove", (e) =>
        handleOnMove(e.touches[0])
      );
    };
  }, []);

  return (
    <div id="result" className="mt-24 mb-[32rem]">
      <div
        id="image-track"
        ref={trackRef}
        data-mouse-down-at="0"
        data-prev-percentage="0"
      >
        <img className="image" src="/waifu13.png" draggable="false" alt="Image 2" />
        <img className="image" src="/waifu11.jpg" draggable="false" alt="Image 1" />
        <img className="image" src="/waifu8.webp" draggable="false" alt="Image 0" />
        <img className="image" src="/waifu9.jpg" draggable="false" alt="Image 3" />
        <img className="image" src="/waifu7.jpg" draggable="false" alt="Image 7" />
        <img className="image" src="/waifu12.jpg" draggable="false" alt="Image 6" />
        <img className="image" src="/waifu10.jpg" draggable="false" alt="Image 5" />
      </div>
    </div>
  );
}

export default WaifuCarousel;
