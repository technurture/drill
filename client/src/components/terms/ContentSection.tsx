import React from "react";

interface ContentSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const ContentSection = ({ id, title, children }: ContentSectionProps) => {
  return (
    <section id={id} className="space-y-4 scroll-mt-20">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </section>
  );
};

export default ContentSection;
