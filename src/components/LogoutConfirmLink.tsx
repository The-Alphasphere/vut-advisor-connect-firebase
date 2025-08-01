import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onLogout: () => void;
}

const LogoutConfirmLink = ({ to, children, className, onLogout }: LogoutConfirmLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on advisor or student dashboard pages
  const isOnDashboardPage = location.pathname === '/advisor-dashboard' || location.pathname === '/student-dashboard';
  
  // Pages that should trigger logout confirmation
  const shouldShowConfirmation = isOnDashboardPage && (to === '/' || to === '/track-appointment' || to === '/faqs');

  const handleConfirm = () => {
    onLogout();
    navigate(to); // Navigate to the selected page after logout
  };

  if (shouldShowConfirmation) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className={className}>
            {children}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Navigating to this page will log you out of your account and redirect you to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Continue and Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // For non-dashboard pages or non-triggering links, render as normal link
  return (
    <button onClick={() => navigate(to)} className={className}>
      {children}
    </button>
  );
};

export default LogoutConfirmLink;