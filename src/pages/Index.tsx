
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  
  const advisors = [
    {
      id: 1,
      name: "Kwanele Shoba",
      Faculty: "Applied and Computer Sciences",
      email: "kwaneles@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 6709",
      Specialization: "Computer Science, Software Engineering, Data Science",
      experience: "10+ years in academic advisory",
      bio: "Kwanele specializes in guiding students through computer science programs and career planning in technology fields.",
      socialLinks: { facebook: "#", twitter: "#", linkedin: "#" },
      initials: "KS"
    },
    {
      id: 2,
      name: "Sanele Nxumalo",
      Faculty: "Engineering and Technology",
      email: "sanelen@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 6756",
      Specialization: "Mechanical Engineering, Civil Engineering, Project Management",
      experience: "15+ years in engineering education",
      bio: "Sanele specializes in guiding students through computer science programs and career planning in technology fields.",
      socialLinks: { facebook: "#", twitter: "#", linkedin: "#" },
      initials: "SN"
    },
    {
      id: 3,
      name: "Lerato Motloung",
      Faculty: "Human Sciences",
      email: "Lerato.mo@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 7575",
      Specialization: "Psychology, Social Work, Human Development",
      experience: "8+ years in student support services",
      bio: "Lerato focuses on holistic student development and wellness in academic environments.",
      socialLinks: { facebook: "#", twitter: "#", linkedin: "#" },
      initials: "LM"
    },
    {
      id: 4,
      name: "Emmanuel Mphelo",
      Faculty: "Management Sciences",
      email: "Emmanuelm3@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 7891",
      Specialization: "Business Management, Finance, Marketing",
      experience: "12+ years in business education",
      bio: "Emmanuel focuses on holistic student development and wellness in academic environments.",
      socialLinks: { facebook: "#", twitter: "#", linkedin: "#" },
      initials: "EM"
    }
  ];

  {/* Header section*/}
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 py-10">
        <section 
          className="bg-cover bg-center bg-no-repeat rounded-lg relative"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            minHeight: "480px"
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-white text-4xl md:text-5xl font-black mb-4">Welcome to VUT Advisor Connect</h2>
            <p className="text-white text-base md:text-lg mb-6">Reducing barriers to academic advising - Book, track, and manage your advising sessions online.</p>
            <Link 
              to="/login"
              className="bg-[#d38c05] hover:bg-[#c17a03] transition-colors rounded-lg py-3 px-8 text-white font-bold text-base"
            >
              Book Your Session Now
            </Link>
          </div>
        </section>

        {/* Why Choose VUT Advisor Connect Section */}
        <section className="py-10">
          <div className="flex flex-col gap-10 px-4">
            <div className="md:w-full">
              <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:leading-tight md:tracking-[-0.033em] max-w-[720px]">
                Why Choose VUT Advisor Connect?
              </h1>
              <p className="text-[#111418] text-base font-normal leading-normal max-w-[720px]">
                Our system is designed to break down barriers between students and academic advisors, providing seamless access to the support you need for academic success.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Academic Progress Support */}
              <div className="flex flex-1 gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4 flex-col transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 group">
                <div className="text-[#d38c05]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM208,48H48V208H208ZM128,128a32,32,0,1,0-32-32A32,32,0,0,0,128,128Zm-40,56H200a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#111418] text-base font-bold leading-tight group-hover:text-[#d38c05] transition-colors duration-300">Academic Progress Support</h2>
                  <p className="text-[#60758a] text-sm font-normal leading-normal">Get guidance on course selection, academic concerns, and study strategies tailored to your needs.</p>
                </div>
              </div>

              {/* Flexible Scheduling */}
              <div className="flex flex-1 gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4 flex-col transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 group">
                <div className="text-[#d38c05]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-40-64H96a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#111418] text-base font-bold leading-tight group-hover:text-[#d38c05] transition-colors duration-300">Flexible Scheduling</h2>
                  <p className="text-[#60758a] text-sm font-normal leading-normal">Book sessions at your convenience with real-time availability checking and automated confirmations.</p>
                </div>
              </div>

              {/* Comprehensive Tracking */}
              <div className="flex flex-1 gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4 flex-col transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 group">
                <div className="text-[#d38c05]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM208,48H48V208H208ZM184,104a8,8,0,0,0-8-8H80a8,8,0,0,0,0,16h96A8,8,0,0,0,184,104Zm-16,40H80a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#111418] text-base font-bold leading-tight group-hover:text-[#d38c05] transition-colors duration-300">Comprehensive Tracking</h2>
                  <p className="text-[#60758a] text-sm font-normal leading-normal">Track your appointments, view session history, and receive follow-up recommendations.</p>
                </div>
              </div>

              {/* Digital Reports */}
              <div className="flex flex-1 gap-3 rounded-lg border border-[#dbe0e6] bg-white p-4 flex-col transition-all duration-300 ease-in-out transform hover:shadow-lg hover:scale-105 group">
                <div className="text-[#d38c05]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,72h-40V40a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8V72H40a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm-8,136H48V88H80v16a8,8,0,0,0,16,0V88h64v16a8,8,0,0,0,16,0V88h32v120ZM96,48h64V72H96Z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#111418] text-base font-bold leading-tight group-hover:text-[#d38c05] transition-colors duration-300">Digital Reports</h2>
                  <p className="text-[#60758a] text-sm font-normal leading-normal">Receive PDF confirmations and detailed session reports for your academic records.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Your Academic Advisors Section */}
        <section className="py-10">
          <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:leading-tight md:tracking-[-0.033em] max-w-[720px] mb-4 px-4 text-center mx-auto">
            Meet Your Academic Advisors
          </h1>
          <p className="text-[#60758a] text-center max-w-4xl mx-auto mb-8 px-4">
            Our dedicated team of academic advisors is here to support your journey at VUT. With diverse expertise across all faculties, they are committed to providing personalized guidance for your academic success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="group cursor-pointer" onClick={() => setSelectedAdvisor(advisor)}>
                <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  {/* Image Container */}
                  <div className="relative h-80 bg-gradient-to-br from-[#002f6e] to-[#d38c05]">
                    
                    <img
                      src={advisor.id === 1 ? '/lovable-uploads/296d6709-ebe2-464f-8da3-fac76c2e8771.png' : advisor.id === 2 ? '/lovable-uploads/d3b543e4-f25c-4c73-9915-53c6a406d100.png' : advisor.id === 3 ? '/lovable-uploads/d36e6b39-c72a-4824-8281-869be92fa570.png' : '/lovable-uploads/7f5da6e0-1435-49fb-9c18-553f96115e6a.png'}
                      alt={advisor.name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:opacity-75 relative z-10"
                    />
                    
                    
                    
                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-20"></div>
                  </div>
                  
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-4 text-white z-30">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#d38c05] transition-colors">
                    {advisor.name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {advisor.Faculty}
                  </p>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Advisor Detail Modal */}
      <Dialog open={!!selectedAdvisor} onOpenChange={() => setSelectedAdvisor(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Advisor Profile</DialogTitle>
          </DialogHeader>
          {selectedAdvisor && (
            <div className="p-2">
              <div className="flex flex-col md:flex-row gap-6 p-4">
                {/* Left Side - Image and Basic Info */}
                <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                  <img
                    src={selectedAdvisor.id === 1 ? '/lovable-uploads/296d6709-ebe2-464f-8da3-fac76c2e8771.png' : selectedAdvisor.id === 2 ? '/lovable-uploads/d3b543e4-f25c-4c73-9915-53c6a406d100.png' : selectedAdvisor.id === 3 ? '/lovable-uploads/d36e6b39-c72a-4824-8281-869be92fa570.png' : '/lovable-uploads/7f5da6e0-1435-49fb-9c18-553f96115e6a.png'}
                    alt={selectedAdvisor.name}
                    className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-lg mb-4"
                  />
                  
                  {/* Name, Faculty, Email, Room under the picture */}
                  <div className="text-center md:text-left w-full max-w-[280px]">
                    <h3 className="text-lg md:text-xl font-bold text-[#111418] mb-2">
                      {selectedAdvisor.name}
                    </h3>
                    <p className="text-base md:text-lg text-[#d38c05] mb-3 font-medium">
                      {selectedAdvisor.faculty}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center md:justify-start text-gray-700 text-sm">
                        <Mail className="h-4 w-4 mr-2 text-[#d38c05] flex-shrink-0" />
                        <span className="break-all">{selectedAdvisor.email}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start text-gray-700 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-[#d38c05] flex-shrink-0" />
                        <span>{selectedAdvisor.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Detailed Information */}
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Specialization:</h4>
                    <p className="text-gray-700 text-sm md:text-base">{selectedAdvisor.specialization}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Experience:</h4>
                    <p className="text-gray-700 text-sm md:text-base">{selectedAdvisor.experience}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">About:</h4>
                    <p className="text-gray-700 text-sm md:text-base">{selectedAdvisor.bio}</p>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="px-4 pb-4">
                <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                  <a href={selectedAdvisor.socialLinks.facebook} className="text-[#d38c05] hover:text-[#c17a03] transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href={selectedAdvisor.socialLinks.twitter} className="text-[#d38c05] hover:text-[#c17a03] transition-colors">
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a href={selectedAdvisor.socialLinks.linkedin} className="text-[#d38c05] hover:text-[#c17a03] transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
