
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFollow, ProfileWithFollow } from "@/hooks/useFollow";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface FollowersModalProps {
  userId: string;
  username: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'followers' | 'following';
}

const FollowersModal = ({
  userId,
  username,
  isOpen,
  onOpenChange,
  initialTab = 'followers'
}: FollowersModalProps) => {
  const { getFollowList, followUser, unfollowUser, isLoading: followActionLoading } = useFollow();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<ProfileWithFollow[]>([]);
  const [following, setFollowing] = useState<ProfileWithFollow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load followers and following lists
  useEffect(() => {
    if (isOpen) {
      loadFollowData();
    }
  }, [isOpen, userId, activeTab]);

  const loadFollowData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'followers') {
        const followersList = await getFollowList(userId, 'followers');
        setFollowers(followersList);
      } else {
        const followingList = await getFollowList(userId, 'following');
        setFollowing(followingList);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (profileId: string) => {
    setActionInProgress(profileId);
    const success = await followUser(profileId);
    if (success) {
      // Update followers list with the new status
      if (activeTab === 'followers') {
        setFollowers(followers.map(follower => 
          follower.id === profileId ? { ...follower, isFollowing: true } : follower
        ));
      } else {
        setFollowing(following.map(follow => 
          follow.id === profileId ? { ...follow, isFollowing: true } : follow
        ));
      }
    }
    setActionInProgress(null);
  };

  const handleUnfollow = async (profileId: string) => {
    setActionInProgress(profileId);
    const success = await unfollowUser(profileId);
    if (success) {
      // Update followers list with the new status
      if (activeTab === 'followers') {
        setFollowers(followers.map(follower => 
          follower.id === profileId ? { ...follower, isFollowing: false } : follower
        ));
      } else {
        setFollowing(following.map(follow => 
          follow.id === profileId ? { ...follow, isFollowing: false } : follow
        ));
      }
    }
    setActionInProgress(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'followers' | 'following');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {username}'s Connections
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="focus:outline-none">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {followers.map(profile => (
                  <div 
                    key={profile.id} 
                    className="flex items-center justify-between py-2"
                  >
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3 flex-1">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                        <AvatarFallback className="text-sm">
                          {profile.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username || "No Username"}</p>
                      </div>
                    </Link>
                    
                    {/* Only show follow buttons for other users */}
                    {profile.id !== userId && (
                      profile.isFollowing ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUnfollow(profile.id)}
                          disabled={actionInProgress === profile.id || followActionLoading}
                        >
                          {actionInProgress === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <UserCheck className="h-4 w-4 mr-1" />
                          )}
                          Following
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleFollow(profile.id)}
                          disabled={actionInProgress === profile.id || followActionLoading}
                        >
                          {actionInProgress === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <UserPlus className="h-4 w-4 mr-1" />
                          )}
                          Follow
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No followers yet
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="focus:outline-none">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {following.map(profile => (
                  <div 
                    key={profile.id} 
                    className="flex items-center justify-between py-2"
                  >
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3 flex-1">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                        <AvatarFallback className="text-sm">
                          {profile.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username || "No Username"}</p>
                      </div>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnfollow(profile.id)}
                      disabled={actionInProgress === profile.id || followActionLoading}
                    >
                      {actionInProgress === profile.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <UserCheck className="h-4 w-4 mr-1" />
                      )}
                      Following
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Not following anyone yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
