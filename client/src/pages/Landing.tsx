import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Smartphone, 
  BarChart3, 
  BookOpen, 
  Package, 
  Users, 
  FileText, 
  WifiOff,
  Globe,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { tSubheading } = useLanguage();
  const { user } = useAuth();

  const faqs = [
    {
      question: tSubheading('landing.faq.q1'),
      answer: tSubheading('landing.faq.a1')
    },
    {
      question: tSubheading('landing.faq.q2'),
      answer: tSubheading('landing.faq.a2')
    },
    {
      question: tSubheading('landing.faq.q3'),
      answer: tSubheading('landing.faq.a3')
    },
    {
      question: tSubheading('landing.faq.q4'),
      answer: tSubheading('landing.faq.a4')
    },
    {
      question: tSubheading('landing.faq.q5'),
      answer: tSubheading('landing.faq.a5')
    },
    {
      question: tSubheading('landing.faq.q6'),
      answer: tSubheading('landing.faq.a6')
    },
    {
      question: tSubheading('landing.faq.q7'),
      answer: tSubheading('landing.faq.a7')
    },
    {
      question: tSubheading('landing.faq.q8'),
      answer: tSubheading('landing.faq.a8')
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: tSubheading('landing.features.trackBusiness'),
      description: tSubheading('landing.features.trackBusinessDesc')
    },
    {
      icon: Smartphone,
      title: tSubheading('landing.features.builtForYou'),
      description: tSubheading('landing.features.builtForYouDesc')
    },
    {
      icon: BarChart3,
      title: tSubheading('landing.features.knowNumbers'),
      description: tSubheading('landing.features.knowNumbersDesc')
    },
    {
      icon: BookOpen,
      title: tSubheading('landing.features.learnEarn'),
      description: tSubheading('landing.features.learnEarnDesc')
    }
  ];

  const appFeatures = [
    { icon: TrendingUp, text: tSubheading('landing.appFeatures.trackIncome') },
    { icon: Package, text: tSubheading('landing.appFeatures.manageInventory') },
    { icon: Users, text: tSubheading('landing.appFeatures.joinSavings') },
    { icon: FileText, text: tSubheading('landing.appFeatures.getReports') },
    { icon: WifiOff, text: tSubheading('landing.appFeatures.useOffline') },
    { icon: Globe, text: tSubheading('landing.appFeatures.localLanguage') }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#18191A] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/Shebanlace_favicon.png" 
                alt="SheBalance Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                SheBalance
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {tSubheading('landing.navigation.dashboard')}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                  >
                    {tSubheading('landing.navigation.login')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/signup')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {tSubheading('landing.navigation.getStarted')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0">
            <iframe
              src="https://www.youtube.com/embed/BKPPaUXJQ1w?si=kHS2KVTk3n1XyRPX&autoplay=1&mute=1&loop=1&playlist=BKPPaUXJQ1w&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080&enablejsapi=1&start=15"
              title="SheBalance Background Video"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '177.78vh', // 16:9 width based on viewport height
                height: '100vh',
                minWidth: '100vw',
                transform: 'translate(-50%, -50%)',
                border: '0'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center pt-6 sm:pt-10">
          <div className="text-center">
            <Badge className="mb-4 sm:mb-6 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
              <Star className="w-4 h-4 mr-2" />
              {tSubheading('landing.hero.badge')}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              {tSubheading('landing.hero.title').split(' ').slice(0, 2).join(' ')}{' '}
              <span className="text-green-400">
                SheBalance
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              {tSubheading('landing.hero.subtitle')}
            </p>
            <p className="text-base sm:text-lg text-gray-200 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              {tSubheading('landing.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  {tSubheading('landing.navigation.goToDashboard')}
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg"
                  >
                    {tSubheading('landing.hero.ctaPrimary')}
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-green-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg"
                  >
                    {tSubheading('landing.hero.ctaSecondary')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {tSubheading('landing.about.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {tSubheading('landing.about.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-700">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for Section */}
      <section className="py-20 bg-white dark:bg-[#18191A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {tSubheading('landing.whoFor.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {tSubheading('landing.whoFor.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              tSubheading('landing.whoFor.item1'),
              tSubheading('landing.whoFor.item2'),
              tSubheading('landing.whoFor.item3'),
              tSubheading('landing.whoFor.item4')
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {item}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {tSubheading('landing.appFeatures.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-white dark:bg-gray-700 shadow-md">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-[#18191A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {tSubheading('landing.faq.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {tSubheading('landing.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </CardTitle>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* CTA Image - Top on mobile, side on desktop */}
            <div className="w-full md:w-1/2">
              <img 
                src="/SheBalance Image.png" 
                alt="SheBalance illustration"
                className="w-full max-w-2xl md:max-w-full mx-auto rounded-lg"
              />
            </div>

            {/* CTA Content */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {tSubheading('landing.cta.title')}
              </h2>
              <p className="text-xl text-green-100 mb-6 leading-relaxed">
                {tSubheading('landing.cta.description1')}
              </p>
              <p className="text-lg text-green-100 mb-10 leading-relaxed">
                {tSubheading('landing.cta.description2')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                {user ? (
                  <Button 
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    {tSubheading('landing.navigation.goToDashboard')}
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg"
                      onClick={() => navigate('/signup')}
                      className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {tSubheading('landing.cta.primaryButton')}
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="border-2 border-green-50 text-white hover:bg-white hover:text-green-600 dark:border-white px-8 py-4 text-lg"
                    >
                      {tSubheading('landing.cta.secondaryButton')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0E1A12] text-gray-300 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/Shebanlace_favicon.png" alt="SheBalance Logo" className="w-8 h-8" />
                <span className="text-xl font-semibold text-white">SheBalance</span>
              </div>
              <p className="text-sm leading-6 text-gray-400">
                {tSubheading('landing.footer.description')}
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider mb-4">{tSubheading('landing.footer.company')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a className="hover:text-white" href="/help">{tSubheading('landing.footer.helpCenter')}</a></li>
                <li><a className="hover:text-white" href="/termsandprivacy">{tSubheading('landing.footer.termsPrivacy')}</a></li>
                <li><a className="hover:text-white" href="#">{tSubheading('landing.footer.about')}</a></li>
                <li><a className="hover:text-white" href="#">{tSubheading('landing.footer.contact')}</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider mb-4">{tSubheading('landing.footer.newsletter.title')}</h4>
              <p className="text-sm text-gray-400 mb-3">{tSubheading('landing.footer.newsletter.description')}</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={tSubheading('landing.footer.newsletter.placeholder')}
                  className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm placeholder:text-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white"
                >
                  {tSubheading('landing.footer.newsletter.subscribe')}
                </button>
              </form>
              <div className="flex items-center gap-4 mt-4 text-gray-400">
                <a href="#" aria-label="Twitter" className="hover:text-white">X</a>
                <a href="#" aria-label="Facebook" className="hover:text-white">Fb</a>
                <a href="#" aria-label="Instagram" className="hover:text-white">Ig</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400">© {new Date().getFullYear()} {tSubheading('landing.footer.copyright')}</p>
            <div className="flex items-center gap-4">
              <a href="/and-privacy" className="hover:text-white">{tSubheading('landing.footer.privacy')}</a>
              <span className="text-gray-600">•</span>
              <a href="/termsandprivacy" className="hover:text-white">{tSubheading('landing.footer.terms')}</a>
              <span className="text-gray-600">•</span>
              <a href="/help" className="hover:text-white">{tSubheading('landing.footer.support')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
