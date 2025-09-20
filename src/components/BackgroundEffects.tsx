import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <>
      {/* Animated Background Gradients */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -left-28 h-[520px] w-[520px] rounded-full bg-gradient-to-r from-primary/35 to-primary-glow/25 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-20 h-[580px] w-[580px] rounded-full bg-gradient-to-r from-info/28 to-info/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-r from-success/16 to-success/8 blur-[110px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional atmospheric effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
        
        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent transform rotate-12"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-info/5 to-transparent transform -rotate-12"></div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-info/60 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-success/60 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 -z-10 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </>
  );
};