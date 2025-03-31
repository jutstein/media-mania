
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFollow, FollowCounts } from "@/hooks/useFollow";
import FollowButton from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Share, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profileData: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  displayName: string;
  displayUserId: string | null;
  isCurrentUserProfile: boolean;
  followCounts: FollowCounts;
  mediaCount: number;
  onOpenFollowModal: (tab: 'followers' | 'following') => void;
}

const ProfileHeader = ({
  profileData,
  displayName,
  displayUserId,
  isCurrentUserProfile,
  followCounts,
  mediaCount,
  onOpenFollowModal
}: ProfileHeaderProps) => {
  const handleShare = () => {
    // Create a proper shareable URL with the full path to the profile
    let shareableUrl = '';
    
    if (isCurrentUserProfile) {
      // If it's the current user's profile, create a link using their userId
      shareableUrl = displayUserId ? 
        `${window.location.origin}/profile/${displayUserId}` : 
        `${window.location.origin}/profile`;
    } else {
      // If viewing someone else's profile, use the current URL
      shareableUrl = window.location.href;
    }
    
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Profile link copied to clipboard!");
  };

  return (
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
        
        {!isCurrentUserProfile && displayUserId && (
          <div className="absolute -bottom-3 right-0">
            <FollowButton userId={displayUserId} />
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayName}</h1>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
          <button 
            onClick={() => onOpenFollowModal('followers')}
            className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
          >
            <span className="font-medium">{followCounts.followers}</span> Followers
          </button>
          <button 
            onClick={() => onOpenFollowModal('following')}
            className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
          >
            <span className="font-medium">{followCounts.following}</span> Following
          </button>
          <div className="bg-secondary rounded-full px-3 py-1 text-sm text-muted-foreground">
            <span className="font-medium">{mediaCount}</span> Items
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {isCurrentUserProfile && (
            <>
              <Button asChild size="sm">
                <Link to="/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/profile/edit">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
