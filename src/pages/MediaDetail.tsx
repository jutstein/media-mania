
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MediaItem } from "@/types";
import MediaImageSection from "@/components/media/MediaImageSection";
import MediaDetailsSection from "@/components/media/MediaDetailsSection";
import MediaReviewSection from "@/components/media/MediaReviewSection";
import MediaActions from "@/components/media/MediaActions";
import FetchMediaItem from "@/components/media/FetchMediaItem";
import CreatorProfile from "@/components/media/CreatorProfile";

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMediaItemById, updateMediaItem, deleteMediaItem, generateImageForTitle } = useMedia();
  
  const [mediaItem, setMediaItem] = useState<MediaItem | undefined>(
    getMediaItemById(id || "")
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isReviewEditing, setIsReviewEditing] = useState(false);

  const handleMediaItemLoaded = (loadedItem: MediaItem) => {
    setMediaItem(loadedItem);
  };

  const handleDelete = () => {
    if (mediaItem) {
      deleteMediaItem(mediaItem.id);
      navigate(-1);
    }
  };

  const handleGenerateImage = async () => {
    if (!mediaItem?.title) return;
    
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
    if (!mediaItem) return;
    
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

  // If we don't have a mediaItem yet (not in context), fetch it directly
  if (!mediaItem) {
    return (
      <FetchMediaItem id={id} onMediaLoaded={handleMediaItemLoaded}>
        <MediaDetail />
      </FetchMediaItem>
    );
  }

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
            creatorProfile={null}
            updateMediaItem={handleUpdateMediaItem}
            generateImageForTitle={generateImageForTitle}
            handleSelectSharedImage={handleSelectSharedImage}
          />

          {/* Show creator profile info in a separate component */}
          <CreatorProfile 
            creatorId={mediaItem.originalCreatorId} 
            userId={user?.id}
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
                  isReviewEditing={isReviewEditing}
                  setIsReviewEditing={setIsReviewEditing}
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
