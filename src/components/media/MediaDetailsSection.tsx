
import { useState } from "react";
import { MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import MediaInfo from "./MediaInfo";
import MediaEditForm from "./MediaEditForm";

interface MediaDetailsSectionProps {
  mediaItem: MediaItem;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<string | undefined>;
}

const MediaDetailsSection = ({ mediaItem, updateMediaItem }: MediaDetailsSectionProps) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const handleSaveDetails = (updates: Partial<MediaItem>) => {
    updateMediaItem(mediaItem.id, updates);
    setIsEditingDetails(false);
  };

  const handleCancelEdit = () => {
    setIsEditingDetails(false);
  };

  return (
    <>
      {/* Edit Details Form */}
      {isEditingDetails ? (
        <MediaEditForm 
          mediaItem={mediaItem} 
          onSave={handleSaveDetails}
          onCancel={handleCancelEdit}
        />
      ) : (
        <MediaInfo mediaItem={mediaItem} />
      )}

      <Button onClick={() => setIsEditingDetails(!isEditingDetails)} className="mb-4">
        {isEditingDetails ? "Cancel Editing Details" : "Edit Details"}
      </Button>
    </>
  );
};

export default MediaDetailsSection;
