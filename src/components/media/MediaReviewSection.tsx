
import { useState, useEffect } from "react";
import { MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";

interface MediaReviewSectionProps {
  mediaItem: MediaItem;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => Promise<string | undefined>;
  isReviewEditing?: boolean;
  setIsReviewEditing?: (isEditing: boolean) => void;
}

const MediaReviewSection = ({ 
  mediaItem, 
  updateMediaItem, 
  isReviewEditing: externalIsEditing,
  setIsReviewEditing: externalSetIsEditing 
}: MediaReviewSectionProps) => {
  // Use internal state if no external state is provided
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  
  // Use either external or internal state management
  const isReviewEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsReviewEditing = externalSetIsEditing || setInternalIsEditing;
  
  const [rating, setRating] = useState(mediaItem?.review?.rating || 0);
  const [reviewText, setReviewText] = useState(mediaItem?.review?.text || "");

  // Update local state when mediaItem changes (useful for direct URL navigation)
  useEffect(() => {
    setRating(mediaItem?.review?.rating || 0);
    setReviewText(mediaItem?.review?.text || "");
  }, [mediaItem]);

  const handleSaveReview = () => {
    updateMediaItem(mediaItem.id, {
      review: {
        rating,
        text: reviewText,
        date: new Date().toISOString().split("T")[0],
      }
    });
    setIsReviewEditing(false);
  };

  const handleCancelEditing = () => {
    setRating(mediaItem.review?.rating || 0);
    setReviewText(mediaItem.review?.text || "");
    setIsReviewEditing(false);
  };

  return (
    <div className="glass-morph rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Review</h2>

      {isReviewEditing ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <div className="mt-2">
              <StarRating initialRating={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <Label htmlFor="review">Review (max 200 words)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => {
                const words = e.target.value.trim().split(/\s+/);
                if (words.length <= 200 || words.length === 1) {
                  setReviewText(e.target.value);
                }
              }}
              placeholder="Write your thoughts about this title..."
              className="mt-2 resize-none"
              rows={6}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {reviewText.trim().split(/\s+/).filter(Boolean).length}/200 words
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancelEditing} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveReview}>Save Review</Button>
          </div>
        </div>
      ) : mediaItem.review ? (
        <div>
          <div className="mb-4">
            <StarRating initialRating={mediaItem.review.rating} readonly />
            <div className="text-sm text-muted-foreground mt-1">
              Reviewed on {mediaItem.review.date}
            </div>
          </div>

          <p className="whitespace-pre-line">{mediaItem.review.text}</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">You haven't reviewed this yet.</p>
          <Button onClick={() => setIsReviewEditing(true)}>Add Review</Button>
        </div>
      )}
    </div>
  );
};

export default MediaReviewSection;
