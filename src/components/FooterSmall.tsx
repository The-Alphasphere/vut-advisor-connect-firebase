import { Link } from 'react-router-dom';
const FooterSmall = () => {
  return <footer className="bg-[#002f6e] text-white py-4 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="flex gap-4 text-sm">
          <Link to="/feedback" className="text-white hover:text-yellow-400 transition-colors duration-300">
            Feedback
          </Link>
          <Link to="#" className="text-white hover:text-yellow-400 transition-colors duration-300">
            Privacy
          </Link>
          <Link to="#" className="text-white hover:text-yellow-400 transition-colors duration-300">
            Terms
          </Link>
        </div>
        <div className="text-sm mt-2 md:mt-0">
          <span>© AlphaSphere 2025. All Rights Reserved.</span>
        </div>
      </div>
    </footer>;
};
export default FooterSmall;