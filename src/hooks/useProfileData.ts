
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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      setLoadingProfile(true);
      try {
        console.log("Fetching profile data for user:", userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("Profile data fetched:", data);
        setProfileData(data);
        setProfileUserId(userId);
        
        // Also fetch follow counts
        const counts = await getFollowCounts(userId);
        setFollowCounts(counts);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [userId, getFollowCounts]);

  return {
    profileData,
    profileUserId,
    followCounts,
    loadingProfile
  };
}
