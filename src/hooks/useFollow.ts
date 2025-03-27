
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FollowCounts {
  followers: number;
  following: number;
}

export interface ProfileWithFollow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
}

export const useFollow = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if current user is following another user
  const checkIsFollowing = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', (await supabase.auth.getUser()).data.user?.id || '')
        .eq('following_id', targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };
  
  // Get follow counts for a user
  const getFollowCounts = async (userId: string): Promise<FollowCounts> => {
    try {
      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);
      
      if (followersError) throw followersError;
      
      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);
      
      if (followingError) throw followingError;
      
      return {
        followers: followersCount || 0,
        following: followingCount || 0
      };
    } catch (error) {
      console.error('Error getting follow counts:', error);
      return { followers: 0, following: 0 };
    }
  };
  
  // Follow a user
  const followUser = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error('You need to be logged in to follow users');
        return false;
      }
      
      // Don't allow following yourself
      if (currentUser.id === targetUserId) {
        toast.error('You cannot follow yourself');
        return false;
      }
      
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: targetUserId
        } as any);
      
      if (error) {
        // If unique constraint violation, user is already following
        if (error.code === '23505') {
          toast.info('You are already following this user');
          return true;
        }
        throw error;
      }
      
      toast.success('Started following user');
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Unfollow a user
  const unfollowUser = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error('You need to be logged in to unfollow users');
        return false;
      }
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetUserId);
      
      if (error) throw error;
      
      toast.success('Stopped following user');
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get followers or following list
  const getFollowList = async (userId: string, type: 'followers' | 'following'): Promise<ProfileWithFollow[]> => {
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      let query;
      
      if (type === 'followers') {
        // Get users who follow the specified user
        query = supabase
          .from('follows')
          .select(`
            follower_id,
            profiles!follows_follower_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('following_id', userId);
      } else {
        // Get users whom the specified user follows
        query = supabase
          .from('follows')
          .select(`
            following_id,
            profiles!follows_following_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('follower_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Transform data to ProfileWithFollow format
      const profiles = await Promise.all(data.map(async (item: any) => {
        const profile = type === 'followers' 
          ? item.profiles 
          : item.profiles;
          
        const profileId = type === 'followers' 
          ? item.follower_id 
          : item.following_id;
          
        let isFollowing = false;
        if (currentUserId) {
          isFollowing = await checkIsFollowing(profileId);
        }
        
        return {
          id: profileId,
          username: profile.username,
          avatar_url: profile.avatar_url,
          isFollowing
        };
      }));
      
      return profiles;
    } catch (error) {
      console.error(`Error getting ${type}:`, error);
      return [];
    }
  };
  
  return {
    isLoading,
    followUser,
    unfollowUser,
    checkIsFollowing,
    getFollowCounts,
    getFollowList
  };
};
