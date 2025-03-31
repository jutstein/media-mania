
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { MediaType } from "@/types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileMediaTabs from "@/components/profile/ProfileMediaTabs";
import FollowersModal from "@/components/FollowersModal";
import ProfileLoading from "@/components/profile/ProfileLoading";
import LoginPrompt from "@/components/profile/LoginPrompt";
import { useProfileData } from "@/hooks/useProfileData";
import { useProfileMedia } from "@/hooks/useProfileMedia";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { movies, tvShows, books, isLoading, loadMediaItems } = useMedia();
  
  const [activeTab, setActiveTab] = useState<MediaType | "all">("all");
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  
  // Determine if this is the current user's profile or someone else's
  const isCurrentUserProfile = !userId || (user && userId === user.id);
  const displayUserId = isCurrentUserProfile ? user?.id : userId;

  // Use custom hooks to load profile data
  const { profileData, profileUserId, followCounts, loadingProfile } = useProfileData(displayUserId);
  const { profileMedia, loadingMedia } = useProfileMedia(displayUserId, isCurrentUserProfile);

  // Memoize the loadMediaItems function to prevent infinite calls
  const loadUserMedia = useCallback(() => {
    if (isCurrentUserProfile && user?.id) {
      console.log("Loading media items for current user:", user.id);
      loadMediaItems(user.id);
    }
  }, [isCurrentUserProfile, user, loadMediaItems]);

  // Effect to load media items if viewing current user's profile
  useEffect(() => {
    loadUserMedia();
  }, [loadUserMedia]);
  
  if (!user && isCurrentUserProfile) {
    return <LoginPrompt />;
  }

  // Display loading state
  if ((isLoading && isCurrentUserProfile) || loadingProfile || (loadingMedia && !isCurrentUserProfile)) {
    return <ProfileLoading />;
  }

  // Display username with fallbacks
  const displayName = profileData?.username || 
                     (isCurrentUserProfile ? user?.email?.split('@')[0] : 'User');

  // Prepare media data
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
