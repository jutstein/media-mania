
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { useFollow, FollowCounts } from "@/hooks/useFollow";
import MediaCard from "@/components/MediaCard";
import FollowButton from "@/components/FollowButton";
import FollowersModal from "@/components/FollowersModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Share, Film, Tv, BookOpen, Loader2, Users } from "lucide-react";
import { MediaType } from "@/types";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  username: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { movies, tvShows, books, isLoading, loadMediaItems } = useMedia();
  const { getFollowCounts } = useFollow();
  
  const [activeTab, setActiveTab] = useState<MediaType | "all">("all");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  
  // Determine if this is the current user's profile or someone else's
  const isCurrentUserProfile = !userId || (user && userId === user.id);
  const displayUserId = isCurrentUserProfile ? user?.id : userId;
  
  // Effect to load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!displayUserId) return;
      
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', displayUserId)
          .single();
          
        if (error) throw error;
        setProfileData(data);
        setProfileUserId(displayUserId);
        
        // Also fetch follow counts
        const counts = await getFollowCounts(displayUserId);
        setFollowCounts(counts);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [displayUserId, user]);
  
  // Effect to load media items if viewing another user's profile
  useEffect(() => {
    if (userId && userId !== user?.id) {
      // We need to load this user's media items
      loadMediaItems(userId);
    }
  }, [userId, user?.id]);
  
  if (!user && isCurrentUserProfile) {
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

  // Display username with fallbacks
  const displayName = profileData?.username || 
                     (isCurrentUserProfile ? user?.email?.split('@')[0] : 'User');

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

  const handleOpenFollowModal = (tab: 'followers' | 'following') => {
    setFollowModalTab(tab);
    setIsFollowModalOpen(true);
  };

  const handleShare = () => {
    const url = window.location.origin + (isCurrentUserProfile ? 
      `/profile/${user?.id}` : window.location.pathname);
    navigator.clipboard.writeText(url);
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

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <h2 className="text-xl">Loading profile...</h2>
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
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profileData?.avatar_url || ""} alt={displayName || ""} />
              <AvatarFallback className="text-2xl">{displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            
            {!isCurrentUserProfile && (
              <div className="absolute -bottom-3 right-0">
                <FollowButton userId={displayUserId || ""} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
              <button 
                onClick={() => handleOpenFollowModal('followers')}
                className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
              >
                <span className="font-medium">{followCounts.followers}</span> Followers
              </button>
              <button 
                onClick={() => handleOpenFollowModal('following')}
                className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
              >
                <span className="font-medium">{followCounts.following}</span> Following
              </button>
              <div className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground">
                <span className="font-medium">{mediaCount.all}</span> Items
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {isCurrentUserProfile && (
                <Button asChild size="sm">
                  <Link to="/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New
                  </Link>
                </Button>
              )}
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
      </div>
      
      {/* Followers/Following Modal */}
      <FollowersModal
        userId={profileUserId || ""}
        username={displayName || "User"}
        isOpen={isFollowModalOpen}
        onOpenChange={setIsFollowModalOpen}
        initialTab={followModalTab}
      />
    </div>
  );
};

export default Profile;
