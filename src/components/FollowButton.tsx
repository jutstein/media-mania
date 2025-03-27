
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton = ({ 
  userId, 
  variant = 'outline', 
  size = 'sm',
  className = '',
  onFollowChange
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, checkIsFollowing, isLoading: followLoading } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Don't show follow button for own profile
  const isOwnProfile = user?.id === userId;
  
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || isOwnProfile) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const following = await checkIsFollowing(userId);
      setIsFollowing(following);
      setIsLoading(false);
    };
    
    checkFollowStatus();
  }, [user, userId, isOwnProfile]);
  
  const handleToggleFollow = async () => {
    if (!user) return;
    
    let success;
    if (isFollowing) {
      success = await unfollowUser(userId);
    } else {
      success = await followUser(userId);
    }
    
    if (success) {
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    }
  };
  
  if (isOwnProfile || !user) return null;
  
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={followLoading}
      className={className}
    >
      {followLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
