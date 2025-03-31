
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
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchProfileMedia = async () => {
      // If no user ID is provided, set loading to false and return
      if (!displayUserId) {
        console.log("No user ID provided for media");
        setLoadingMedia(false);
        return;
      }

      // Skip fetching if this is current user's profile as media comes from MediaContext
      if (isCurrentUserProfile) {
        console.log("Current user profile, skipping direct media fetch");
        setLoadingMedia(false);
        return;
      }
      
      // If we've already fetched this user's media, don't fetch again
      if (hasFetched.current && profileMedia.all.length > 0) {
        console.log("Already fetched media for this user");
        setLoadingMedia(false);
        return;
      }
      
      console.log("Fetching profile media for user:", displayUserId);
      setLoadingMedia(true);
      
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          if (isMounted.current) {
            setError(error);
            setLoadingMedia(false);
          }
          return;
        }
        
        if (data && isMounted.current) {
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
          
          hasFetched.current = true;
        }
        
        if (isMounted.current) {
          setLoadingMedia(false);
        }
      } catch (error: any) {
        console.error("Error fetching profile media:", error);
        if (isMounted.current) {
          setError(error);
          setLoadingMedia(false);
        }
      }
    };
    
    fetchProfileMedia();
    
    return () => {
      isMounted.current = false;
    };
  }, [displayUserId, isCurrentUserProfile]);

  return {
    profileMedia,
    loadingMedia,
    error
  };
}
