
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileLoading = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Skeleton for ProfileHeader */}
        <div className="glass-morph rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-muted" />
          
          <div className="flex-1 w-full">
            <Skeleton className="h-8 w-48 mb-4 bg-muted" />
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
              <Skeleton className="h-6 w-24 bg-muted" />
              <Skeleton className="h-6 w-24 bg-muted" />
              <Skeleton className="h-6 w-20 bg-muted" />
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Skeleton className="h-9 w-28 bg-muted" />
              <Skeleton className="h-9 w-28 bg-muted" />
            </div>
          </div>
        </div>
        
        {/* Skeleton for tabs */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md mb-8 bg-muted" />
        </div>
        
        {/* Skeleton for media grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg bg-muted" />
              <Skeleton className="h-4 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mt-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading profile data...</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileLoading;
