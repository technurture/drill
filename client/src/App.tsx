import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { StoreProvider } from "./contexts/StoreContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import PWAInstallPopup from "./components/PWAInstallPopup";
import LandingPageWrapper from "./components/LandingPageWrapper";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateStore from "./pages/CreateStore";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import Cart from "./pages/Cart";
import Subscription from "./pages/Subscription";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import Earnings from "./pages/Earnings";
// Removed react-hot-toast provider; using Sonner Toaster instead
import EditProductPage from "./pages/edit-product/[id]";
import ObscurityProvider from "./contexts/ObscureContext";
import AddSales from "./pages/AddSales";
import Notifications from "./pages/Notification";
import Finance from "./pages/Finance";
import Savings from "./pages/Savings";
import Loans from "./pages/Loans";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Help from "./pages/Help";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <ObscurityProvider>
              <SubscriptionProvider>
                <ThemeProvider>
                  <LanguageProvider>
                    <Toaster />
                    <PWAInstallPopup />
                    <ScrollToTop />
                    <Routes>
                    <Route path="/" element={<LandingPageWrapper />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/termsandprivacy" element={<TermsAndPrivacy />} />
                    <Route path="/login" element={<Login />} />

                    <Route path="/create-store" element={
                      <ProtectedRoute>
                      <CreateStore />
                      </ProtectedRoute>
                      } />
                    <Route path="/add-sales" element={
                       <ProtectedRoute>
                      <AddSales />
                      </ProtectedRoute>
                      } 
                      />                    
                    <Route
                      path="/email-verification"
                      element={<EmailVerification />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/termsandprivacy"
                      element={<TermsAndPrivacy />}
                    />
                    <Route
                      path="/help"
                      element={<Help />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Dashboard />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/notifications" element={
                       <ProtectedRoute>
                        <DashboardLayout>
                          <Notifications />
                          </DashboardLayout>
                      </ProtectedRoute>
                      } 
                      />  
                    <Route
                      path="/dashboard/sales"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Sales />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/inventory"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Inventory />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventory/edit-product/:id"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <EditProductPage />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/settings"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Settings />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/cart"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Cart />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/subscription"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Subscription />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/earnings"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Earnings />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/finance"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Finance />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/savings"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Savings />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/loans"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Loans />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/help"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Help />
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route
                      path="/admin-dashboard"
                      element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      }
                    />
                  </Routes>
                  </LanguageProvider>
                </ThemeProvider>
              </SubscriptionProvider>
            </ObscurityProvider>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
