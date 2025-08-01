// The updated Login.tsx component

// ... (keep all your imports)
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Users, GraduationCap, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import FooterSmall from '@/components/FooterSmall';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Make sure this points to your new useAuth file

const Login = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    login,
    user
  } = useAuth();

  // The role dropdown is now ONLY for the UI icon!
  const [selectedRoleForIcon, setSelectedRoleForIcon] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student-dashboard');else if (user.role === 'advisor') navigate('/advisor-dashboard');else if (user.role === 'admin') navigate('/Admin'); // Add admin redirect
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    // The login function no longer needs the userType.
    // It will securely determine the role from the database.
    const result = await login(trimmedEmail, trimmedPassword);
    if (result.success && result.user) {
      toast({
        title: "Login successful",
        description: `Welcome ${result.user.Name}!`
      });

      // The redirect logic can now stay in the useEffect above,
      // as it will run automatically when the 'user' state is updated.
    } else {
      toast({
        title: "Login failed",
        description: result.error || "Invalid email or password.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  const getUserIcon = () => {
    switch (selectedRoleForIcon) {
      case 'student':
        return <GraduationCap className="h-8 w-8" />;
      case 'advisor':
        return <Users className="h-8 w-8" />;
      case 'admin':
        return <UserCheck className="h-8 w-8" />;
      default:
        return <UserCheck className="h-8 w-8" />;
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-blue-700 text-white">
              <div className="flex justify-center mb-4">{getUserIcon()}</div>
              <CardTitle className="text-2xl">Login to Your Account</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">

                {/* The rest of your form remains exactly the same */}
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} placeholder="your.email@vut.ac.za" required />
                </div>

                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({
                    ...formData,
                    password: e.target.value
                  })} required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
                    {loading ? 'Signing in...' : `Login`}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Forgot your password? <a href="https://logmein.vut.ac.za/adfs/portal/updatepassword/" className="text-blue-700 hover:underline">Reset it here</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <FooterSmall />
    </div>;
};
export default Login;