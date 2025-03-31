
import { useState, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";

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
  
  // Handle half star clicks
  const handleHalfStarClick = (index: number) => {
    if (readonly) return;
    
    const halfIndex = index - 0.5;
    // If already at this half star, toggle off
    const newRating = rating === halfIndex ? 0 : halfIndex;
    setRating(newRating);
    onChange?.(newRating);
  };

  // Function to render stars and half-stars
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      // For each position, render a container with both half and full star
      stars.push(
        <div key={i} className="relative flex items-center">
          {/* Half star (left half clickable) */}
          <div 
            className={`absolute left-0 w-1/2 h-full z-10 ${readonly ? "cursor-default" : "cursor-pointer"}`} 
            onClick={() => handleHalfStarClick(i)}
            onMouseEnter={() => !readonly && setHover(i - 0.5)}
          ></div>
          
          {/* Full star (right half clickable) */}
          <div 
            className={`absolute right-0 w-1/2 h-full z-10 ${readonly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handleClick(i)}
            onMouseEnter={() => !readonly && setHover(i)}
          ></div>
          
          {/* Render half star */}
          {(rating >= i - 0.5 && rating < i) || (hover >= i - 0.5 && hover < i) ? (
            <StarHalf
              size={size}
              className="text-yellow-400 fill-yellow-400"
            />
          ) : /* Render full or empty star */
          (i <= (hover || rating)) ? (
            <Star
              size={size}
              className="text-yellow-400 fill-yellow-400"
            />
          ) : (
            <Star
              size={size}
              className="text-gray-300"
            />
          )}
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div 
      className="flex items-center space-x-1"
      onMouseLeave={() => !readonly && setHover(0)}
    >
      {renderStars()}
    </div>
  );
};

export default StarRating;
