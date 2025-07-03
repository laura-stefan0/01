

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center z-50" style={{
      background: 'linear-gradient(135deg, #e11d48 0%, #be185d 50%, #9f1239 100%)'
    }}>
      <div className="text-center">
        {/* Loading circle animation */}
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* App name and tagline */}
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          Corteo
        </h1>
        <p className="text-white/90 text-lg font-medium">
          Organizing for change
        </p>
      </div>
    </div>
  );
}