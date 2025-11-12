import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { StoreContext } from "@/contexts/StoreContext";
import { useUpdateStoreName, useUpdateStoreLocation } from "@/integrations/supabase/hooks/stores";
import { useUser, useHideBalance } from "@/integrations/supabase/hooks/users";
import Deletion from "@/components/settings/Deletion";
import LanguageSelector from "@/components/settings/LanguageSelector";
import { Store } from "@/types/database.types";
import { useStore as useStoreData } from "@/integrations/supabase/hooks/stores";
import { useLocations, useMarketsByLocation } from "@/integrations/supabase/hooks/locations";
import { usePWAInstall } from "@/components/Pwa";
import { 
  Settings as SettingsIcon, 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Clock,
  Users,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Edit2,
  FileText,
  Shield,
  Download,
  Smartphone,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

const Settings = () => {
  const theStore = useContext(StoreContext);
  const { toast } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingMarket, setIsEditingMarket] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const { user } = useAuth();
  const { data: admin } = useUser(user?.id);
  const { data: store } = useStoreData(theStore?.id || "");
  const updateStoreName = useUpdateStoreName();
  const updateStoreLocation = useUpdateStoreLocation();
  const hideBalance = useHideBalance();

  const { data: locations } = useLocations();
  const { data: markets } = useMarketsByLocation(selectedLocation);
  const { data: currentLocationMarkets } = useMarketsByLocation(store?.location_id || "");
  const { isInstalled, canInstall, installPWA } = usePWAInstall();

  useEffect(() => {
    if (store?.location_id) {
      setSelectedLocation(store.location_id);
    }
  }, [store]);

  useEffect(() => {
    if (store?.market_id) {
      setSelectedMarket(store.market_id);
    }
  }, [store]);
  
  const toggleBalance = async () => {
    if (admin?.hide_balance === null) {
      await hideBalance.mutateAsync({
        id: user?.id,
        hide_balance: true,
      });
    } else {
      await hideBalance.mutateAsync({
        id: user?.id,
        hide_balance: !admin?.hide_balance,
      });
    }
  };

  const navigate = useNavigate();

  const handleUpdateStoreName = async () => {
    if (!newStoreName.trim() || !theStore?.id) return;
    
    try {
      await updateStoreName.mutateAsync({
        storeId: theStore.id,
        name: newStoreName.trim(),
      });
      setIsEditingName(false);
      setNewStoreName("");
      toast({
        title: "Store name updated successfully",
        description: "Store name updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update store name",
        description: "Failed to update store name",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStoreLocation = async () => {
    if (!selectedLocation || !theStore?.id) return;
    
    try {
      await updateStoreLocation.mutateAsync({
        storeId: theStore.id,
        locationId: selectedLocation,
        marketId: null,
      });

      setIsEditingLocation(false);
      setSelectedMarket("");
      toast({
        title: "Store location updated successfully",
        description: "Store location updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update store location",
        description: "Failed to update store location",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // When selectedLocation changes during edit, refresh markets list
    if (isEditingMarket) {
      setSelectedMarket("");
    }
  }, [selectedLocation, isEditingMarket]);

  const handleUpdateStoreMarket = async () => {
    if (!selectedMarket || !theStore?.id) return;
    
    try {
      await updateStoreLocation.mutateAsync({
        storeId: theStore.id,
        locationId: selectedLocation || store?.location_id || "",
        marketId: selectedMarket,
      });

      setIsEditingMarket(false);
      toast({
        title: "Store market updated successfully",
        description: "Store market updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update store market",
        description: "Failed to update store market",
        variant: "destructive",
      });
    }
  };


  if (!theStore) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#18191A] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <StoreIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Store Selected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have a store yet. Create your first store to get started.</p>
            <Button 
              onClick={() => navigate('/create-store')} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              Create Your First Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center space-x-3">
                <StoreIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Store</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">{theStore.store_name}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Privacy</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {admin?.hide_balance ? "Protected" : "Visible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <StoreIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span>Store Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Name */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Store Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{store?.store_name}</p>
                </div>
                {!isEditingName && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setNewStoreName(store?.store_name || "");
                    setIsEditingName(true);
                  }} className="w-full sm:w-auto">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingName && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newStoreName}
                    onChange={e => setNewStoreName(e.target.value)}
                    className="flex-1"
                    placeholder="Enter store name"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateStoreName} className="flex-1 sm:flex-none">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)} className="flex-1 sm:flex-none">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Store Location */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Store Location</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {locations?.find(l => l.id === store?.location_id)?.name || "Not set"}
                  </p>
                </div>
                {!isEditingLocation && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedLocation(store?.location_id || "");
                    setIsEditingLocation(true);
                  }} className="w-full sm:w-auto">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingLocation && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateStoreLocation} className="flex-1 sm:flex-none">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingLocation(false)} className="flex-1 sm:flex-none">Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Store Market */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Store Market</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentLocationMarkets?.find(m => m.id === store?.market_id)?.name || "Not set"}
                  </p>
                </div>
                {!isEditingMarket && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedMarket(store?.market_id || "");
                    setIsEditingMarket(true);
                  }} className="w-full sm:w-auto">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingMarket && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Market</Label>
                    <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentLocationMarkets?.map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            {market.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateStoreMarket} className="flex-1 sm:flex-none">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingMarket(false)} className="flex-1 sm:flex-none">Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Privacy Settings */}
        <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span>Privacy Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hide Balance Information</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">When enabled, financial information will be hidden from the dashboard</p>
            </div>
            <Switch
              checked={admin?.hide_balance}
              onCheckedChange={() => toggleBalance()}
            />
          </CardContent>
        </Card>

        {/* Language Settings */}
        <LanguageSelector />

        {/* PWA Installation */}
        {!isInstalled && (
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
        )}

        {/* PWA Already Installed */}
        {isInstalled && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-900 dark:text-green-100">Mobile App</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-green-200 dark:border-green-700">
                    <img src="/Shebanlace_favicon.png" alt="SheBalance" className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      App Installed
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You're using the SheBalance mobile app. Enjoy the enhanced experience!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Danger Zone */}
        <Deletion storeId={theStore?.id} />
      </div>
    </div>
  );
};

export default Settings;
