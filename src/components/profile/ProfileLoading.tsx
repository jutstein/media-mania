
import { Loader2 } from "lucide-react";

const ProfileLoading = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
        <h2 className="text-xl">Loading profile...</h2>
      </div>
    </div>
  );
};

export default ProfileLoading;
