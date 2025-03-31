
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MediaType, Season } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMediaTabs from "@/components/profile/ProfileMediaTabs";
import FollowersModal from "@/components/FollowersModal";
import { transformDbItemToMediaItem } from "@/utils/mediaUtils";
import type { FollowCounts } from "@/types/follow";
import { MediaItem } from "@/types";

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
  const [profileMedia, setProfileMedia] = useState<{
    all: MediaItem[],
    movie: MediaItem[],
    tv: MediaItem[],
    book: MediaItem[],
  }>({
    all: [],
    movie: [],
    tv: [],
    book: [],
  });
  const [loadingMedia, setLoadingMedia] = useState(false);
  
  // Determine if this is the current user's profile or someone else's
  const isCurrentUserProfile = !userId || (user && userId === user.id);
  const displayUserId = isCurrentUserProfile ? user?.id : userId;

  // Load profile media items when viewing another user's profile
  useEffect(() => {
    const fetchProfileMedia = async () => {
      if (!displayUserId) return;
      
      // Don't fetch directly if it's the current user's profile
      if (isCurrentUserProfile && user) {
        return; // We'll use the MediaContext data instead
      }
      
      setLoadingMedia(true);
      try {
        console.log("Fetching profile media for user:", displayUserId);
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          throw error;
        }
        
        if (data) {
          console.log("Fetched media items:", data.length);
          // Use the utility function to transform database items to MediaItem type
          const transformedData = data.map(item => transformDbItemToMediaItem(item));
          
          const movies = transformedData.filter(item => item.type === 'movie');
          const tvShows = transformedData.filter(item => item.type === 'tv');
          const books = transformedData.filter(item => item.type === 'book');
          
          setProfileMedia({
            all: transformedData.sort((a, b) => 
              new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
            ),
            movie: movies,
            tv: tvShows,
            book: books,
          });
        }
      } catch (error) {
        console.error("Error fetching profile media:", error);
      } finally {
        setLoadingMedia(false);
      }
    };
    
    fetchProfileMedia();
  }, [displayUserId, isCurrentUserProfile, user]);
  
  // Effect to load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!displayUserId) return;
      
      setLoadingProfile(true);
      try {
        console.log("Fetching profile data for user:", displayUserId);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', displayUserId)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("Profile data fetched:", data);
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
  }, [displayUserId, user, getFollowCounts]);
  
  // Effect to load media items if viewing current user's profile
  useEffect(() => {
    if (isCurrentUserProfile && user?.id) {
      console.log("Loading media items for current user:", user.id);
      // Only load from MediaContext if it's the current user
      loadMediaItems(user.id);
    }
  }, [isCurrentUserProfile, user?.id, loadMediaItems]);
  
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

  const mediaData = isCurrentUserProfile ? {
    all: movies.length + tvShows.length + books.length,
    movie: movies.length,
    tv: tvShows.length,
    book: books.length,
  } : {
    all: profileMedia.all.length,
    movie: profileMedia.movie.length,
    tv: profileMedia.tv.length,
    book: profileMedia.book.length,
  };

  const mediaItems = isCurrentUserProfile ? {
    all: [...movies, ...tvShows, ...books].sort(
      (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    ),
    movie: movies,
    tv: tvShows,
    book: books,
  } : profileMedia;

  const handleOpenFollowModal = (tab: 'followers' | 'following') => {
    setFollowModalTab(tab);
    setIsFollowModalOpen(true);
  };

  if (isLoading || loadingProfile || (loadingMedia && !isCurrentUserProfile)) {
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
        <ProfileHeader 
          profileData={profileData}
          displayName={displayName || "User"}
          displayUserId={displayUserId}
          isCurrentUserProfile={isCurrentUserProfile}
          followCounts={followCounts}
          mediaCount={mediaData.all}
          onOpenFollowModal={handleOpenFollowModal}
        />

        <ProfileMediaTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mediaCount={mediaData}
          filteredMedia={mediaItems}
          isCurrentUserProfile={isCurrentUserProfile}
        />
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
