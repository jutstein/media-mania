
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MediaImageSection from "@/components/media/MediaImageSection";
import MediaDetailsSection from "@/components/media/MediaDetailsSection";
import MediaReviewSection from "@/components/media/MediaReviewSection";
import MediaActions from "@/components/media/MediaActions";
import { MediaItem } from "@/types";

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMediaItemById, updateMediaItem, deleteMediaItem, generateImageForTitle } = useMedia();
  
  const [mediaItem, setMediaItem] = useState<MediaItem | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<{username: string | null} | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isReviewEditing, setIsReviewEditing] = useState(false);

  // First try to get media from context
  useEffect(() => {
    const item = getMediaItemById(id || "");
    if (item) {
      setMediaItem(item);
      setIsLoading(false);
    } else if (id) {
      // If not found in context, try to fetch directly from database
      const fetchMediaItemDirectly = async () => {
        try {
          const { data, error } = await supabase
            .from('media_items')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            // Transform database format to app format
            const transformedItem: MediaItem = {
              id: data.id,
              title: data.title,
              type: data.type,
              creator: data.creator || "",
              releaseYear: data.release_year || 0,
              imageUrl: data.image_url || "",
              addedDate: data.added_date || new Date().toISOString().split("T")[0],
              originalCreatorId: data.original_creator_id || null,
              seasons: data.seasons || [],
              review: data.review_rating ? {
                rating: data.review_rating,
                text: data.review_text || "",
                date: data.review_date || new Date().toISOString().split("T")[0]
              } : undefined
            };
            
            setMediaItem(transformedItem);
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
    } else {
      navigate("/not-found");
      setIsLoading(false);
    }
  }, [id, getMediaItemById, navigate]);

  // Fetch original creator profile if applicable
  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (mediaItem?.originalCreatorId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', mediaItem.originalCreatorId)
            .single();
            
          if (error) throw error;
          setCreatorProfile(data);
        } catch (error) {
          console.error("Error fetching creator profile:", error);
        }
      }
    };
    
    if (mediaItem) {
      fetchCreatorProfile();
    }
  }, [mediaItem?.originalCreatorId]);

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

  if (!mediaItem) {
    return null;
  }

  const handleDelete = () => {
    deleteMediaItem(mediaItem.id);
    navigate(-1);
  };

  const handleGenerateImage = async () => {
    if (!mediaItem.title) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImageForTitle(mediaItem.title, mediaItem.type);
      updateMediaItem(mediaItem.id, { imageUrl });
      setMediaItem({...mediaItem, imageUrl});
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. Please try again later.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSelectSharedImage = (imageUrl: string) => {
    updateMediaItem(mediaItem.id, { 
      imageUrl,
      originalCreatorId: mediaItem.originalCreatorId || user?.id
    });
    setMediaItem({
      ...mediaItem, 
      imageUrl,
      originalCreatorId: mediaItem.originalCreatorId || user?.id
    });
    toast.success("Image updated successfully!");
  };

  const handleUpdateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    const updatedId = await updateMediaItem(id, updates);
    setMediaItem(prev => prev ? {...prev, ...updates} : prev);
    return updatedId;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Media Image */}
          <MediaImageSection
            mediaItem={mediaItem}
            isGeneratingImage={isGeneratingImage}
            userId={user?.id}
            creatorProfile={creatorProfile}
            updateMediaItem={handleUpdateMediaItem}
            generateImageForTitle={generateImageForTitle}
            handleSelectSharedImage={handleSelectSharedImage}
          />

          {/* Media Details and Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <MediaDetailsSection 
              mediaItem={mediaItem}
              updateMediaItem={handleUpdateMediaItem}
            />

            {user && (
              <>
                <MediaActions
                  title={mediaItem.title}
                  mediaId={mediaItem.id}
                  isReviewEditing={isReviewEditing}
                  setIsReviewEditing={setIsReviewEditing}
                  onDelete={handleDelete}
                />

                <MediaReviewSection
                  mediaItem={mediaItem}
                  updateMediaItem={handleUpdateMediaItem}
                />
              </>
            )}
            
            {!user && (
              <div className="glass-morph rounded-xl p-6 mt-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to leave a review or modify this item.</p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
