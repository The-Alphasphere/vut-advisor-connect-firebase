
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#002f6e] text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* VUT Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold mb-3">Contact Info</h3>
          <p className="text-sm">Vaal University of Technology</p>
          <p className="text-sm">Private Bag X021</p>
          <p className="text-sm">Vanderbijlpark, 1900</p>
          <p className="text-sm">Tel: +27 16 950 9000</p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/"onClick={() => window.scrollTo(0, 0)} className="text-white hover:text-yellow-400 transition-colors duration-300">Home Page</Link></li>
            <li><Link to="/faqs" className="text-white hover:text-yellow-400 transition-colors duration-300">FAQs</Link></li>
            <li><a href="https://vut.ac.za/" target="_blank" rel="noopener" className="text-white hover:text-yellow-400 transition-colors duration-300">VUT Website</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="text-white hover:text-yellow-400 transition-colors duration-300">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-white hover:text-yellow-400 transition-colors duration-300">Terms of Use</Link></li>
          </ul>
        </div>

        {/* System Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold mb-3">System Info</h3>
          <p className="text-sm">VUT Advisor Connect enhances transparency and efficiency in student support services.</p>
          <p className="text-sm">Designed by AlphaSphere</p>
        </div>
      </div>
      <div className="container mx-auto px-6 text-center mt-8 border-t border-[#f0f2f5] pt-6">
        <p className="text-sm">&copy; 2025 VUT Advisor Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
