import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Store,
  Search
} from 'lucide-react';
import { useLocations, useMarketsByLocation } from '@/integrations/supabase/hooks/locations';
import { useCreateMarket, useDeleteMarket } from '@/integrations/supabase/hooks/admin';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';

const AdminLocations = () => {
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [newMarketName, setNewMarketName] = useState('');
  const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get markets for the selected location
  const { data: selectedLocationMarkets, isLoading: marketsLoading } = useMarketsByLocation(selectedLocation || '');
  
  // Get markets for all locations to show counts
  const { data: allMarkets } = useQuery({
    queryKey: ['all-markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('id, name, location_id');
      
      if (error) throw error;
      return data || [];
    }
  });

  const createMarket = useCreateMarket();
  const deleteMarket = useDeleteMarket();

  const handleAddMarket = async () => {
    if (!selectedLocation || !newMarketName.trim()) {
      toast.error('Please select a location and enter a market name');
      return;
    }

    try {
      await createMarket.mutateAsync({
        name: newMarketName.trim(),
        locationId: selectedLocation
      });
      
      setNewMarketName('');
      setIsAddMarketOpen(false);
      toast.success('Market created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create market');
    }
  };

  const handleDeleteMarket = async (marketId: string, marketName: string) => {
    if (confirm(`Are you sure you want to delete "${marketName}"? This action cannot be undone.`)) {
      try {
        await deleteMarket.mutateAsync(marketId);
        toast.success('Market deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete market');
      }
    }
  };

  const filteredLocations = locations?.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location & Market Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage locations and their associated markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {locations?.length || 0} locations
          </span>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations and Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations List */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Nigerian States
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locationsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedLocation === location.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedLocation(location.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {location.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {allMarkets?.filter(market => market.location_id === location.id).length || 0} markets
                        </p>
                      </div>
                      <Badge variant="outline">
                        {location.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Markets for Selected Location */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Markets
                {selectedLocation && (
                  <Badge variant="secondary">
                    {locations?.find(l => l.id === selectedLocation)?.name}
                  </Badge>
                )}
              </CardTitle>
              {selectedLocation && (
                <Dialog open={isAddMarketOpen} onOpenChange={setIsAddMarketOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Market
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Market</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Market Name
                        </label>
                        <Input
                          placeholder="Enter market name..."
                          value={newMarketName}
                          onChange={(e) => setNewMarketName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddMarketOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddMarket}
                          disabled={createMarket.isPending || !newMarketName.trim()}
                        >
                          {createMarket.isPending ? 'Creating...' : 'Create Market'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedLocation ? (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a location to view its markets
                </p>
              </div>
            ) : marketsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : selectedLocationMarkets && selectedLocationMarkets.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedLocationMarkets.map((market) => (
                  <div
                    key={market.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {market.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Created {new Date(market.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMarket(market.id, market.name)}
                      disabled={deleteMarket.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No markets found for this location
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsAddMarketOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Market
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLocations;
