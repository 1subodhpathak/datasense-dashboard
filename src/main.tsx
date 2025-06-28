import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            afterSignOutUrl='/'
            appearance={{
                elements: {
                    card: 'bg-black/80 backdrop-blur-xl border border-[#333] shadow-2xl text-white',
                    formButtonPrimary: 'bg-dsb-accent text-black hover:bg-dsb-accent/80',
                    headerTitle: 'text-white',
                    headerSubtitle: 'text-white/80',
                    socialButtonsBlockButton: 'bg-black/60 text-white border border-dsb-accent',
                    dividerText: 'text-white/60',
                    profileSectionTitle: 'text-dsb-accent',
                    navbar: 'bg-black/70 text-white',
                    navbarButton: 'text-white hover:text-dsb-accent active:text-dsb-accent',
                    navbarButton__active: 'text-dsb-accent',
                    navbarItem: 'text-white hover:text-dsb-accent active:text-dsb-accent',
                    navbarItem__active: 'text-dsb-accent',
                    userPreviewTextContainer: 'text-white',
                    userPreviewEmail: 'text-white/80',
                    userButtonPopoverActionButton: 'text-white hover:text-dsb-accent active:text-dsb-accent',
                    userButtonPopoverActionButtonIcon: 'text-dsb-accent',
                    userButtonPopoverActionButtonText: 'text-white hover:text-dsb-accent active:text-dsb-accent',
                },
                variables: {
                    colorPrimary: '#00e2ca',
                    colorText: '#fff',
                    colorBackground: 'rgba(20,20,20,0.85)',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                },
            }}
        >
            <App />
        </ClerkProvider>
    </React.StrictMode>,
);
