
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileWithFollow, useFollow } from '@/hooks/useFollow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface FollowersModalProps {
  userId: string;
  username?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'followers' | 'following';
}

const FollowersModal = ({
  userId,
  username = 'User',
  isOpen,
  onOpenChange,
  initialTab = 'followers'
}: FollowersModalProps) => {
  const { user } = useAuth();
  const { getFollowList, followUser, unfollowUser } = useFollow();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<ProfileWithFollow[]>([]);
  const [following, setFollowing] = useState<ProfileWithFollow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      loadFollowData();
    }
  }, [isOpen, activeTab, userId]);
  
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
      console.error('Error loading follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollowToggle = async (targetId: string, currentlyFollowing: boolean) => {
    if (!user) return;
    
    const success = currentlyFollowing
      ? await unfollowUser(targetId)
      : await followUser(targetId);
      
    if (success) {
      // Update the UI
      if (activeTab === 'followers') {
        setFollowers(prev => 
          prev.map(profile => 
            profile.id === targetId 
              ? { ...profile, isFollowing: !currentlyFollowing }
              : profile
          )
        );
      } else {
        setFollowing(prev => 
          prev.map(profile => 
            profile.id === targetId 
              ? { ...profile, isFollowing: !currentlyFollowing }
              : profile
          )
        );
      }
    }
  };
  
  const displayProfiles = activeTab === 'followers' ? followers : following;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{username}'s network</DialogTitle>
          <DialogDescription>
            View and manage followers and following relationships.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue={initialTab} 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
                {followers.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between">
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || ""} />
                        <AvatarFallback>
                          {profile.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username || "User"}</p>
                      </div>
                    </Link>
                    
                    {user && user.id !== profile.id && (
                      <Button
                        variant={profile.isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFollowToggle(profile.id, profile.isFollowing)}
                      >
                        {profile.isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-1" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="min-h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
                {following.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between">
                    <Link to={`/profile/${profile.id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || ""} />
                        <AvatarFallback>
                          {profile.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.username || "User"}</p>
                      </div>
                    </Link>
                    
                    {user && user.id !== profile.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFollowToggle(profile.id, true)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Unfollow
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
