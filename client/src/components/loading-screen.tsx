import { Heart } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center z-50" style={{
      background: 'linear-gradient(135deg, #e11d48 0%, #be185d 50%, #9f1239 100%)'
    }}>
      <div className="text-center">
        {/* Main loading animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        
        {/* App name and tagline */}
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          Corteo
        </h1>
        <p className="text-white/90 text-lg font-medium">
          Organizing for change
        </p>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}