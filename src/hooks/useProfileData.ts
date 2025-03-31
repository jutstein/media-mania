
import { useState, useEffect, useRef } from "react";
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
  
  // Use a ref to track component mount state
  const isMounted = useRef(true);
  // Use a ref to track if we've already fetched data
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    // If we don't have a userId, there's nothing to fetch
    if (!userId) {
      console.log("No user ID provided for profile data");
      setLoadingProfile(false);
      return;
    }
    
    // If we've already fetched this user's data and it matches our state, don't fetch again
    if (hasFetched.current && userId === profileUserId && profileData) {
      console.log("Already fetched profile data for", userId);
      setLoadingProfile(false);
      return;
    }
    
    const fetchProfile = async () => {
      console.log("Fetching profile data for user:", userId);
      setLoadingProfile(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching profile:", error);
          if (isMounted.current) {
            setError(error);
            setLoadingProfile(false);
          }
          return;
        }
        
        console.log("Profile data fetched:", data);
        
        if (isMounted.current) {
          setProfileData(data);
          setProfileUserId(userId);
          hasFetched.current = true;
          
          // Also fetch follow counts
          try {
            const counts = await getFollowCounts(userId);
            if (isMounted.current) {
              setFollowCounts(counts);
            }
          } catch (followError) {
            console.error("Error fetching follow counts:", followError);
          }
          
          if (isMounted.current) {
            setLoadingProfile(false);
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        if (isMounted.current) {
          setError(error);
          setLoadingProfile(false);
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted.current = false;
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
