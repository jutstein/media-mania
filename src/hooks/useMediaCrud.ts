
import { useState } from "react";
import { MediaItem, MediaType, Season } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { calculateAverageRating, transformDbItemToMediaItem } from "@/utils/mediaUtils";
import { useImageGeneration } from "./useImageGeneration";

export const useMediaCrud = (
  userId: string | undefined,
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>,
  media: MediaItem[]
) => {
  const [isLoading, setIsLoading] = useState(true);
  const { addSharedImage } = useImageGeneration();

  const loadMediaItems = async () => {
    if (!userId) {
      setMedia([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Transform the data from database format to app format
      const transformedData: MediaItem[] = data.map(transformDbItemToMediaItem);

      setMedia(transformedData);
    } catch (error: any) {
      console.error("Error loading media items:", error.message);
      toast.error("Failed to load your media items");
    } finally {
      setIsLoading(false);
    }
  };

  const addMediaItem = async (item: Omit<MediaItem, "id" | "addedDate">) => {
    if (!userId) {
      toast.error("You need to be logged in to add items");
      return;
    }

    const newItem: MediaItem = {
      ...item,
      id: `${item.type}${Date.now()}`,
      addedDate: new Date().toISOString().split("T")[0],
    };
    
    // Calculate average rating for TV shows
    if (item.type === "tv" && item.seasons) {
      const avgRating = calculateAverageRating(item.seasons);
      if (avgRating > 0 && (!item.review || item.review.rating === 0)) {
        newItem.review = {
          ...newItem.review || { text: "", date: new Date().toISOString().split("T")[0] },
          rating: avgRating,
        };
      }
    }
    
    try {
      // If this item has an image and it's not from the placeholder generator
      // add it to shared images
      if (newItem.imageUrl && userId && !newItem.imageUrl.includes('?')) {
        await addSharedImage(newItem.title, newItem.type, newItem.imageUrl, userId);
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('media_items')
        .insert({
          user_id: userId,
          title: newItem.title,
          type: newItem.type,
          image_url: newItem.imageUrl,
          creator: newItem.creator,
          release_year: newItem.releaseYear,
          added_date: newItem.addedDate,
          review_rating: newItem.review?.rating,
          review_text: newItem.review?.text,
          review_date: newItem.review?.date,
          seasons: newItem.seasons as unknown as Json,
          original_creator_id: newItem.originalCreatorId || null
        });

      if (error) throw error;

      // Optimistically update local state
      setMedia((prev) => [...prev, newItem]);
      toast.success(`Added "${item.title}" to your list!`);
    } catch (error: any) {
      console.error("Error adding media item:", error.message);
      toast.error("Failed to add media item");
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    if (!userId) {
      toast.error("You need to be logged in to update items");
      return;
    }

    try {
      const existingItem = media.find(item => item.id === id);
      if (!existingItem) {
        throw new Error("Item not found");
      }
      
      const updatedItem = { ...existingItem, ...updates } as MediaItem;
      
      // If updating seasons, recalculate the average rating
      if (updates.seasons && updatedItem.type === "tv") {
        const avgRating = calculateAverageRating(updatedItem.seasons);
        if (avgRating > 0) {
          updatedItem.review = {
            ...updatedItem.review || { text: "", date: new Date().toISOString().split("T")[0] },
            rating: avgRating,
          };
        }
      }
      
      // If the image URL has changed and it's not a placeholder
      if (updates.imageUrl && 
          updates.imageUrl !== existingItem.imageUrl && 
          userId && 
          !updates.imageUrl.includes('?')) {
        await addSharedImage(updatedItem.title, updatedItem.type, updates.imageUrl, userId);
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('media_items')
        .update({
          title: updatedItem.title,
          type: updatedItem.type,
          image_url: updatedItem.imageUrl,
          creator: updatedItem.creator,
          release_year: updatedItem.releaseYear,
          review_rating: updatedItem.review?.rating,
          review_text: updatedItem.review?.text,
          review_date: updatedItem.review?.date,
          seasons: updatedItem.seasons as unknown as Json,
          original_creator_id: updatedItem.originalCreatorId
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMedia((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return updatedItem;
          }
          return item;
        })
      );
      toast.success("Updated successfully!");
    } catch (error: any) {
      console.error("Error updating media item:", error.message);
      toast.error("Failed to update media item");
    }
  };

  const deleteMediaItem = async (id: string) => {
    if (!userId) {
      toast.error("You need to be logged in to delete items");
      return;
    }

    try {
      const itemToDelete = media.find(item => item.id === id);
      
      // Delete from Supabase
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMedia((prev) => prev.filter((item) => item.id !== id));
      
      if (itemToDelete) {
        toast.success(`Removed "${itemToDelete.title}" from your list`);
      }
    } catch (error: any) {
      console.error("Error deleting media item:", error.message);
      toast.error("Failed to delete media item");
    }
  };

  return {
    isLoading,
    loadMediaItems,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem
  };
};
