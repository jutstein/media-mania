
import { useState, useEffect } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { MediaType } from '@/types';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SharedImagePickerProps {
  title: string;
  type: MediaType;
  onSelect: (imageUrl: string) => void;
}

const SharedImagePicker = ({ title, type, onSelect }: SharedImagePickerProps) => {
  const { findSharedImages } = useImageGeneration();
  const [isOpen, setIsOpen] = useState(false);
  const [sharedImages, setSharedImages] = useState<{id: string, image_url: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadSharedImages = async () => {
    setIsLoading(true);
    try {
      const images = await findSharedImages(title, type);
      setSharedImages(images);
    } catch (error) {
      console.error('Error loading shared images:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      loadSharedImages();
    }
  }, [isOpen, title, type]);
  
  const handleSelectImage = (imageUrl: string) => {
    onSelect(imageUrl);
    setIsOpen(false);
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="mt-2"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Browse Shared Images
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an image for {title}</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sharedImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No shared images found for this title</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 py-4">
                {sharedImages.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border"
                    onClick={() => handleSelectImage(image.image_url)}
                  >
                    <img 
                      src={image.image_url} 
                      alt={title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SharedImagePicker;
