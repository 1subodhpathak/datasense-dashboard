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
import { Slack } from 'lucide-react';


const Community = () => {
  const communities = [
    {
      id: "linkedin",
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/data-sense-lms/",
      icon: <FaLinkedin className="h-6 w-6" />,
      desc: "Professional network"
    },
    {
      id: "facebook",
      name: "Facebook",
      url: "https://www.facebook.com/people/Data-Sense/61550202884240/?mibextid=LQQJ4d",
      icon: <FaFacebook className="h-6 w-6" />,
      desc: "Social updates"
    },
    {
      id: "instagram", 
      name: "Instagram",
      url: "https://www.instagram.com/senseofdata/",
      icon: <FaInstagram className="h-6 w-6" />,
      desc: "Visual updates"
    },
    {
      id: "youtube",
      name: "YouTube", 
      url: "https://www.youtube.com/@Senseofdata",
      icon: <FaYoutube className="h-6 w-6" />,
      desc: "Video content"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: "https://chat.whatsapp.com/DYgDxOA8nBvJp4tPz5J6ox",
      icon: <FaWhatsapp className="h-6 w-6" />,
      desc: "Join our learning groups"
    },
    {
      id: "discord",
      name: "Discord", 
      url: "https://discord.gg/BKFRhRw9",
      icon: <FaDiscord className="h-6 w-6" />,
      desc: "Community chat"
    },
    {
      id: "topmate",
      name: "Topmate",
      url: "https://topmate.io/datasense",
      icon: <FaLaptop className="h-6 w-6" />,
      desc: "1:1 Mentorship Sessions"
    },
    {
      id: "slack",
      name: "Slack",
      url: "https://join.slack.com/t/datasenseai/shared_invite/zt-2f91qy3ik-9Ix7Np2jS63g9X8~8_jT4g",
      icon: <Slack className="h-6 w-6" />,
      desc: "Community chat"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 min-h-screen">        
        <section className="mt-0">
          <h2 className="text-2xl text-white mb-6 font-medium">Join Our Communities</h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {communities.map(c => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group relative block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-dsb-neutral3/30 bg-white/90 p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-dsb-accent/50 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_40px_-24px_rgba(8,226,202,0.35)]">
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-br from-dsb-accent/10 via-transparent to-transparent transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-dsb-accent/10 text-dsb-accent dark:bg-dsb-accent/15 dark:text-dsb-accent">
                        {c.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                    </div>

                    <p className="text-sm text-dsb-neutral2 dark:text-white/70">{c.desc}</p>

                    <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-wide text-dsb-neutral2/70 dark:text-white/40">
                      <span>Community access</span>
                      <span className="flex items-center gap-1 text-dsb-accent">
                        Active
                        <span className="size-2 rounded-full bg-dsb-accent/70" />
                      </span>
                    </div>

                    <span className="relative mt-4 inline-flex items-center gap-2 self-start rounded-lg border border-dsb-accent/40 bg-dsb-accent/10 px-4 py-2 text-sm font-semibold text-dsb-accent transition-all duration-300 group-hover:bg-dsb-accent group-hover:text-black dark:border-dsb-accent/30 dark:bg-dsb-accent/15">
                      Go to community
                      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" />
                      </svg>
                    </span>
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
