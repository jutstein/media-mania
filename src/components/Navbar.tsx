
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavLinks } from "@/components/navbar/NavLinks";
import { UserSearch } from "@/components/navbar/UserSearch";
import { UserMenu } from "@/components/navbar/UserMenu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link to="/" className="font-semibold text-xl tracking-tight mr-6">
            MediaMania
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center space-x-3">
          <UserSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
