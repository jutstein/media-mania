
import { MediaType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { generatePlaceholderImage } from "@/utils/mediaUtils";

export const useImageGeneration = () => {
  // Function to check if there are any shared images for a title
  const findSharedImages = async (title: string, type: MediaType) => {
    try {
      const { data, error } = await supabase
        .from('shared_media_images')
        .select('id, image_url, creator_id')
        .eq('title', title)
        .eq('type', type)
        .order('use_count', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching shared images:", error);
      return [];
    }
  };

  // Function to add a shared image to the database
  const addSharedImage = async (title: string, type: MediaType, imageUrl: string, creatorId: string) => {
    try {
      // Check if this image already exists
      const { data: existingImage, error: checkError } = await supabase
        .from('shared_media_images')
        .select('id, use_count')
        .eq('title', title)
        .eq('type', type)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw checkError;
      }
      
      if (existingImage) {
        // Update use count
        const { error: updateError } = await supabase
          .from('shared_media_images')
          .update({ use_count: (existingImage.use_count || 0) + 1 })
          .eq('id', existingImage.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new shared image
        const { error: insertError } = await supabase
          .from('shared_media_images')
          .insert({
            title,
            type,
            image_url: imageUrl,
            creator_id: creatorId
          });
          
        if (insertError) throw insertError;
      }
      
      return true;
    } catch (error) {
      console.error("Error sharing image:", error);
      return false;
    }
  };

  // Function to use an existing shared image
  const useSharedImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('shared_media_images')
        .update({ use_count: supabase.rpc('increment', { count: 1 }) })
        .eq('id', imageId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating shared image use count:", error);
      return false;
    }
  };

  // Function to generate an image using title
  const generateImageForTitle = async (title: string, type: MediaType) => {
    try {
      // First check if there are any shared images we can use
      const sharedImages = await findSharedImages(title, type);
      if (sharedImages.length > 0) {
        // Return the most used image
        return sharedImages[0].image_url;
      }
      
      // If no shared images, generate one
      // In a real AI image generation system, we would create prompts like these:
      let prompt = "";
      
      if (type === "movie") {
        prompt = `Movie poster for "${title}", cinematic style, dramatic lighting, professional movie poster design`;
      } else if (type === "tv") {
        prompt = `TV series title card for "${title}", television production still, professional TV show marketing material`;
      } else if (type === "book") {
        prompt = `Book cover design for "${title}", professional publishing style, elegant typography, literary cover art`;
      }
      
      // For now, we'll use a placeholder image generator with improved type-based images
      // In a real implementation, we would pass the prompt to an AI image generation API
      console.log(`Would generate image with prompt: ${prompt}`);
      
      return generatePlaceholderImage(title, type);
    } catch (error) {
      console.error("Error generating image:", error);
      return generatePlaceholderImage(title, type);
    }
  };

  return { 
    generateImageForTitle,
    findSharedImages,
    addSharedImage,
    useSharedImage
  };
};
