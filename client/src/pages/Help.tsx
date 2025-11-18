import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  HelpCircle, 
  Search, 
  Eye,
  Calendar,
  FileText,
  Star,
  BookOpen,
  Languages,
  Play,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Shield,
  Volume2,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  Download,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { useHelpCategories, useHelpArticles } from '@/integrations/supabase/hooks/admin';
import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation('pages');
  const [activeTab, setActiveTab] = useState('user-manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [activeManualSection, setActiveManualSection] = useState<string | null>(null);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{[key: string]: number}>({});
  const [audioDurations, setAudioDurations] = useState<{[key: string]: number}>({});
  const [audioCurrentTimes, setAudioCurrentTimes] = useState<{[key: string]: number}>({});
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

  const { data: categories } = useHelpCategories();
  const { data: articles = [] } = useHelpArticles({
    category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
    language: languageFilter !== 'all' ? languageFilter : undefined,
    search: searchTerm || undefined
  });

  const languages = [
    { value: 'all', label: t('help.allLanguages') },
    { value: 'english', label: t('help.languages.english') },
    { value: 'yoruba', label: t('help.languages.yoruba') },
    { value: 'hausa', label: t('help.languages.hausa') },
    { value: 'igbo', label: t('help.languages.igbo') },
    { value: 'pidgin', label: t('help.languages.pidgin') }
  ];

  const filteredArticles = articles;

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  const openArticle = async (article: any) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  // Simple markdown parser function
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/^1\. (.*)/gm, '<li>$1</li>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/g, '<br>');
  };

  const renderMarkdown = (content: string) => {
    return { __html: parseMarkdown(content) };
  };

  const toggleManualSection = (sectionId: string) => {
    setActiveManualSection(activeManualSection === sectionId ? null : sectionId);
  };

  // Audio control functions
  const toggleAudioPlay = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (!audio) return;

    if (currentPlayingAudio === audioId) {
      audio.pause();
      setCurrentPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      if (currentPlayingAudio && audioRefs.current[currentPlayingAudio]) {
        audioRefs.current[currentPlayingAudio].pause();
      }
      audio.play();
      setCurrentPlayingAudio(audioId);
    }
  };

  const skipBackward = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const skipForward = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (audio) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioRef = (audioId: string, element: HTMLAudioElement | null) => {
    if (element) {
      audioRefs.current[audioId] = element;
      
      element.addEventListener('loadedmetadata', () => {
        setAudioDurations(prev => ({
          ...prev,
          [audioId]: element.duration
        }));
      });

      element.addEventListener('timeupdate', () => {
        const progress = (element.currentTime / element.duration) * 100;
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: progress
        }));
        setAudioCurrentTimes(prev => ({
          ...prev,
          [audioId]: element.currentTime
        }));
      });

      element.addEventListener('ended', () => {
        setCurrentPlayingAudio(null);
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: 0
        }));
      });
    }
  };

  // Audio tutorials data
  const audioTutorials = [
    {
      id: 'english-bookkeeping',
      title: t('help.audioTutorials.englishTitle'),
      language: t('help.languages.english'),
      description: t('help.audioTutorials.englishDescription'),
      audioFile: '/English-2.mp3',
      color: 'from-blue-500 to-blue-600',
      flag: '🇺🇸',
      available: true
    },
    {
      id: 'yoruba-bookkeeping',
      title: t('help.audioTutorials.yorubaTitle'),
      language: t('help.languages.yoruba'),
      description: t('help.audioTutorials.yorubaDescription'),
      audioFile: '/yoruba-2.mp3',
      color: 'from-green-500 to-green-600',
      flag: '🇳🇬',
      available: true
    },
    {
      id: 'pidgin-bookkeeping',
      title: t('help.audioTutorials.pidginTitle'),
      language: t('help.languages.pidginEnglish'),
      description: t('help.audioTutorials.pidginDescription'),
      audioFile: '/Pidgin.mp3',
      color: 'from-teal-500 to-teal-600',
      flag: '🇳🇬',
      available: true
    },
    {
      id: 'hausa-bookkeeping',
      title: t('help.audioTutorials.hausaTitle'),
      language: t('help.languages.hausa'),
      description: t('help.audioTutorials.hausaDescription'),
      audioFile: '',
      color: 'from-orange-500 to-orange-600',
      flag: '🇳🇬',
      available: false
    },
    {
      id: 'igbo-bookkeeping',
      title: t('help.audioTutorials.igboTitle'),
      language: t('help.languages.igbo'),
      description: t('help.audioTutorials.igboDescription'),
      audioFile: '',
      color: 'from-purple-500 to-purple-600',
      flag: '🇳🇬',
      available: false
    }
  ];

  const userManualSections = [
    {
      id: 'introduction',
      title: t('help.manual.introduction.title'),
      icon: BookOpen,
      content: [
        {
          subtitle: t('help.manual.introduction.subtitle'),
          description: t('help.manual.introduction.description'),
          steps: [
            t('help.manual.introduction.step1'),
            t('help.manual.introduction.step2'),
            t('help.manual.introduction.step3'),
            t('help.manual.introduction.step4'),
            t('help.manual.introduction.step5')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/kHBwdtq4Cck'
        }
      ]
    },
    {
      id: 'getting-started',
      title: t('help.manual.gettingStarted.title'),
      icon: Play,
      content: [
        {
          subtitle: t('help.manual.gettingStarted.subtitle'),
          description: t('help.manual.gettingStarted.description'),
          steps: [
            t('help.manual.gettingStarted.step1'),
            t('help.manual.gettingStarted.step2'),
            t('help.manual.gettingStarted.step3'),
            t('help.manual.gettingStarted.step4'),
            t('help.manual.gettingStarted.step5'),
            t('help.manual.gettingStarted.step6'),
            t('help.manual.gettingStarted.step7')
          ],
          imagePlaceholders: ['https://youtube.com/embed/Ecl93iiIzpw','https://www.youtube.com/embed/KmTVzdYDnMQ','https://www.youtube.com/embed/0PzEO8j6nyk']
        }
      ]
    },
    {
      id: 'dashboard',
      title: t('help.manual.dashboard.title'),
      icon: Eye,
      content: [
        {
          subtitle: t('help.manual.dashboard.subtitle'),
          description: t('help.manual.dashboard.description'),
          steps: [
            t('help.manual.dashboard.step1'),
            t('help.manual.dashboard.step2'),
            t('help.manual.dashboard.step3'),
            t('help.manual.dashboard.step4'),
            t('help.manual.dashboard.step5'),
            t('help.manual.dashboard.step6')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/iPrN9r9YlFE'
        }
      ]
    },
    {
      id: 'inventory',
      title: t('help.manual.inventory.title'),
      icon: BookOpen,
      content: [
        {
          subtitle: t('help.manual.inventory.subtitle1'),
          description: t('help.manual.inventory.description1'),
          steps: [
            t('help.manual.inventory.step1_1'),
            t('help.manual.inventory.step1_2'),
            t('help.manual.inventory.step1_3'),
            t('help.manual.inventory.step1_4')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/I1mZK3Maqkg'
        },
        {
          subtitle: t('help.manual.inventory.subtitle2'),
          description: t('help.manual.inventory.description2'),
          steps: [
            t('help.manual.inventory.step2_1'),
            t('help.manual.inventory.step2_2'),
            t('help.manual.inventory.step2_3')
          ]
        }
      ]
    },
    {
      id: 'product-details',
      title: t('help.manual.productDetails.title'),
      icon: FileText,
      content: [
        {
          subtitle: t('help.manual.productDetails.subtitle'),
          description: t('help.manual.productDetails.description'),
          steps: [
            t('help.manual.productDetails.step1'),
            t('help.manual.productDetails.step2'),
            t('help.manual.productDetails.step3')
          ]
        }
      ]
    },
    {
      id: 'sales',
      title: t('help.manual.sales.title'),
      icon: FileText,
      content: [
        {
          subtitle: t('help.manual.sales.subtitle1'),
          description: t('help.manual.sales.description1'),
          steps: [
            t('help.manual.sales.step1_1'),
            t('help.manual.sales.step1_2'),
            t('help.manual.sales.step1_3')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/iipYNad-4cQ'
        },
        {
          subtitle: t('help.manual.sales.subtitle2'),
          description: t('help.manual.sales.description2'),
          steps: [
            t('help.manual.sales.step2_1'),
            t('help.manual.sales.step2_2'),
            t('help.manual.sales.step2_3'),
            t('help.manual.sales.step2_4')
          ]
        },
        {
          subtitle: t('help.manual.sales.subtitle3'),
          description: t('help.manual.sales.description3'),
          steps: [
            t('help.manual.sales.step3_1'),
            t('help.manual.sales.step3_2'),
            t('help.manual.sales.step3_3')
          ]
        }
      ]
    },
    {
      id: 'finance',
      title: t('help.manual.finance.title'),
      icon: Calendar,
      content: [
        {
          subtitle: t('help.manual.finance.subtitle1'),
          description: t('help.manual.finance.description1'),
          steps: [
            t('help.manual.finance.step1_1'),
            t('help.manual.finance.step1_2'),
            t('help.manual.finance.step1_3')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/WsBCpyb48jA'
        },
        {
          subtitle: t('help.manual.finance.subtitle2'),
          description: t('help.manual.finance.description2'),
          steps: [
            t('help.manual.finance.step2_1'),
            t('help.manual.finance.step2_2'),
            t('help.manual.finance.step2_3'),
            t('help.manual.finance.step2_4'),
            t('help.manual.finance.step2_5')
          ]
        }
      ]
    },
    {
      id: 'savings',
      title: t('help.manual.savings.title'),
      icon: Star,
      content: [
        {
          subtitle: t('help.manual.savings.subtitle1'),
          description: t('help.manual.savings.description1'),
          steps: [
            t('help.manual.savings.step1_1'),
            t('help.manual.savings.step1_2'),
            t('help.manual.savings.step1_3'),
            t('help.manual.savings.step1_4')
          ]
        },
        {
          subtitle: t('help.manual.savings.subtitle2'),
          description: t('help.manual.savings.description2'),
          steps: [
            t('help.manual.savings.step2_1'),
            t('help.manual.savings.step2_2'),
            t('help.manual.savings.step2_3')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/E-XOsT_M8Gg'
        }
      ]
    },
    {
      id: 'settings',
      title: t('help.manual.settings.title'),
      icon: Shield,
      content: [
        {
          subtitle: t('help.manual.settings.subtitle'),
          description: t('help.manual.settings.description'),
          steps: [
            t('help.manual.settings.step1'),
            t('help.manual.settings.step2'),
            t('help.manual.settings.step3')
          ],
          imagePlaceholder: 'https://www.youtube.com/embed/_HL74eJhcD8'
        }
      ]
    },
    {
      id: 'conclusion',
      title: t('help.manual.conclusion.title'),
      icon: BookOpen,
      content: [
        {
          subtitle: t('help.manual.conclusion.subtitle'),
          description: t('help.manual.conclusion.description'),
          steps: [
            t('help.manual.conclusion.step1'),
            t('help.manual.conclusion.step2'),
            t('help.manual.conclusion.step3')
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('help.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('help.description')}
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="user-manual" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{t('help.userManual')}</span>
              <span className="sm:hidden">{t('help.manual')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="learn-bookkeeping" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{t('help.learnBookkeeping')}</span>
              <span className="sm:hidden">{t('help.learn')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="from-admin" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t('help.fromAdmin')}</span>
              <span className="sm:hidden">{t('help.admin')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: User Manual */}
          <TabsContent value="user-manual" className="space-y-6">
        {/* User Manual Section */}
        <Card className="bg-transparent dark:bg-transparent border-none shadow-none">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <BookOpen className="w-6 h-6" />
              {t('help.userManual')}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              {t('help.userManualDescription')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-3 md:p-6">
            {userManualSections.map((section) => (
              <div key={section.id} className="rounded-lg">
                <button
                  onClick={() => toggleManualSection(section.id)}
                  className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">{section.title}</span>
                  </div>
                  {activeManualSection === section.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {activeManualSection === section.id && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-6">
                    {section.content.map((item, index) => (
                      <div key={index} className="border-l-4 border-green-200 dark:border-green-800 pl-3 md:pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.subtitle}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                        
                        {/* Images Section */}
                        {/* Videos Section */}
                        {Array.isArray((item as any).imagePlaceholders) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {(item as any).imagePlaceholders.map((videoUrl: string, idx: number) => (
                              <div key={idx} className="flex flex-col items-center">
                                <div className="relative w-48 h-96 bg-gray-900 rounded-3xl p-2 shadow-lg">
                                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                                    {videoUrl.includes('youtube.com/embed') ? (
                                      <iframe
                                        src={`${videoUrl}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${videoUrl.split('/').pop()}&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0`}
                                        title={`YouTube Video ${idx + 1}`}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <video 
                                        src={videoUrl} 
                                        controls
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLVideoElement;
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = `
                                            <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                                              <div class="text-center text-gray-500 dark:text-gray-400">
                                                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p class="text-xs">Video not found</p>
                                              </div>
                                            </div>
                                          `;
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('help.video')} {idx + 1}</p>
                              </div>
                            ))}
                          </div>
                        ) : (item as any).imagePlaceholder && (
                          <div className="flex flex-col items-center mb-4">
                            <div className="relative w-48 h-96 bg-gray-900 rounded-3xl p-2 shadow-lg">
                              <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                                {(item as any).imagePlaceholder.includes('youtube.com/embed') ? (
                                  <iframe
                                    src={`${(item as any).imagePlaceholder}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${(item as any).imagePlaceholder.split('/').pop()}&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0`}
                                    title="YouTube Video"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video 
                                    src={(item as any).imagePlaceholder} 
                                    controls
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLVideoElement;
                                      target.style.display = 'none';
                                      target.parentElement!.innerHTML = `
                                        <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                                          <div class="text-center text-gray-500 dark:text-gray-400">
                                            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p class="text-xs">Video not found</p>
                                          </div>
                                        </div>
                                      `;
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{t('help.video')}</p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{t('help.steps')}</h5>
                          <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                            {item.steps.map((step, stepIndex) => (
                              <li key={stepIndex}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Tab Content: Learn Bookkeeping */}
          <TabsContent value="learn-bookkeeping" className="space-y-6">
        {/* Audio Tutorials Section */}
        <Card className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-900/20 dark:via-gray-800 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('help.audioLearningCenter')}</h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                  {t('help.audioLearningDescription')}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audioTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-0 shadow-md overflow-hidden">
                  {/* Header with gradient */}
                  <div className={`h-20 bg-gradient-to-r ${tutorial.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-2xl">{tutorial.flag}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {tutorial.language}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        <Volume2 className="w-3 h-3 mr-1" />
                        {tutorial.available ? (
                          audioDurations[tutorial.id] ? formatTime(audioDurations[tutorial.id]) : t('help.loading')
                        ) : (
                          t('help.comingSoon')
                        )}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Title and Description */}
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {tutorial.description}
                      </p>
                    </div>

                    {/* Audio Player */}
                    <div className="space-y-3">
                      {tutorial.available ? (
                        <>
                          {/* Hidden Audio Element */}
                          <audio
                            ref={(el) => handleAudioRef(tutorial.id, el)}
                            src={tutorial.audioFile}
                            preload="metadata"
                            className="hidden"
                          />
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${tutorial.color} transition-all duration-300 ease-out`}
                              style={{ width: `${audioProgress[tutorial.id] || 0}%` }}
                            ></div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className={`w-10 h-10 rounded-full p-0 bg-gradient-to-r ${tutorial.color} hover:scale-105 transition-all duration-200 shadow-lg`}
                                onClick={() => toggleAudioPlay(tutorial.id)}
                              >
                                {currentPlayingAudio === tutorial.id ? (
                                  <Pause className="w-4 h-4 text-white" />
                                ) : (
                                  <Play className="w-4 h-4 text-white ml-0.5" />
                                )}
                              </Button>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => skipBackward(tutorial.id)}
                                  title="Skip back 10 seconds"
                                >
                                  <SkipBack className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => skipForward(tutorial.id)}
                                  title="Skip forward 10 seconds"
                                >
                                  <SkipForward className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatTime(audioCurrentTimes[tutorial.id] || 0)}</span>
                              <span>/</span>
                              <span>{formatTime(audioDurations[tutorial.id] || 0)}</span>
                              <a
                                href={tutorial.audioFile}
                                download
                                className="ml-2"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  title="Download audio"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </a>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${currentPlayingAudio === tutorial.id ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {currentPlayingAudio === tutorial.id ? t('help.playing') : t('help.readyToPlay')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('help.audioTutorial')}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Coming Soon UI */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gray-400 dark:bg-gray-600" style={{ width: '0%' }}></div>
                          </div>

                          {/* Disabled Controls */}
                          <div className="flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                disabled
                                className="w-10 h-10 rounded-full p-0 bg-gray-400 cursor-not-allowed"
                              >
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              </Button>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="w-8 h-8 p-0 cursor-not-allowed"
                                >
                                  <SkipBack className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  className="w-8 h-8 p-0 cursor-not-allowed"
                                >
                                  <SkipForward className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>--:--</span>
                              <span>/</span>
                              <span>--:--</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="w-8 h-8 p-0 ml-2 cursor-not-allowed"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Coming Soon Badge */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                {t('help.comingSoon')}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t('help.inProgress')}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mt-0.5">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    {t('help.learnInYourLanguage')}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    {t('help.audioTutorialsDescription')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-600">
                      <Headphones className="w-3 h-3 mr-1" />
                      {t('help.highQualityAudio')}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-600">
                      <Languages className="w-3 h-3 mr-1" />
                      {t('help.multipleLanguages')}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-600">
                      <Download className="w-3 h-3 mr-1" />
                      {t('help.downloadAvailable')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Document Section */}
        <Card className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-900/20 dark:via-gray-800 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardHeader className="p-3 md:p-1">
            <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
               
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-0 shadow-md overflow-hidden">
              {/* Header with gradient */}
              <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FileText className="w-16 h-16 mx-auto mb-2 opacity-90" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {t('help.pdfDocumentTitle')}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/BOOKKEEPING DESIGN LAYOUT-1.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('help.viewGuide')}
                    </Button>
                  </a>
                  <a 
                    href="/BOOKKEEPING DESIGN LAYOUT-1.pdf" 
                    download
                    className="flex-1"
                  >
                    <Button 
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('help.download')}
                    </Button>
                  </a>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {t('help.whatsInside')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.introToBookkeeping')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.separateMoney')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.incomeExpenditure')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.moneyInOut')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.contributionStrategy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.dailyRecordKeeping')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.loansDebt')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.pdfContent.growingBusiness')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>{t('help.moreTopics')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Tab Content: From Admin to You */}
          <TabsContent value="from-admin" className="space-y-6">
        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('help.searchHelpArticles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4 sm:gap-4">
                <div className="flex-1">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('help.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('help.allCategories')}</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('help.language')} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t('help.popularArticles')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => openArticle(article)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {article.category?.name || t('help.uncategorized')}
                      </Badge>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        <span className="capitalize">{article.language}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t('help.allHelpArticles')}
          </h2>
          
          {regularArticles.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('help.noHelpArticlesFound')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('help.adjustSearchFilters')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="bg-white dark:bg-gray-800 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => openArticle(article)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">
                        {article.category?.name || t('help.uncategorized')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {article.language}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
          </TabsContent>
        </Tabs>

        {/* Article Modal */}
        <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedArticle?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedArticle && (
              <div className="space-y-6">
                {/* Article Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedArticle.category?.name || t('help.uncategorized')}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {selectedArticle.language}
                    </Badge>
                    {selectedArticle.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        {t('help.featured')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedArticle.views_count} {t('help.viewsCount')}</span>
                    </div>
                  </div>
                </div>

                {/* Article Description */}
                {selectedArticle.description && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedArticle.description}
                    </p>
                  </div>
                )}

                {/* Article Content */}
                <div className="prose dark:prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={renderMarkdown(selectedArticle.content)}
                    className="text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Help; 