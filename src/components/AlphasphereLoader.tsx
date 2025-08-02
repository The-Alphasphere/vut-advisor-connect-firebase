import { Zap } from 'lucide-react';

interface AlphasphereLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const AlphasphereLoader = ({ 
  message = "Loading...", 
  size = 'md',
  fullScreen = false 
}: AlphasphereLoaderProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-background"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <div className="relative rounded-full bg-gradient-to-r from-primary to-primary/80 p-4 shadow-lg">
            <Zap 
              className={`${sizeClasses[size]} text-primary-foreground animate-bounce`}
              fill="currentColor"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Alphasphere</h3>
          <p className="text-muted-foreground animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlphasphereLoader;