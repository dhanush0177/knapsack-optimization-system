import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Aurora ambient orbs */}
        <div
          className="aurora-orb absolute -top-32 left-1/4 w-[28rem] h-[28rem] opacity-30 -z-10"
          style={{ background: 'radial-gradient(circle, hsl(263 90% 55%), transparent 70%)' }}
        />
        <div
          className="aurora-orb absolute bottom-1/4 -right-16 w-96 h-96 opacity-20 -z-10"
          style={{ background: 'radial-gradient(circle, hsl(190 100% 45%), transparent 70%)', animationDelay: '-5s', animationDuration: '18s' }}
        />
        <div
          className="aurora-orb absolute top-1/2 left-1/2 w-80 h-80 opacity-10 -z-10"
          style={{ background: 'radial-gradient(circle, hsl(213 100% 55%), transparent 70%)', animationDelay: '-10s', animationDuration: '22s' }}
        />

        {/* Grid dot background overlay */}
        <div className="absolute inset-0 bg-dots opacity-100 -z-10 pointer-events-none" />

        <Navbar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-7 xl:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
