
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating = ({
  initialRating = 0,
  onChange,
  readonly = false,
  size = 24,
}: StarRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (index: number) => {
    if (readonly) return;
    
    // Allow toggling off a rating by clicking the same star again
    const newRating = rating === index ? 0 : index;
    setRating(newRating);
    onChange?.(newRating);
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={size}
          className={`rating-star ${
            index <= (hover || rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          } ${readonly ? "cursor-default" : "cursor-pointer"}`}
          onClick={() => handleClick(index)}
          onMouseEnter={() => !readonly && setHover(index)}
          onMouseLeave={() => !readonly && setHover(0)}
        />
      ))}
    </div>
  );
};

export default StarRating;
