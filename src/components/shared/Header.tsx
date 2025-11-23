'use client';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/4e6bec2710f675e854b79a90438ae95376220530.png';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    setLanguage(language === 'pl' ? 'en' : 'pl');
  };

  const handleGoToMaterials = () => {
    router.push('/materials');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="cursor-pointer">
            <Image src={logo} alt="ElectraM&E" height={40} width={120} className="h-10 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Languages className="size-4" />
              <span className="hidden sm:inline">{language === 'pl' ? 'Polski' : 'English'}</span>
              <span className="sm:hidden">{language === 'pl' ? 'PL' : 'EN'}</span>
            </Button>
            {pathname === '/' && (
              <Button onClick={handleGoToMaterials} variant="outline">
                {t.manageMaterials}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

