import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Mail, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
    course: string;
    faculty: string;
  };
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAvatarChange
}) => {
  const { user } = useAuth();

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            My Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.avatar} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {user.Name.charAt(0)}{user.Surname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="profile-avatar-upload" 
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={20} className="text-white" />
              </label>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">Click to change avatar</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User size={16} />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={user.Name}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="surname" className="flex items-center gap-2">
                  <User size={16} />
                  Surname
                </Label>
                <Input
                  id="surname"
                  value={user.Surname}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
                <Label htmlFor="course" className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    Course
                </Label>
                <Input
                    id="course"
                    value={userProfile.course}
                    disabled
                    className="bg-muted"
                />
            </div>

            <div>
                <Label htmlFor="faculty" className="flex items-center gap-2">
                    <Building2 size={16} />
                    faculty
                </Label>
                <Input
                    id="faculty"
                    value={userProfile.faculty}
                    disabled
                    className="bg-muted"
                />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;
