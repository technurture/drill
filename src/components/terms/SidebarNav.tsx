import React from "react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  sections: { id: string; title: string }[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

const SidebarNav = ({
  sections,
  activeSection,
  onSectionClick,
}: SidebarNavProps) => {
  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={cn(
            "w-full text-left px-2 py-2 text-sm rounded-md transition-colors",
            activeSection === section.id
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted",
          )}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
};

export default SidebarNav;
