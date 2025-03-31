
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchProfileMedia = async () => {
      // If this is the current user's profile, we don't need to fetch media
      // as it will be provided via MediaContext
      if (isCurrentUserProfile) {
        setLoadingMedia(false);
        return;
      }
      
      // Skip if we don't have a user ID to fetch
      if (!displayUserId) {
        setLoadingMedia(false);
        return;
      }
      
      // Skip if we've already fetched this user's media
      if (displayUserId === lastFetchedUserId.current) {
        return;
      }
      
      setLoadingMedia(true);
      setError(null);
      
      try {
        console.log("Fetching profile media for user:", displayUserId);
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          if (isMountedRef.current) {
            setError(error);
          }
          return;
        }
        
        if (data && isMountedRef.current) {
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
        if (isMountedRef.current) {
          setError(error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingMedia(false);
        }
      }
    };
    
    fetchProfileMedia();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [displayUserId, isCurrentUserProfile]);

  return {
    profileMedia,
    loadingMedia,
    error
  };
}
