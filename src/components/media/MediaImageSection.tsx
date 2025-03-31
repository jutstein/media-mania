
import { useState } from "react";
import { MediaItem, MediaType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SharedImagePicker from "@/components/SharedImagePicker";
import { ImageIcon, Film, Tv, Book } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MediaImageSectionProps {
  mediaItem: MediaItem;
  isGeneratingImage: boolean;
  userId?: string;
  creatorProfile: {username: string | null} | null;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<string | undefined>;
  generateImageForTitle: (title: string, type: MediaType) => Promise<string>;
  handleSelectSharedImage: (imageUrl: string) => void;
}

const MediaImageSection = ({
  mediaItem,
  isGeneratingImage,
  updateMediaItem,
  generateImageForTitle,
  handleSelectSharedImage
}: MediaImageSectionProps) => {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState(mediaItem.imageUrl || "");

  const handleGenerateImage = async () => {
    if (!mediaItem.title) return;
    
    try {
      console.log("Generating image for:", mediaItem.title);
      const imageUrl = await generateImageForTitle(mediaItem.title, mediaItem.type);
      console.log("Generated image URL:", imageUrl);
      
      // Update the local state first for immediate feedback
      setEditImageUrl(imageUrl);
      
      // Then update in the database
      const updatedId = await updateMediaItem(mediaItem.id, { imageUrl });
      console.log("Updated media item with new image, ID:", updatedId);
      
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. Please try again later.");
    }
  };

  const handleSaveDetails = async () => {
    try {
      console.log("Saving image URL:", editImageUrl);
      await updateMediaItem(mediaItem.id, {
        imageUrl: editImageUrl,
      });
      setIsEditingImage(false);
      toast.success("Image updated successfully!");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    }
  };

  const iconMap = {
    movie: <Film className="h-6 w-6" />,
    tv: <Tv className="h-6 w-6" />,
    book: <Book className="h-6 w-6" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="md:col-span-1 flex flex-col"
    >
      {isEditingImage ? (
        <div className="glass-morph rounded-xl p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? "Generating..." : "Generate New Image"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditImageUrl("")}
              >
                Clear
              </Button>
            </div>
            
            <SharedImagePicker 
              title={mediaItem.title}
              type={mediaItem.type}
              onSelect={handleSelectSharedImage}
            />
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditImageUrl(mediaItem.imageUrl || "");
                  setIsEditingImage(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveDetails}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[2/3] rounded-xl overflow-hidden glass-morph p-1 mb-4">
          {mediaItem.imageUrl ? (
            <img
              src={mediaItem.imageUrl}
              alt={mediaItem.title}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <div className="h-full w-full bg-muted flex flex-col items-center justify-center rounded-lg text-center p-4">
              {iconMap[mediaItem.type]}
              <p className="mt-4 text-sm text-muted-foreground">No image available</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? "Generating..." : "Generate Image"}
              </Button>
              
              <SharedImagePicker 
                title={mediaItem.title}
                type={mediaItem.type}
                onSelect={handleSelectSharedImage}
              />
            </div>
          )}
        </div>
      )}
      
      {mediaItem.imageUrl && !isEditingImage && (
        <div className="mb-4 flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditingImage(true)}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Change Image
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MediaImageSection;
