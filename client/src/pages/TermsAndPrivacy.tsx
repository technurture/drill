import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TermsHeader from "@/components/terms/TermsHeader";
import SidebarNav from "@/components/terms/SidebarNav";
import TermsContent from "@/components/terms/TermsContent";
import PrivacyContent from "@/components/terms/PrivacyContent";

const TermsAndPrivacy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        if (
          window.scrollY >= sectionTop - 100 &&
          window.scrollY < sectionTop + sectionHeight - 100
        ) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sections = {
    terms: [
      { id: "introduction", title: "Introduction" },
      { id: "account-responsibilities", title: "Account Registration" },
      { id: "billing", title: "Subscription and Billing" },
      { id: "usage", title: "Usage Restrictions" },
      { id: "ownership", title: "Data and Content Ownership" },
      { id: "termination", title: "Termination" },
      { id: "liability", title: "Limitation of Liability" },
      { id: "dispute", title: "Dispute Resolution" },
      { id: "changes", title: "Changes to Terms" },
    ],
    privacy: [
      { id: "privacy-intro", title: "Privacy Introduction" },
      { id: "information-collection", title: "Information We Collect" },
      { id: "information-usage", title: "How We Use Information" },
      { id: "information-sharing", title: "How We Share Information" },
      { id: "data-security", title: "Data Security" },
      { id: "your-rights", title: "Your Rights" },
      { id: "cookies", title: "Cookies" },
      { id: "third-party", title: "Third-Party Services" },
      { id: "privacy-updates", title: "Updates to Privacy Policy" },
      { id: "contact", title: "Contact Information" },
    ],
  };

  const SidebarContent = () => (
    <ScrollArea className="h-full py-6">
      <div className="px-4 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Terms of Service</h3>
            <Badge variant="secondary" className="mt-1">9 sections</Badge>
          </div>
        </div>
        <SidebarNav
          sections={sections.terms}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      </div>
      <div className="px-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Privacy Policy</h3>
            <Badge variant="secondary" className="mt-1">10 sections</Badge>
          </div>
        </div>
        <SidebarNav
          sections={sections.privacy}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      </div>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <TermsHeader />
      <div className="flex relative">
        {/* Mobile Navigation */}
        {isMobileView && (
          <div className="fixed bottom-4 right-4 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" className="rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px]">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Desktop Sidebar */}
        {!isMobileView && (
          <aside className="w-72 fixed h-[calc(100vh-4rem)] border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm">
            <SidebarContent />
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${!isMobileView ? "ml-72" : ""}`}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hero Section */}
            <Card className="p-6 md:p-8 border-0 shadow-xl bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Legal Documentation
              </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Transparency in every policy
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Terms of Service</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rules and guidelines for using our platform
              </p>
            </div>

                  <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Privacy Policy</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How we handle and protect your data
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
              <div className="p-6 md:p-8 space-y-8 md:space-y-12">
            <TermsContent />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 md:pt-12">
            <PrivacyContent />
                </div>
              </div>
          </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
