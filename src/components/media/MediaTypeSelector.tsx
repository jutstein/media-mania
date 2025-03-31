
import { Button } from "@/components/ui/button";
import { Film, Tv, Book } from "lucide-react";
import { MediaType } from "@/types";

interface MediaTypeSelectorProps {
  selectedType: MediaType;
  onChange: (type: MediaType) => void;
}

const MediaTypeSelector = ({ selectedType, onChange }: MediaTypeSelectorProps) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        <Button
          type="button"
          variant={selectedType === "movie" ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onChange("movie")}
        >
          <Film className="mr-2 h-4 w-4" />
          Movie
        </Button>
        <Button
          type="button"
          variant={selectedType === "tv" ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onChange("tv")}
        >
          <Tv className="mr-2 h-4 w-4" />
          TV Show
        </Button>
        <Button
          type="button"
          variant={selectedType === "book" ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onChange("book")}
        >
          <Book className="mr-2 h-4 w-4" />
          Book
        </Button>
      </div>
    </div>
  );
};

export default MediaTypeSelector;
