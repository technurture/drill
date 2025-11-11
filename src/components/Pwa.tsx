import React, { useState, useEffect } from "react";
import { 
  Download, 
  Smartphone, 
  Zap, 
  Bell, 
  Wifi, 
  Star,
  Sparkles,
  ArrowDown,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Custom hook for PWA installation
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      setIsInstalled(isStandalone || isInWebAppiOS || wasInstalled);
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('pwa-installed', 'true');
        localStorage.setItem('pwa-install-dismissed', 'true');
      } catch {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          return { success: true, outcome: 'accepted' };
        } else {
          console.log('User dismissed the install prompt');
          return { success: false, outcome: 'dismissed' };
        }
      } catch (error) {
        console.error('Error during installation:', error);
        return { success: false, error };
      }
    } else {
      // Fallback for browsers that don't support PWA installation
      return { success: false, error: 'PWA installation not supported' };
    }
  };

  return {
    deferredPrompt,
    isInstalled,
    canInstall,
    installPWA
  };
};

// const PWAInstallToast = () => {
//   const { toast } = useToast();
//   const location = useLocation();
//   const { canInstall, installPWA } = usePWAInstall();


//   // Don't show PWA toast on customer routes
//   const isCustomerRoute = location.pathname.startsWith('/customer/');

// //   useEffect(() => {
// //     // Check if user has dismissed the PWA installation
// //     const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
// //     const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    
// //     // Don't show toast if previously dismissed, on customer routes, or can't install
// //     // if (hasBeenDismissed || wasInstalled || isCustomerRoute) {
// //     //   return;
// //     // }

// //     // Show toast after 3 seconds on site visit irrespective of event timing
// //     const timer = setTimeout(() => {
// //       toast({
// //         title: "Install SheBalance App",
// //         description: "Get the best experience with our mobile app - works offline, faster loading, and push notifications!",
// //         action: (
// //           <div className="flex gap-2">
// //             <Button
// //               size="sm"
// //               onClick={async () => {
// //                 const result = await installPWA();
// //                 if (result.success) {
// //                   toast({
// //                     title: "Installation started!",
// //                     description: "Follow your browser's prompts to complete the installation.",
// //                   });
// //                 }
// //               }}
// //               className="bg-green-600 hover:bg-green-700"
// //             >
// //               <Download className="w-4 h-4 mr-1" />
// //               Install
// //             </Button>
// //             <Button
// //               size="sm"
// //               variant="outline"
// //               onClick={() => {
// //                 localStorage.setItem('pwa-install-dismissed', 'true');
// //                 toast({
// //                   title: "Installation dismissed",
// //                   description: "You can always install the app later from Settings.",
// //                 });
// //               }}
// //             >
// //               Dismiss
// //             </Button>
// //           </div>
// //         ),
// //         duration: 10000, // 10 seconds
// //       });
// //     }, 3000);
// //     console.log(10)
// //     return () => clearTimeout(timer);
// //   }, [isCustomerRoute, toast, installPWA]);
// useEffect(() => {
//   const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
//   const wasInstalled = localStorage.getItem('pwa-installed') === 'true';

//   if (hasBeenDismissed || wasInstalled || isCustomerRoute || !canInstall) {
//     return;
//   }

//   const timer = setTimeout(() => {
//     toast({
//       title: "Install SheBalance App",
//       description: "Get the best experience with our mobile app - works offline, faster loading, and push notifications!",
//       action: (
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             onClick={async () => {
//               const result = await installPWA();
//               if (result.success) {
//                 toast({
//                   title: "Installation started!",
//                   description: "Follow your browser's prompts to complete the installation.",
//                 });
//               }
//             }}
//             className="bg-green-600 hover:bg-green-700"
//           >
//             <Download className="w-4 h-4 mr-1" />
//             Install
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => {
//               localStorage.setItem('pwa-install-dismissed', 'true');
//               toast({
//                 title: "Installation dismissed",
//                 description: "You can always install the app later from Settings.",
//               });
//             }}
//           >
//             Dismiss
//           </Button>
//         </div>
//       ),
//       duration: 10000,
//     });
//   }, 3000);

//   return () => clearTimeout(timer);
// }, [isCustomerRoute, toast, installPWA, canInstall]);

//   return null;
// };

// export default PWAInstallToast;