
import { supabase } from '@/integrations/supabase/client';
import { ProfileWithFollow } from '@/types/follow';

export async function checkIsFollowing(targetUserId: string): Promise<boolean> {
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
}

export async function getFollowCounts(userId: string) {
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
}

export async function createFollow(followerId: string, targetUserId: string) {
  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: targetUserId
      } as any);
    
    return { error };
  } catch (error) {
    return { error };
  }
}

export async function deleteFollow(followerId: string, targetUserId: string) {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', targetUserId);
    
    return { error };
  } catch (error) {
    return { error };
  }
}

export async function fetchFollowList(userId: string, type: 'followers' | 'following') {
  try {
    if (type === 'followers') {
      // Get users who follow the specified user - use two separate queries instead of joins
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
      
      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return { data: [], error: null };
      
      const followerIds = followsData.map(item => item.follower_id);
      
      // Now get the profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followerIds);
      
      if (profilesError) throw profilesError;
      
      // Combine the data
      const data = profilesData.map(profile => ({
        follower_id: profile.id,
        profiles: profile
      }));
      
      return { data, error: null };
    } else {
      // Get users whom the specified user follows - use two separate queries
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      if (followsError) throw followsError;
      if (!followsData || followsData.length === 0) return { data: [], error: null };
      
      const followingIds = followsData.map(item => item.following_id);
      
      // Now get the profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);
      
      if (profilesError) throw profilesError;
      
      // Combine the data
      const data = profilesData.map(profile => ({
        following_id: profile.id,
        profiles: profile
      }));
      
      return { data, error: null };
    }
  } catch (error) {
    console.error(`Error in fetchFollowList (${type}):`, error);
    return { data: null, error };
  }
}

export async function transformFollowData(data: any[], type: 'followers' | 'following') {
  if (!data || data.length === 0) return [];
  
  const currentUserId = (await supabase.auth.getUser()).data.user?.id;
  
  // Transform data to ProfileWithFollow format
  const profiles = await Promise.all(data.map(async (item: any) => {
    const profile = item.profiles;
    const profileId = type === 'followers' 
      ? item.follower_id 
      : item.following_id;
      
    let isFollowing = false;
    if (currentUserId) {
      isFollowing = await checkIsFollowing(profileId);
    }
    
    return {
      id: profileId,
      username: profile.username || "No Username", // Ensure there's always a username
      avatar_url: profile.avatar_url,
      isFollowing
    };
  }));
  
  return profiles;
}
