
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFollow } from "@/hooks/useFollow";
import { FollowCounts } from "@/types/follow";

export interface ProfileData {
  username: string | null;
  avatar_url: string | null;
}

export function useProfileData(userId: string | null | undefined) {
  const { getFollowCounts } = useFollow();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Clear state when userId changes
    setProfileData(null);
    setLoadingProfile(true);
    setError(null);
    
    // If we don't have a userId, there's nothing to fetch
    if (!userId) {
      console.log("No user ID provided for profile data");
      setLoadingProfile(false);
      return;
    }
    
    console.log("Fetching profile data for user:", userId);
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          setError(error);
          setLoadingProfile(false);
          return;
        }
        
        console.log("Profile data fetched:", data);
        
        setProfileData(data);
        setProfileUserId(userId);
        
        // Also fetch follow counts
        try {
          const counts = await getFollowCounts(userId);
          setFollowCounts(counts);
        } catch (followError) {
          console.error("Error fetching follow counts:", followError);
        }
        
        setLoadingProfile(false);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error);
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [userId, getFollowCounts]);

  return {
    profileData,
    profileUserId,
    followCounts,
    loadingProfile,
    error
  };
}
