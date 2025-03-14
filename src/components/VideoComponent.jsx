"use client";
import { useEffect, useRef, useState } from "react";
import Video from "next-video";
import awesomeVideo from "/videos/Demon Slayer - Entertainment District Arc Intro - No Credits   4K 60FPS.mp4";

function VideoComponent() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [hasAutoplayTriggered, setHasAutoplayTriggered] = useState(false);

  useEffect(() => {
    // Only set up the observer if auto-play hasn't been triggered yet.
    if (!hasAutoplayTriggered && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // When the container is at least 50% visible
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setHasAutoplayTriggered(true);
            observer.disconnect(); // Stop observing after triggering auto-play
          }
        },
        { threshold: 0.5 } // 50% of the element must be visible to trigger
      );
      observer.observe(containerRef.current);
      // Clean up when the component unmounts
      return () => observer.disconnect();
    }
  }, [hasAutoplayTriggered]);

  return (
    <div ref={containerRef} className="flex justify-center">
      <Video
        ref={videoRef}
        src={awesomeVideo}
        playsInline
        className="mx-32 my-32 rounded-lg overflow-hidden"
      />
    </div>
  );
}

export default VideoComponent;
