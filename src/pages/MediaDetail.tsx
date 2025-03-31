
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMedia } from "@/context/MediaContext";
import { useAuth } from "@/context/AuthContext";
import { MediaType, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import MediaDetailsSection from "@/components/media/MediaDetailsSection";
import MediaImageSection from "@/components/media/MediaImageSection";
import MediaReviewSection from "@/components/media/MediaReviewSection";
import MediaActions from "@/components/media/MediaActions";
import CreatorProfile from "@/components/media/CreatorProfile";
import FetchMediaItem from "@/components/media/FetchMediaItem";

const MediaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMediaItemById, 
    updateMediaItem, 
    deleteMediaItem, 
    generateImageForTitle 
  } = useMedia();
  
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isReviewEditing, setIsReviewEditing] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<{username: string | null} | null>(null);
  
  // Check if the item belongs to the current user
  const isUserItem = user && mediaItem && !mediaItem.originalCreatorId;
  
  useEffect(() => {
    if (id) {
      const item = getMediaItemById(id);
      if (item) {
        setMediaItem(item);
      }
    }
  }, [id, getMediaItemById]);

  const handleDeleteItem = async () => {
    if (!mediaItem) return;
    
    try {
      await deleteMediaItem(mediaItem.id);
      navigate("/profile");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleMediaItemLoaded = (loadedItem: MediaItem) => {
    setMediaItem(loadedItem);
  };

  // This wrapper ensures we maintain the correct return type
  const handleGenerateImage = async (title: string, type: MediaType): Promise<string> => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImageForTitle(title, type);
      return imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSelectSharedImage = (imageUrl: string) => {
    if (!mediaItem) return;
    updateMediaItem(mediaItem.id, { imageUrl });
  };

  // If we don't have the item in context, fetch it directly from the database
  if (!mediaItem) {
    return (
      <FetchMediaItem id={id} onMediaLoaded={handleMediaItemLoaded}>
        {mediaItem && (
          <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="mb-8">
                <Button onClick={() => navigate(-1)} variant="outline">
                  Back
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MediaImageSection 
                  mediaItem={mediaItem}
                  isGeneratingImage={isGeneratingImage}
                  userId={user?.id}
                  creatorProfile={creatorProfile}
                  updateMediaItem={updateMediaItem}
                  generateImageForTitle={handleGenerateImage}
                  handleSelectSharedImage={handleSelectSharedImage}
                />
                
                <div className="md:col-span-2">
                  <MediaDetailsSection
                    mediaItem={mediaItem}
                    updateMediaItem={updateMediaItem}
                  />
                  
                  <MediaReviewSection 
                    mediaItem={mediaItem}
                    updateMediaItem={updateMediaItem}
                  />
                  
                  {isUserItem && (
                    <MediaActions 
                      title={mediaItem.title}
                      mediaId={mediaItem.id}
                      isReviewEditing={isReviewEditing}
                      setIsReviewEditing={setIsReviewEditing}
                      onDelete={handleDeleteItem}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </FetchMediaItem>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MediaImageSection 
            mediaItem={mediaItem}
            isGeneratingImage={isGeneratingImage}
            userId={user?.id}
            creatorProfile={creatorProfile}
            updateMediaItem={updateMediaItem}
            generateImageForTitle={handleGenerateImage}
            handleSelectSharedImage={handleSelectSharedImage}
          />
          
          <div className="md:col-span-2">
            <MediaDetailsSection
              mediaItem={mediaItem}
              updateMediaItem={updateMediaItem}
            />
            
            <MediaReviewSection 
              mediaItem={mediaItem}
              updateMediaItem={updateMediaItem}
            />
            
            {isUserItem && (
              <MediaActions 
                title={mediaItem.title}
                mediaId={mediaItem.id}
                isReviewEditing={isReviewEditing}
                setIsReviewEditing={setIsReviewEditing}
                onDelete={handleDeleteItem}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
