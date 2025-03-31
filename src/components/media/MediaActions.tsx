
import { Button } from "@/components/ui/button";
import DeleteMediaDialog from "./DeleteMediaDialog";

interface MediaActionsProps {
  title: string;
  onDelete: () => void;
}

const MediaActions = ({
  title,
  onDelete,
}: MediaActionsProps) => {
  return (
    <div className="flex flex-col space-y-3">
      <DeleteMediaDialog title={title} onDelete={onDelete} />
    </div>
  );
};

export default MediaActions;
