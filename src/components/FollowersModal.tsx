
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
import { Loader2, UserPlus, UserMinus, User, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileWithFollow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
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
      } else if (activeTab === 'following') {
        setFollowing(prev => 
          prev.map(profile => 
            profile.id === targetId 
              ? { ...profile, isFollowing: !currentlyFollowing }
              : profile
          )
        );
      } else if (isSearching) {
        setSearchResults(prev => 
          prev.map(profile => 
            profile.id === targetId 
              ? { ...profile, isFollowing: !currentlyFollowing }
              : profile
          )
        );
      }
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    
    try {
      // Search users by username
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(20);

      if (error) throw error;

      if (profiles && profiles.length > 0 && user) {
        // Check if current user is following these profiles
        const currentUser = user;
        
        // For each profile, check if the user is following them
        const profilesWithFollow = await Promise.all(
          profiles.map(async (profile) => {
            const { data } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', currentUser.id)
              .eq('following_id', profile.id)
              .maybeSingle();
              
            return {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              isFollowing: !!data
            };
          })
        );

        setSearchResults(profilesWithFollow);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);
  
  const displayProfiles = isSearching 
    ? searchResults 
    : activeTab === 'followers' 
      ? followers 
      : following;

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'followers' | 'following');
    setSearchQuery('');
    setIsSearching(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{username}'s network</DialogTitle>
          <DialogDescription>
            View and manage followers and following relationships.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {!isSearching && (
          <Tabs 
            defaultValue={initialTab} 
            value={activeTab} 
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="followers" className="min-h-[300px]">
              {renderProfilesList()}
            </TabsContent>
            
            <TabsContent value="following" className="min-h-[300px]">
              {renderProfilesList()}
            </TabsContent>
          </Tabs>
        )}
        
        {isSearching && (
          <div className="min-h-[300px]">
            <h3 className="mb-4 font-medium">Search Results</h3>
            {renderProfilesList()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  function renderProfilesList() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (displayProfiles.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isSearching ? "No users found" : activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
        {displayProfiles.map(profile => (
          <div key={profile.id} className="flex items-center justify-between">
            <Link 
              to={`/profile/${profile.id}`} 
              className="flex items-center gap-3"
              onClick={() => onOpenChange(false)} // Close modal when navigating
            >
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
    );
  }
};

export default FollowersModal;
