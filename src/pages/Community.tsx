import DashboardLayout from "@/components/layout/DashboardLayout";
import Social from "./Social";
import {
  FaYoutube,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
  FaDiscord,
  FaLaptop // for Topmate
} from "react-icons/fa";

const Community = () => {
  const communities = [
    {
      id: "linkedin",
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/data-sense-lms/",
      icon: <FaLinkedin className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Professional network"
    },
    {
      id: "facebook",
      name: "Facebook",
      url: "https://www.facebook.com/people/Data-Sense/61550202884240/?mibextid=LQQJ4d",
      icon: <FaFacebook className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Social updates"
    },
    {
      id: "instagram", 
      name: "Instagram",
      url: "https://www.instagram.com/senseofdata/",
      icon: <FaInstagram className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Visual updates"
    },
    {
      id: "youtube",
      name: "YouTube", 
      url: "https://www.youtube.com/@Senseofdata",
      icon: <FaYoutube className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Video content"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: "https://chat.whatsapp.com/DYgDxOA8nBvJp4tPz5J6ox",
      icon: <FaWhatsapp className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Join our learning groups"
    },
    {
      id: "discord",
      name: "Discord", 
      url: "https://discord.gg/BKFRhRw9",
      icon: <FaDiscord className="w-8 h-8 text-[#00FFFF]" />,
      desc: "Community chat"
    },
    {
      id: "topmate",
      name: "Topmate",
      url: "https://topmate.io/datasense",
      icon: <FaLaptop className="w-8 h-8 text-[#00FFFF]" />,
      desc: "1:1 Mentorship Sessions"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-6 glow-text">Community</h1>
        
        <section className="mt-8">
          <h2 className="text-2xl text-white mb-6 font-medium">Join Our Communities</h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {communities.map(c => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-slate-800/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"></div>
                
                <div className="relative bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl transition-all duration-500 ease-out
                  group-hover:border-teal-500/50 group-hover:translate-y-[-4px] group-hover:shadow-teal-500/10">
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full bg-slate-700/50 backdrop-blur-sm">
                        {c.icon}
                      </div>
                      <h3 className="text-lg font-medium text-white">{c.name}</h3>
                    </div>

                    <p className="text-sm text-slate-300">{c.desc}</p>

                    <div className="mt-6">
                      <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                        bg-teal-500/10 border border-teal-500/20 rounded-lg
                        transition-all duration-300 ease-out
                        hover:bg-teal-500/20 hover:border-teal-500/30
                        active:bg-teal-500/30">
                        Go to community
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl text-white mb-6 font-medium">Trending Insights</h2>
          <Social />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Community;
