
import { useState } from 'react';
import { toast } from 'sonner';
import type { FollowCounts, ProfileWithFollow } from '@/types/follow';
import * as followService from '@/services/followService';

export type { FollowCounts, ProfileWithFollow };

export const useFollow = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if current user is following another user
  const checkIsFollowing = async (targetUserId: string) => {
    return followService.checkIsFollowing(targetUserId);
  };
  
  // Get follow counts for a user
  const getFollowCounts = async (userId: string): Promise<FollowCounts> => {
    return followService.getFollowCounts(userId);
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
      
      const { error } = await followService.createFollow(currentUser.id, targetUserId);
      
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
      
      const { error } = await followService.deleteFollow(currentUser.id, targetUserId);
      
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
      const { data, error } = await followService.fetchFollowList(userId, type);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      return followService.transformFollowData(data, type);
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

// Import supabase client inside the hook to avoid missing import
import { supabase } from '@/integrations/supabase/client';
