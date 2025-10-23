import {
  BsYoutube,
  BsLinkedin,
  BsInstagram,
  BsPlayCircle,
  BsX,
} from "react-icons/bs";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

// useCountAnimation hook remains the same
const useCountAnimation = (
  end: number,
  duration: number = 1000,
  start: number = 0
) => {
  const [count, setCount] = useState(start);
  const countRef = useRef<number>(start);
  const timeRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      countRef.current = start + Math.floor((end - start) * progress);
      setCount(countRef.current);

      if (progress < 1) {
        timeRef.current = requestAnimationFrame(animate);
      }
    };

    timeRef.current = requestAnimationFrame(animate);

    return () => {
      if (timeRef.current) {
        cancelAnimationFrame(timeRef.current);
      }
    };
  }, [end, duration, start]);

  return count;
};

const socialMediaData = {
  stats: [
    { count: "50K+", label: "YouTube Subscribers", numericValue: 50 },
    { count: "100K+", label: "LinkedIn Followers", numericValue: 100 },
    { count: "25K+", label: "Instagram Followers", numericValue: 25 },
  ],
  featuredContent: [
    {
      title: "SQL Interview Questions",
      views: "250K",
      platform: "YouTube",
      icon: BsYoutube,
      color: "text-red-500",
    },
    {
      title: "Data Analytics Career Guide",
      views: "180K",
      platform: "LinkedIn",
      icon: BsLinkedin,
      color: "text-blue-500",
    },
    {
      title: "Python Tips & Tricks",
      views: "120K",
      platform: "Instagram",
      icon: BsInstagram,
      color: "text-pink-500",
    },
  ],
  videos: [
    {
      title: "Don't Get Scammed!",
      thumbnail: "images/thumbnails/it.jpg",
      views: "12K",
      youtubeId: "PtzWRgcN-w0",
    },
    {
      title: "Power BI for Beginners",
      thumbnail: "images/thumbnails/powerbi.jpg",
      views: "15K",
      youtubeId: "W-jQg5D1RoE",
    },
    {
      title: "Midnight Python Coding Challenge",
      thumbnail: "images/thumbnails/python.jpg",
      views: "18K",
      youtubeId: "v_Dpyj7AEIg",
    },
  ],
};

function Social() {
  // State to track the current playing video
  const [currentVideo, setCurrentVideo] = useState<{
    title: string;
    youtubeId: string;
  } | null>(null);

  // Function to handle video click - now opens the overlay player
  const handleVideoClick = (youtubeId: string, title: string) => {
    setCurrentVideo({ youtubeId, title });
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  // Function to close the video player
  const closeVideoPlayer = () => {
    setCurrentVideo(null);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  // Handle escape key to close the player
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && currentVideo) {
        closeVideoPlayer();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [currentVideo]);


  const VideoCard = ({
    video,
    isMain = false,
  }: {
    video: (typeof socialMediaData.videos)[0];
    isMain?: boolean;
  }) => (
    <div
      className={`cursor-pointer rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm
        h-full w-full`}
      onClick={() => handleVideoClick(video.youtubeId, video.title)}
    >
      <div className="relative aspect-video w-full">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h4
              className={`font-bold text-white mb-2 ${
                isMain ? "text-2xl" : "text-lg"
              }`}
            >
              {video.title}
            </h4>
            <div className="flex items-center text-cyan-400 text-sm">
              <BsYoutube className="mr-2 text-lg" />
              {/* {video.views} views */}
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="w-16 h-16 rounded-full bg-cyan-400 flex items-center justify-center 
              hover:bg-cyan-300 transition-colors duration-300"
            >
              <BsPlayCircle className="text-4xl text-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Video Player Overlay Component
  const VideoPlayerOverlay = () => {
    if (!currentVideo) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          {/* Close button */}
          <button
            className="absolute -top-12 right-0 text-white z-10 hover:text-cyan-400 transition-colors"
            onClick={closeVideoPlayer}
            aria-label="Close video"
          >
            <BsX className="text-4xl" />
          </button>

          {/* Video player container */}
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* Fixed aspect ratio container */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                title={currentVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-0 bg-transparent">
      <div className=" px-0">
        {/* Featured Videos */}
        <div className="mt-16">
          <div className="mx-auto px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main large video card */}
              <div className="md:col-span-2">
                <VideoCard video={socialMediaData.videos[0]} isMain={true} />
              </div>

              {/* Stack of smaller video cards */}
              <div className="flex flex-col gap-6">
                {socialMediaData.videos.slice(1).map((video, index) => (
                  <VideoCard key={index + 1} video={video} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <VideoPlayerOverlay />
    </section>
  );
}

export default Social;
