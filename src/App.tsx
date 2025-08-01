
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import BookSession from "./pages/BookSession";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import FAQs from "./pages/FAQs";
import Feedback from "./pages/Feedback";
import TrackAppointment from "./pages/TrackAppointment";
import Advisors from "./pages/Advisors";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/book-session" element={<BookSession />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/advisor-dashboard" 
            element={
              <ProtectedRoute requiredRole="advisor">
                <AdvisorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/track-appointment" element={<TrackAppointment />} />
          <Route path="/advisors" element={<Advisors />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
