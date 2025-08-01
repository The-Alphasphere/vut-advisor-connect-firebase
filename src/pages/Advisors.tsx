import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import Header from '@/components/Header';
import FooterSmall from '@/components/FooterSmall';

const Advisors = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  const advisors = [
    {
      id: 1,
      name: "Kwanele Shoba",
      faculty: "Applied and Computer Sciences",
      email: "kwaneles@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 6709",
      specialization: "Computer Science, Software Engineering, Data Science",
      experience: "10+ years in academic advisory",
      bio: "Kwanele specializes in guiding students through computer science programs and career planning in technology fields.",
      image: "/lovable-uploads/296d6709-ebe2-464f-8da3-fac76c2e8771.png",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        linkedin: "#"
      },
    },
    {
      id: 2,
      name: "Sanele Nxumalo",
      faculty: "Engineering and Technology",
      email: "sanelen@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 6756",
      specialization: "Mechanical Engineering, Civil Engineering, Project Management",
      experience: "15+ years in engineering education",
      bio: "Sanele provides comprehensive guidance for engineering students and industry preparation.",
      image: "/lovable-uploads/d3b543e4-f25c-4c73-9915-53c6a406d100.png",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        linkedin: "#"
      },
    },
    {
      id: 3,
      name: "Lerato Motloung",
      faculty: "Human Sciences",
      email: "Lerato.mo@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 7575",
      specialization: "Psychology, Social Work, Human Development",
      experience: "8+ years in student support services",
      bio: "Lerato focuses on holistic student development and wellness in academic environments.",
      image: "/lovable-uploads/d36e6b39-c72a-4824-8281-869be92fa570.png",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        linkedin: "#"
      },
    },
    {
      id: 4,
      name: "Emmanuel Mphelo",
      Faculty: "Management Sciences",
      email: "Emmanuelm3@vut.ac.za",
      location: "PS Building",
      phone: "+27 16 950 7891",
      specialization: "Business Management, Finance, Marketing",
      experience: "12+ years in business education",
      bio: "Emmanuel guides students in business and management fields with industry-relevant advice.",
      image: "/lovable-uploads/7f5da6e0-1435-49fb-9c18-553f96115e6a.png",
      socialLinks: {
        facebook: "#",
        twitter: "#",
        linkedin: "#"
      },
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="container mx-auto px-6 py-10 flex-grow">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#111418] mb-4">
            Our Academic Advisors
          </h1>
          <p className="text-lg text-[#60758a] max-w-3xl mx-auto leading-relaxed">
            Our dedicated team of academic advisors is here to support your journey at VUT. 
            With diverse expertise across all faculties, they are committed to providing 
            personalized guidance for your academic success.
          </p>
          <div className="mt-6 text-sm text-[#60758a]">
            <span className="font-semibold">With over 100 years of combined experience,</span> 
            <span> we've got a well-seasoned team at the palm of your hand.</span>
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advisors.map((advisor) => (
            <div
              key={advisor.id}
              className="group cursor-pointer"
              onClick={() => setSelectedAdvisor(advisor)}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                {/* Image Container */}
                <div className="relative h-80 bg-gradient-to-br from-[#002f6e] to-[#d38c05]">
                  <img
                    src={advisor.image}
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
                    {advisor.faculty}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advisory Information */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#002f6e] to-[#d38c05] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Schedule a session with one of our experienced academic advisors today.
            </p>
            <a
              href="/login"
              className="inline-block bg-white text-[#002f6e] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              Book Your Session
            </a>
          </div>
        </div>
      </div>

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
                    src={selectedAdvisor.image}
                    alt={selectedAdvisor.name}
                    className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-lg mb-4"
                  />
                  
                  {/* Basic Info under image */}
                  <div className="text-center md:text-left w-full max-w-[280px]">
                    <h3 className="text-lg md:text-xl font-bold text-[#111418] mb-2">
                      {selectedAdvisor.name}
                    </h3>
                    <p className="text-base md:text-lg text-[#d38c05] mb-4 font-medium">
                      {selectedAdvisor.faculty}
                    </p>
                    
                    <div className="space-y-3">
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
      
      <FooterSmall />
    </div>
  );
};

export default Advisors;