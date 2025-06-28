
import { MessageSquare, Instagram, Send, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface CommunityPlatform {
  name: string;
  icon: React.ReactNode;
  description: string;
  buttonText: string;
  buttonColor: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  imagePath?: string;
}

const Community = () => {
  const communityPlatforms: CommunityPlatform[] = [
    {
      name: "WhatsApp Group",
      icon: <MessageSquare className="size-8 text-dsb-accent" />,
      description: "Join our WhatsApp group for quick updates and casual discussions",
      buttonText: "Join Group",
      buttonColor: "bg-dsb-accent hover:bg-dsb-accentDark"
    },
    {
      name: "Instagram",
      icon: <Instagram className="size-8 text-dsb-accent" />,
      description: "Follow us on Instagram for game highlights and community events",
      buttonText: "Follow",
      buttonColor: "bg-gradient-to-r from-dsb-accent to-dsb-accentDark hover:from-dsb-accentDark hover:to-dsb-accent"
    },
    {
      name: "Discord Server",
      icon: <Send className="size-8 text-dsb-accent transform rotate-315" />,
      description: "Join our Discord server for tournaments, voice chat, and more",
      buttonText: "Join Server",
      buttonColor: "bg-dsb-accent hover:bg-dsb-accentDark"
    }
  ];

  const articles: Article[] = [
    {
      id: 1,
      title: "Getting Started with Bullet Surge",
      description: "Learn the basics of the game and advanced strategies to improve your ranking.",
      author: "Game Master",
      date: "Feb 20, 2025",
      imagePath: "/lovable-uploads/771f30e1-5951-4e1e-acf4-5c6f75ff2a16.png"
    },
    {
      id: 2,
      title: "Weekly Tournament Results",
      description: "Check out the results from our latest tournament and see who claimed the top spots.",
      author: "Tournament Admin",
      date: "Feb 18, 2025",
      imagePath: "/lovable-uploads/5da75579-71d3-4038-8c1b-f8c3f7dd2d59.png"
    },
    {
      id: 3,
      title: "Community Spotlight: Meet the Champions",
      description: "Interview with top-ranked players sharing their journey and tips for success.",
      author: "Community Manager",
      date: "Feb 15, 2025",
      imagePath: "/lovable-uploads/fecb1fee-7a86-4dae-8def-e491551241de.png"
    }
  ];

  const renderArticleImage = (article: Article) => {
    if (article.imagePath) {
      return (
        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
          <img 
            src={article.imagePath}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 h-screen overflow-y-auto scrollbar-thin">
        <h1 className="text-3xl font-bold text-dsb-accent mb-6 glow-text">Community</h1>
        
        <section className="mt-8">
          <h2 className="text-2xl text-white mb-6 font-medium">Join Our Communities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityPlatforms.map((platform, index) => (
              <Card key={index} className="group transition-all duration-300 backdrop-blur-lg hover:border-dsb-accent/40">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="size-16 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm mb-4 border border-dsb-accent/30 relative overflow-hidden group-hover:border-dsb-accent/50 transition-all duration-300">
                      {platform.icon}
                      
                      {/* Inner glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-dsb-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Pulsing effect */}
                      <div className="absolute inset-0 rounded-full bg-dsb-accent/10 animate-pulse-subtle"></div>
                    </div>
                    
                    <h3 className="text-lg font-medium text-dsb-accent mb-2">{platform.name}</h3>
                    <p className="text-dsb-neutral1 mb-6 text-sm">{platform.description}</p>
                    
                    <Button 
                      className={cn(
                        "w-full relative overflow-hidden", 
                        platform.buttonColor
                      )}
                    >
                      <span className="relative z-10">{platform.buttonText}</span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="mt-12">
          <h2 className="text-2xl text-white mb-6 font-medium">Latest Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(article => (
              <Card key={article.id} className="group transition-all duration-300 hover:border-dsb-accent/40">
                {renderArticleImage(article)}
                
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-dsb-accent mb-2 group-hover:text-dsb-accentLight transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-dsb-neutral1 mb-4 text-sm line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-dsb-neutral1">
                      <span>By {article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{article.date}</span>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-dsb-accent p-0 hover:bg-transparent hover:text-dsb-accentLight relative overflow-hidden group">
                      <span className="relative z-10">Read More</span>
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-dsb-accent group-hover:w-full transition-all duration-300"></div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="bg-dsb-neutral3/20 border-dsb-neutral3 text-dsb-accent hover:text-white hover:border-dsb-accent/50 relative overflow-hidden group">
              <span className="relative z-10">View All Articles</span>
              <ChevronRight className="ml-1 size-4 relative z-10" />
              <div className="absolute inset-0 bg-dsb-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        </section>
        
        <section className="mt-12 mb-8">
          <Card className="hover:border-dsb-accent/40 transition-all duration-300">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl text-dsb-accent mb-4 font-medium">Community Guidelines</h2>
              
              <p className="text-dsb-neutral1 leading-relaxed">
                Our community thrives on respect and good sportsmanship. We encourage friendly competition, 
                knowledge sharing, and helping fellow players improve their skills. Please keep all interactions 
                positive and report any behavior that violates our guidelines to moderators.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Community;
