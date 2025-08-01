import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

// A simple, public-facing header without authentication logic.
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#002f6e] text-white border-b border-[#f0f2f5]">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo and Title */}
        <Link to="/"onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3">
          <img src="/lovable-uploads/27fb2a51-7f5d-40af-b9c2-6c6aaec3a992.png" alt="VUT Logo" className="w-12 h-12 object-contain"/>
          <h1 className="text-xl font-bold">VUT Advisor Connect</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/login" className="text-sm font-medium text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Book Session
          </Link>
          <Link to="/track-appointment" className="text-sm font-medium text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Track Appointment
          </Link>
          <Link to="/advisors" className="text-sm font-medium text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Advisors
          </Link>
          <Link to="/faqs" className="text-sm font-medium text-white hover:text-yellow-400 hover:no-underline transition-colors">
            FAQs
          </Link>
          <Link to="/login">
            <Button className="bg-[#d38c05] hover:bg-[#c17a03] transition-colors rounded-full h-10 px-5 text-sm font-bold">
              Login
            </Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="bg-[#002f6e] px-6 pb-4 space-y-2 md:hidden">
          <Link to="/login" className="block text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Book Session
          </Link>
          <Link to="/track-appointment" className="block text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Track Appointment
          </Link>
          <Link to="/advisors" className="block text-white hover:text-yellow-400 hover:no-underline transition-colors">
            Advisors
          </Link>
          <Link to="/faqs" className="block text-white hover:text-yellow-400 hover:no-underline transition-colors">
            FAQs
          </Link>
          <Link to="/login">
            <Button className="w-full bg-[#d38c05] hover:bg-[#c17a03] transition-colors rounded-full h-10 text-white font-bold">
              Login
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;