
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is running as PWA (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isPWAInstalled = isStandalone || isInWebAppiOS;

    if (isPWAInstalled) {
      // PWA is installed, redirect to storeer.ng/login
      window.location.href = "https://www.storeer.ng/login";
    } else {
      // PWA is not installed, redirect to landing page
      window.location.href = "https://www.usestoreer.vercel.app";
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting...</h1>
        <p className="text-xl text-gray-600">
          Please wait while we redirect you to the appropriate page.
        </p>
      </div>
    </div>
  );
};

export default Index;
