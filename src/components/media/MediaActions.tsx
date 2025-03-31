
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import DeleteMediaDialog from "./DeleteMediaDialog";

interface MediaActionsProps {
  title: string;
  mediaId: string;
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
  return (
    <div className="flex flex-col space-y-3">
      <Button onClick={() => setIsReviewEditing(!isReviewEditing)}>
        <Pencil className="mr-2 h-4 w-4" />
        {isReviewEditing ? "Cancel Editing Review" : "Edit Review"}
      </Button>

      <DeleteMediaDialog title={title} onDelete={onDelete} />
    </div>
  );
};

export default MediaActions;
