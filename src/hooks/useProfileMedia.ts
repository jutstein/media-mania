
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
      try {
        // If no user ID is provided, set loading to false and return
        if (!displayUserId) {
          setLoadingMedia(false);
          return;
        }

        // Skip fetching if this is current user's profile as media comes from MediaContext
        if (isCurrentUserProfile) {
          setLoadingMedia(false);
          return;
        }
        
        // If we've already fetched this user's media and it's the same user, don't fetch again
        if (displayUserId === lastFetchedUserId.current && profileMedia.all.length > 0) {
          setLoadingMedia(false);
          return;
        }
        
        console.log("Fetching profile media for user:", displayUserId);
        setLoadingMedia(true);
        
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          if (isMountedRef.current) {
            setError(error);
            setLoadingMedia(false);
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
        
        if (isMountedRef.current) {
          setLoadingMedia(false);
        }
      } catch (error: any) {
        console.error("Error fetching profile media:", error);
        if (isMountedRef.current) {
          setError(error);
          setLoadingMedia(false);
        }
      }
    };
    
    fetchProfileMedia();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [displayUserId, isCurrentUserProfile, profileMedia.all.length]);

  return {
    profileMedia,
    loadingMedia,
    error
  };
}
