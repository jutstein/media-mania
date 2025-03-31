
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
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    const fetchProfileMedia = async () => {
      if (!displayUserId) return;
      
      // Don't fetch directly if it's the current user's profile
      // as we'll use the MediaContext data instead
      if (isCurrentUserProfile) {
        return;
      }
      
      setLoadingMedia(true);
      try {
        console.log("Fetching profile media for user:", displayUserId);
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', displayUserId);
          
        if (error) {
          console.error("Error fetching profile media:", error);
          throw error;
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
        }
      } catch (error) {
        console.error("Error fetching profile media:", error);
      } finally {
        setLoadingMedia(false);
      }
    };
    
    fetchProfileMedia();
  }, [displayUserId, isCurrentUserProfile]);

  return {
    profileMedia,
    loadingMedia
  };
}
