
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Share, Film, Tv, BookOpen, Loader2 } from "lucide-react";
import { MediaType } from "@/types";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const { movies, tvShows, books, isLoading } = useMedia();
  const [activeTab, setActiveTab] = useState<MediaType | "all">("all");
  
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const mediaCount = {
    all: movies.length + tvShows.length + books.length,
    movie: movies.length,
    tv: tvShows.length,
    book: books.length,
  };

  const filteredMedia = {
    all: [...movies, ...tvShows, ...books].sort(
      (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    ),
    movie: movies,
    tv: tvShows,
    book: books,
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <h2 className="text-xl">Loading your media collection...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-morph rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6"
        >
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src="" alt={user.email || ''} />
            <AvatarFallback className="text-2xl">{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.email}</h1>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
              <div className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground">
                <span className="font-medium">{mediaCount.movie}</span> Movies
              </div>
              <div className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground">
                <span className="font-medium">{mediaCount.tv}</span> TV Shows
              </div>
              <div className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground">
                <span className="font-medium">{mediaCount.book}</span> Books
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button asChild size="sm">
                <Link to="/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share Profile
              </Button>
            </div>
          </div>
        </motion.div>

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
                      ? "Your collection is empty."
                      : `You haven't added any ${
                          tab === "movie" ? "movies" : tab === "tv" ? "TV shows" : "books"
                        } yet.`}
                  </p>
                  <Button asChild>
                    <Link to="/add">Add Your First Item</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
