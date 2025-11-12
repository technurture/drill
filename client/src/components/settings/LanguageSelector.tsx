import React from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, LANGUAGE_OPTIONS } from '@/i18n/constants';

const LanguageSelector = () => {
  const { language, setLanguage, tSubheading, isLoading } = useLanguage();

  const handleLanguageChange = async (value: string) => {
    await setLanguage(value as any);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          <CardTitle>{tSubheading('settings.language')}</CardTitle>
        </div>
        <CardDescription>
          Choose your preferred language for subheadings and section titles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={isLoading}
          >
            <SelectTrigger id="language-select" className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Available languages:</p>
          <ul className="list-disc list-inside">
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <li key={lang.code}>{lang.nativeName} ({lang.name})</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
