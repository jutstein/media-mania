
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
  const [loadingProfile, setLoadingProfile] = useState(true); // Start with loading true
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      if (!userId) {
        if (isMounted) {
          setLoadingProfile(false);
        }
        return;
      }
      
      setLoadingProfile(true);
      setError(null);
      
      try {
        console.log("Fetching profile data for user:", userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          if (isMounted) {
            setError(error);
          }
          return;
        }
        
        console.log("Profile data fetched:", data);
        
        if (isMounted) {
          setProfileData(data);
          setProfileUserId(userId);
          
          // Also fetch follow counts
          try {
            const counts = await getFollowCounts(userId);
            if (isMounted) {
              setFollowCounts(counts);
            }
          } catch (followError) {
            console.error("Error fetching follow counts:", followError);
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, [userId, getFollowCounts]);

  return {
    profileData,
    profileUserId,
    followCounts,
    loadingProfile,
    error
  };
}
