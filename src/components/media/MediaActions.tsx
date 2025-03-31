
import { Button } from "@/components/ui/button";
import { Pencil, Share } from "lucide-react";
import DeleteMediaDialog from "./DeleteMediaDialog";
import { toast } from "sonner";

interface MediaActionsProps {
  title: string;
  isReviewEditing: boolean;
  setIsReviewEditing: (isEditing: boolean) => void;
  onDelete: () => void;
}

const MediaActions = ({
  title,
  isReviewEditing,
  setIsReviewEditing,
  onDelete,
}: MediaActionsProps) => {
  const handleShare = () => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button 
        onClick={() => setIsReviewEditing(!isReviewEditing)}
        variant={isReviewEditing ? "outline" : "default"}
      >
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
