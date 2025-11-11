import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react"; // Importing Edit2 icon

interface StoreLocationFieldProps {
  location: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
}

const StoreLocationField = ({
  location,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: StoreLocationFieldProps) => {
  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <>
          <Input
            value={location}
            onChange={(e) => onChange(e.target.value)}
            className="max-w-xs text-[16px]"
            placeholder="Enter store location"
          />
          <Button onClick={onSave}>Save</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <p className="text-[16px]">{location || "No location set"}</p>
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default StoreLocationField;
