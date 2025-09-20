import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BackgroundEffects } from '@/components/BackgroundEffects';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message?.includes('already registered')) {
            setError('Ez az email cím már regisztrálva van. Próbáld a bejelentkezést.');
          } else if (error.message?.includes('Password should be at least 6 characters')) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
          } else {
            setError(error.message || 'Regisztrációs hiba történt.');
          }
        } else {
          setError('Sikeres regisztráció! Ellenőrizd az email címedet a megerősítéshez.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Hibás email cím vagy jelszó.');
          } else {
            setError(error.message || 'Bejelentkezési hiba történt.');
          }
        }
      }
    } catch (err) {
      setError('Váratlan hiba történt. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BackgroundEffects />
      
      <div className="w-full max-w-md">
        <Card className="p-8 bg-card/80 backdrop-blur-xl border-border">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow ring-1 ring-white/15 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 6v12"></path><path d="m17.196 9 6.804 15"></path><path d="m6.804 9 10.392 6"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">WinMix</h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Készíts új fiókot' : 'Jelentkezz be a fiókodba'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Teljes név
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Teljes neved"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email cím
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@pelda.hu"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Jelszó
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Jelszó"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-glow"
              disabled={loading}
            >
              {loading ? 'Betöltés...' : (isSignUp ? 'Regisztráció' : 'Bejelentkezés')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              className="text-sm text-primary hover:text-primary-glow transition-colors"
            >
              {isSignUp 
                ? 'Van már fiókod? Jelentkezz be' 
                : 'Nincs még fiókod? Regisztrálj'
              }
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}