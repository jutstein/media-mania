
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProvider } from "./context/MediaContext";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddMedia from "./pages/AddMedia";
import MediaDetail from "./pages/MediaDetail";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MediaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add" element={<AddMedia />} />
            <Route path="/media/:id" element={<MediaDetail />} />
            <Route path="/movies" element={<CategoryPage />} />
            <Route path="/tv-shows" element={<CategoryPage />} />
            <Route path="/books" element={<CategoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MediaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
