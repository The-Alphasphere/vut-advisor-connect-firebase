import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

interface LogoutConfirmationProps {
  onLogout: () => void;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const LogoutConfirmation = ({ onLogout, children, variant = "destructive" }: LogoutConfirmationProps) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onLogout();
    navigate('/');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant={variant} className="flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the home page and will need to log in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmation;