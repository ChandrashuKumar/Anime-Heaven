"use client"
import { useEffect, useRef, useState } from "react"

function VideoComponent({ className = "" }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [hasAutoplayTriggered, setHasAutoplayTriggered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only set up the observer if auto-play hasn't been triggered yet.
    if (!hasAutoplayTriggered && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // When the container is at least 50% visible
          if (entry.isIntersecting) {
            videoRef.current?.play().catch((err) => {
              // Handle autoplay restrictions gracefully
              console.log("Autoplay prevented:", err)
            })
            setHasAutoplayTriggered(true)
            observer.disconnect() // Stop observing after triggering auto-play
          }
        },
        { threshold: 0.5 }, // 50% of the element must be visible to trigger
      )
      observer.observe(containerRef.current)
      // Clean up when the component unmounts
      return () => observer.disconnect()
    }
  }, [hasAutoplayTriggered])

  // Handle video events
  const handleLoadStart = () => setIsLoading(true)
  const handleCanPlay = () => setIsLoading(false)
  const handleError = (e) => {
    setIsLoading(false)
    setError("Failed to load video. Please try again later.")
    console.error("Video error:", e)
  }

  return (
    <div ref={containerRef} className="relative flex justify-center">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#23022E]/30 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-[#ADA8B6] animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-10">
          <div className="text-white text-center p-4">
            <p className="mb-2">{error}</p>
            <button
              onClick={() => {
                setError(null)
                videoRef.current?.load()
              }}
              className="px-4 py-2 bg-[#23022E] rounded-md hover:bg-[#23022E]/80 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src="https://firebasestorage.googleapis.com/v0/b/anime-heaven-74196.firebasestorage.app/o/videos%2Fdemon%20slayer%20ea.mp4?alt=media&token=6575ca66-fad2-42d2-aa26-1a3dca765917"
        className={`w-[90%] sm:w-[80%] md:mx-16 lg:mx-32 my-8 sm:my-16 md:my-32 rounded-lg overflow-hidden ${className}`}
        controls
        playsInline
        preload="auto"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoComponent
