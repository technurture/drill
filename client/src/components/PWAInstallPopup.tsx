import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Smartphone, 
  Zap, 
  Bell, 
  Wifi, 
  Star,
  Sparkles,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { usePWAInstall } from "./Pwa";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer/') || location.pathname.startsWith('/receipt/');

  useEffect(() => {
    // Check if app is already installed (PWA mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    console.log('PWA Status Check:', {
      isStandalone,
      isInWebAppiOS,
      hasBeenDismissed,
      isCustomerRoute,
      userAgent: window.navigator.userAgent,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      isHTTPS: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost'
    });

    if (isStandalone || isInWebAppiOS || hasBeenDismissed || isCustomerRoute) {
      console.log('PWA popup hidden:', { isStandalone, isInWebAppiOS, hasBeenDismissed, isCustomerRoute });
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired - PWA is installable!');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (!showPopup) {
        console.log('Showing PWA popup due to beforeinstallprompt event');
        setShowPopup(true);
        setTimeout(() => setIsAnimating(true), 100);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show popup after 10 seconds with animation
    const timer = setTimeout(() => {
      if (!showPopup) {
        console.log('Showing PWA popup after timeout');
        setShowPopup(true);
        setTimeout(() => setIsAnimating(true), 100);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isCustomerRoute, showPopup]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        console.log('Triggering PWA install prompt...');
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowPopup(false);
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error during installation:', error);
        // Don't hide popup on error, let user try again
      }
    } else {
      console.log('No deferred prompt available, showing fallback message');
      // Fallback for browsers that don't support PWA installation
      alert('To install this app, use your browser\'s "Add to Home Screen" option in the menu.');
      setShowPopup(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleCloseClick = () => {
    setIsAnimating(false);
    setTimeout(() => {
    setShowPopup(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    }, 300);
  };
   const { canInstall, installPWA } = usePWAInstall();

  if (!showPopup || isCustomerRoute) {
    return null;
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCloseClick}
      />
       <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-auto transition-all duration-300 ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
         <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden m-4">
            <button
              onClick={handleCloseClick}
              className="absolute top-4 mb-6 right-4 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close popup"
            >
              <X size={20} />
            </button>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-900 dark:text-green-100">Mobile App Installation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-green-200 dark:border-green-700">
                    <img src="/Shebanlace_favicon.png" alt="SheBalance" className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Install SheBalance Mobile App
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Get the best experience with our mobile app - works offline, faster loading, and push notifications!
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Works offline</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Faster loading</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Push notifications</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {canInstall ? (
                  <Button
                    onClick={async () => {
                      const result = await installPWA();
                      if (result.success) {
                        toast({
                          title: "Installation started!",
                          description: "Follow your browser's prompts to complete the installation.",
                        });
                      } else {
                        toast({
                          title: "Installation failed",
                          description: "Please try again or use your browser's 'Add to Home Screen' option.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Install SheBalance App
                  </Button>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Manual Installation
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Use your browser's "Add to Home Screen" option to install the app
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('pwa-install-dismissed');
                      toast({
                        title: "Install SheBalance App",
                        description: "Get the best experience with our mobile app - works offline, faster loading, and push notifications!",
                        action: (
                          <div className="flex gap-2">
                            {canInstall ? (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const result = await installPWA();
                                  if (result.success) {
                                    toast({
                                      title: "Installation started!",
                                      description: "Follow your browser's prompts to complete the installation.",
                                    });
                                  } else {
                                    toast({
                                      title: "Installation failed",
                                      description: "Please try again or use your browser's 'Add to Home Screen' option.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Install
                              </Button>
                            ) : null}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                localStorage.setItem('pwa-install-dismissed', 'true');
                                toast({
                                  title: "Installation dismissed",
                                  description: "You can always install the app later from Settings.",
                                });
                              }}
                            >
                              Dismiss
                            </Button>
                          </div>
                        ),
                        duration: 10000, // 10 seconds
                      });
                    }}
                    className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    Show installation reminder again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
       </div>
      </>
  );
};

export default PWAInstallPopup;

