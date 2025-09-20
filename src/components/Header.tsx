import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary ring-1 ring-white/15 shadow-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 6v12"></path>
                <path d="m17.196 9 6.804 15"></path>
                <path d="m6.804 9 10.392 6"></path>
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              WinMix
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 px-1.5 py-1.5 glass-effect">
            <button 
              onClick={() => onNavigate('statistics')} 
              className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full hover:bg-white/5 transition-smooth"
            >
              Statisztikák
            </button>
            <button 
              onClick={() => onNavigate('results')} 
              className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white rounded-full hover:bg-white/5 transition-smooth"
            >
              Eredmények
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden sm:inline-flex text-sm text-muted-foreground">
                Üdv, {user.email}!
              </span>
            )}
            
            <Button variant="outline" size="sm" className="hidden sm:inline-flex glass-effect border-white/10 hover:bg-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              Bővített stat.
            </Button>

            {user ? (
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Kijelentkezés
              </Button>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="default"
                  size="sm"
                  className="gradient-primary shadow-glow-lg hover:shadow-glow transition-glow"
                >
                  Bejelentkezés
                </Button>
              </Link>
            )}
            
            <Button className="gradient-primary shadow-glow-lg hover:shadow-glow transition-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Keresés
            </Button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg glass-effect ring-1 ring-white/10 hover:bg-white/5 transition-smooth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                <path d="M4 5h16"></path>
                <path d="M4 12h16"></path>
                <path d="M4 19h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="mx-4 mb-4 rounded-2xl glass-effect ring-1 ring-white/10 p-4 space-y-2">
            <button 
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/5 transition-smooth" 
              onClick={() => handleSmoothScroll({} as any, 'statistics')}
            >
              Statisztikák
            </button>
            <button 
              className="block w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-white/5 transition-smooth" 
              onClick={() => handleSmoothScroll({} as any, 'results')}
            >
              Eredmények
            </button>
            <Button className="w-full gradient-primary mt-2">
              Bővített stat.
            </Button>
            {user ? (
              <button 
                onClick={handleSignOut}
                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-500 transition-smooth"
                disabled={loading}
              >
                Kijelentkezés
              </button>
            ) : (
              <Link to="/auth" className="block">
                <Button className="w-full gradient-primary">
                  Bejelentkezés
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};