import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store as StoreIcon } from "lucide-react";

interface NoStoreMessageProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const NoStoreMessage: React.FC<NoStoreMessageProps> = ({ 
  title = "No Store Selected",
  description = "You don't have a store yet. Create your first store to get started.",
  showBackButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A] flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md">
        <CardContent>
          <StoreIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/create-store')} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              Create Your First Store
            </Button>
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoStoreMessage;
