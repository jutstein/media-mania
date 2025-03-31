
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface CreatorProfileProps {
  creatorId: string | null | undefined;
  userId?: string;
}

const CreatorProfile = ({ creatorId, userId }: CreatorProfileProps) => {
  const [creatorProfile, setCreatorProfile] = useState<{username: string | null} | null>(null);

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (creatorId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', creatorId)
            .single();
            
          if (error) throw error;
          setCreatorProfile(data);
        } catch (error) {
          console.error("Error fetching creator profile:", error);
        }
      }
    };
    
    if (creatorId) {
      fetchCreatorProfile();
    }
  }, [creatorId]);

  if (!creatorId || creatorId === userId || !creatorProfile) {
    return null;
  }

  return (
    <div className="mb-4 text-sm text-muted-foreground text-center bg-secondary/20 rounded-md p-2">
      <User className="h-4 w-4 inline-block mr-1" />
      Image added by {creatorProfile.username || "another user"}
    </div>
  );
};

export default CreatorProfile;
