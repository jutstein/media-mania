
import { MediaType } from "@/types";
import { MediaItem } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import MediaCard from "@/components/MediaCard";

interface ProfileMediaTabsProps {
  activeTab: MediaType | "all";
  setActiveTab: (tab: MediaType | "all") => void;
  mediaCount: {
    all: number;
    movie: number;
    tv: number;
    book: number;
  };
  filteredMedia: {
    all: MediaItem[];
    movie: MediaItem[];
    tv: MediaItem[];
    book: MediaItem[];
  };
  isCurrentUserProfile: boolean;
}

const ProfileMediaTabs = ({
  activeTab,
  setActiveTab,
  mediaCount,
  filteredMedia,
  isCurrentUserProfile
}: ProfileMediaTabsProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as MediaType | "all")}>
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            All
            <span className="ml-1 text-xs bg-secondary/80 px-1.5 rounded-full">
              {mediaCount.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="movie" className="flex items-center gap-1.5">
            <Film className="h-4 w-4" />
            Movies
            <span className="ml-1 text-xs bg-secondary/80 px-1.5 rounded-full">
              {mediaCount.movie}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tv" className="flex items-center gap-1.5">
            <Tv className="h-4 w-4" />
            TV Shows
            <span className="ml-1 text-xs bg-secondary/80 px-1.5 rounded-full">
              {mediaCount.tv}
            </span>
          </TabsTrigger>
          <TabsTrigger value="book" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Books
            <span className="ml-1 text-xs bg-secondary/80 px-1.5 rounded-full">
              {mediaCount.book}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      {Object.entries(filteredMedia).map(([tab, items]) => (
        <TabsContent key={tab} value={tab} className="mt-0">
          {items.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            >
              {items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <MediaCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {tab === "all"
                  ? (isCurrentUserProfile ? "Your collection is empty." : "This user hasn't added any items yet.")
                  : (isCurrentUserProfile 
                      ? `You haven't added any ${tab === "movie" ? "movies" : tab === "tv" ? "TV shows" : "books"} yet.`
                      : `This user hasn't added any ${tab === "movie" ? "movies" : tab === "tv" ? "TV shows" : "books"} yet.`)}
              </p>
              {isCurrentUserProfile && (
                <Button asChild>
                  <Link to="/add">Add Your First Item</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ProfileMediaTabs;
