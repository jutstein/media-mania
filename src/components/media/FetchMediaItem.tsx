
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaItem, MediaType } from "@/types";
import { transformDbItemToMediaItem } from "@/utils/mediaUtils";
import { useNavigate } from "react-router-dom";

interface FetchMediaItemProps {
  id: string | undefined;
  onMediaLoaded: (mediaItem: MediaItem) => void;
  children: React.ReactNode;
}

const FetchMediaItem = ({ id, onMediaLoaded, children }: FetchMediaItemProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/not-found");
      return;
    }

    const fetchMediaItemDirectly = async () => {
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const transformedItem = transformDbItemToMediaItem(data);
          onMediaLoaded(transformedItem);
        } else {
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Error fetching media item:", error);
        navigate("/not-found");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMediaItemDirectly();
  }, [id, navigate, onMediaLoaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading media details...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FetchMediaItem;
