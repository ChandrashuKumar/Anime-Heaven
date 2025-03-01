import Footer from "@/components/Footer";
import TopFourCards from "@/components/TopFourCards";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import VideoComponent from "@/components/VideoComponent";
import WaifuCarousel from "@/components/WaifuCarousel";
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

      {/* Centered Content */}
      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-screen-lg px-4 md:px-8 flex flex-col items-center">

          {/* Animated Text */}
          <TextGenerateEffect
            className="uppercase tracking-wide text-4xl text-center text-pink-300 whitespace-normal"
            words="Dive into the Vast, Amazing World of Anime"
          />

          <TextGenerateEffect
            className="text-center text-blue-300 text-3xl md:text-5xl lg:text-6xl whitespace-normal"
            words="Rediscover your Memories and Add New ones"
          />

        </div>
      </div>

      <TopFourCards />

      <div className="flex justify-center relative mt-20 z-10">
        <div className="max-w-screen-lg px-4 md:px-8 flex flex-col items-center">

          <TextGenerateEffect
            className="text-center text-violet-300 text-3xl md:text-5xl lg:text-6xl whitespace-normal"
            words="Feel the raw emotions"
          />

        </div>
      </div>

      <VideoComponent />

      <div className="flex justify-center relative my-10 z-10">
        <div className="max-w-screen-lg px-4 md:px-8 flex flex-col items-center">

          <TextGenerateEffect
            className="text-center text-teal-400 text-3xl md:text-5xl lg:text-6xl whitespace-normal"
            words="And remember your waifus ❤️"
          />

        </div>
      </div>
      <WaifuCarousel/>
      <Footer/>
    </div>
  );
}

export default Dashboard;
