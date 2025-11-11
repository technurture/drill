import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useStore, setStoreContext } from "@/contexts/StoreContext";
import { useContext } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Clock,
  Users,
  ShoppingBag,
  ArrowLeft,
  Plus,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useLocations, useMarketsByLocation } from '@/integrations/supabase/hooks/locations';
import { useStores } from '@/integrations/supabase/hooks/stores';

const CreateStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setStoreCtx = useContext(setStoreContext);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: locations } = useLocations();
  const { data: markets } = useMarketsByLocation(selectedLocation);
  const { data: userStores } = useStores(user?.id);

  // Check if this is the user's first store
  const isFirstStore = !userStores || userStores.length === 0;

  useEffect(() => {
    if (locations && locations.length > 0) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations]);

  useEffect(() => {
    if (markets && markets.length > 0) {
      setSelectedMarket(markets[0].id);
    } else {
      setSelectedMarket('');
    }
  }, [markets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([
          {
            store_name: storeName,
            location_id: selectedLocation,
            market_id: selectedMarket || null,
            owner_id: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Store created successfully!",
        description: "Your store has been created and is ready to use.",
      });

      setStoreCtx?.setStore(data);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast({
        title: "Error creating store",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#18191A]">
      {/* Single Column Layout */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
                    {/* Back/Skip Button */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isFirstStore) {
                  navigate('/dashboard');
                } else {
                  navigate(-1);
                }
              }}
              className="mr-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isFirstStore ? 'Skip' : 'Back'}
            </Button>
          </div>

          <Card className="border-0 shadow-2xl bg-white dark:bg-[#18191A]">
            <CardHeader className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <img src="/Shebanlace_favicon.png" alt="SheBalance" className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isFirstStore ? 'Create Your First Store' : 'Create a New Store'}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isFirstStore 
                  ? 'Set up your first store to start managing your business. You can add location and market details later in Settings.' 
                  : 'Add another store to your business portfolio. You can add location and market details later in Settings.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Removed Store Avatar Upload */}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter store name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
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

                <div>
                  <Label htmlFor="market">Market</Label>
                  <Select 
                    value={selectedMarket} 
                    onValueChange={setSelectedMarket}
                    disabled={!selectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedLocation ? "Select a market" : "Select location first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {markets && markets.length > 0 ? (
                        markets.map((market) => (
                          <SelectItem key={market.id} value={market.id}>
                            {market.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No markets available for this location
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Store...
                    </>
                  ) : (
                    "Create Store"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Success Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🎉 Ready to start your business journey with SheBalance!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;

