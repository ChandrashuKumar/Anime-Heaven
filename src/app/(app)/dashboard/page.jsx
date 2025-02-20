import TopFourCards from "@/components/TopFourCards";
function Dashboard() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/Kimi No Nawa breaking.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <TopFourCards />
      
      {/* Your Dashboard Content */}
    </div>
  );
}

export default Dashboard;
