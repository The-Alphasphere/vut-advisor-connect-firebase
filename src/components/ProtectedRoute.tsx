import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AlphasphereLoader from './AlphasphereLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'advisor' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      if (requiredRole && user.role !== requiredRole) {
        if (!hasShownError) {
          toast({
            title: "Access Denied",
            description: `This page is only accessible to ${requiredRole}s. You are logged in as a ${user.role}.`,
            variant: "destructive",
          });
          setHasShownError(true);
        }
        
        // Redirect to appropriate dashboard based on user role
        if (user.role === 'student') {
          navigate('/student-dashboard');
        } else if (user.role === 'advisor') {
          navigate('/advisor-dashboard');
        } else {
          navigate('/login');
        }
      }
    }
  }, [user, loading, navigate, requiredRole, toast, hasShownError]);

  if (loading) {
    return <AlphasphereLoader fullScreen message="Authenticating..." />;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;