
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LoginPrompt = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <Button asChild>
          <Link to="/auth">Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default LoginPrompt;
