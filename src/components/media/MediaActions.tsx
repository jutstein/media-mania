
import { Button } from "@/components/ui/button";
import { Pencil, Share } from "lucide-react";
import DeleteMediaDialog from "./DeleteMediaDialog";
import { toast } from "sonner";

interface MediaActionsProps {
  title: string;
  mediaId: string; // Add mediaId prop
  isReviewEditing: boolean;
  setIsReviewEditing: (isEditing: boolean) => void;
  onDelete: () => void;
}

const MediaActions = ({
  title,
  mediaId,
  isReviewEditing,
  setIsReviewEditing,
  onDelete,
}: MediaActionsProps) => {
  const handleShare = () => {
    // Create a proper shareable URL with the full path to the media item
    const shareableUrl = `${window.location.origin}/media/${mediaId}`;
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button onClick={() => setIsReviewEditing(!isReviewEditing)}>
        <Pencil className="mr-2 h-4 w-4" />
        {isReviewEditing ? "Cancel Editing Review" : "Edit Review"}
      </Button>

      <Button variant="outline" onClick={handleShare}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>

      <DeleteMediaDialog title={title} onDelete={onDelete} />
    </div>
  );
};

export default MediaActions;
