
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Reset state when userId changes
    setProfileMedia({
      all: [],
      movie: [],
      tv: [],
      book: [],
    });
    setLoadingMedia(true);
    setError(null);
    
    const fetchProfileMedia = async () => {
      // If no user ID is provided, set loading to false and return
      if (!displayUserId) {
        console.log("No user ID provided for media");
        setLoadingMedia(false);
        return;
      }

      // Only skip fetching if this is the current user's profile
      // For other users, we should always fetch their media directly
      if (isCurrentUserProfile) {
        console.log("Current user profile, skipping direct media fetch");
        setLoadingMedia(false);
        return;
      }
      
      console.log("Fetching profile media for user:", displayUserId);
      
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          setError(error);
          setLoadingMedia(false);
          return;
        }
        
        if (data) {
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
          
          setLoadingMedia(false);
        }
      } catch (error: any) {
        console.error("Error fetching profile media:", error);
        setError(error);
        setLoadingMedia(false);
      }
    };
    
    fetchProfileMedia();
  }, [displayUserId, isCurrentUserProfile]);

  return {
    profileMedia,
    loadingMedia,
    error
  };
}
