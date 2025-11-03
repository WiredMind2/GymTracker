import React from 'react';

const LoadingScreen = () => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const loadingElement = document.getElementById('loading-screen');
      if (loadingElement) {
        loadingElement.style.opacity = '0';
        loadingElement.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
          }
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      id="loading-screen"
      className="fixed inset-0 bg-primary-600 text-white flex flex-col justify-center items-center z-50"
    >
      <div className="text-4xl mb-4">💪</div>
      <h1 className="text-2xl font-bold mb-4">Gym Tracker</h1>
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;