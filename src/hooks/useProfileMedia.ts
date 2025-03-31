
import { useState, useEffect, useRef } from "react";
import { MediaItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { transformDbItemToMediaItem } from "@/utils/mediaUtils";

export function useProfileMedia(displayUserId: string | null | undefined, isCurrentUserProfile: boolean) {
  const [profileMedia, setProfileMedia] = useState<{
    all: MediaItem[],
    movie: MediaItem[],
    tv: MediaItem[],
    book: MediaItem[],
  }>({
    all: [],
    movie: [],
    tv: [],
    book: [],
  });
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedUserId = useRef<string | null | undefined>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Skip re-fetching if userId hasn't changed and we've already fetched once
    if (displayUserId === lastFetchedUserId.current && lastFetchedUserId.current !== null) {
      return;
    }
    
    const fetchProfileMedia = async () => {
      // Reset loading state for new user
      if (displayUserId !== lastFetchedUserId.current) {
        setLoadingMedia(true);
      }
      
      if (!displayUserId) {
        if (isMounted) {
          setLoadingMedia(false);
        }
        return;
      }
      
      // Don't fetch directly if it's the current user's profile
      // as we'll use the MediaContext data instead
      if (isCurrentUserProfile) {
        if (isMounted) {
          setLoadingMedia(false);
        }
        return;
      }
      
      setError(null);
      
      try {
        console.log("Fetching profile media for user:", displayUserId);
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          if (isMounted) {
            setError(error);
          }
          return;
        }
        
        if (data && isMounted) {
          console.log("Fetched media items:", data.length);
          // Use the utility function to transform database items to MediaItem type
          const transformedData = data.map(item => transformDbItemToMediaItem(item));
          
          const movies = transformedData.filter(item => item.type === 'movie');
          const tvShows = transformedData.filter(item => item.type === 'tv');
          const books = transformedData.filter(item => item.type === 'book');
          
          setProfileMedia({
            all: transformedData.sort((a, b) => 
              new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
            ),
            movie: movies,
            tv: tvShows,
            book: books,
          });
          
          lastFetchedUserId.current = displayUserId;
        }
      } catch (error: any) {
        console.error("Error fetching profile media:", error);
        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setLoadingMedia(false);
        }
      }
    };
    
    fetchProfileMedia();
    
    return () => {
      isMounted = false;
    };
  }, [displayUserId, isCurrentUserProfile]);

  return {
    profileMedia,
    loadingMedia,
    error
  };
}
