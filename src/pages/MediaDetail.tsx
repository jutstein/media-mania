
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

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMediaItemById, updateMediaItem, deleteMediaItem, generateImageForTitle } = useMedia();
  
  const mediaItem = getMediaItemById(id || "");
  const [creatorProfile, setCreatorProfile] = useState<{username: string | null} | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isReviewEditing, setIsReviewEditing] = useState(false);

  useEffect(() => {
    if (!mediaItem) {
      navigate("/not-found");
    }
  }, [mediaItem, navigate]);

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
    
    fetchCreatorProfile();
  }, [mediaItem?.originalCreatorId]);

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
    toast.success("Image updated successfully!");
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
            updateMediaItem={updateMediaItem}
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
              updateMediaItem={updateMediaItem}
            />

            <MediaActions
              title={mediaItem.title}
              isReviewEditing={isReviewEditing}
              setIsReviewEditing={setIsReviewEditing}
              onDelete={handleDelete}
            />

            <MediaReviewSection
              mediaItem={mediaItem}
              updateMediaItem={updateMediaItem}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
