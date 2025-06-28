
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				coderpadBGPrimary: '#181F27',
				dsb: {
					background: '#0D1219',
					accent: '#00E2CA', // Teal color
					accentDark: '#00B8AB', // Darker teal for contrast
					accentLight: '#56F0E0', // Lighter teal for highlights
					neutral1: '#A0AEC0',
					neutral2: '#4A5568',
					neutral3: '#2D3748',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				'card-selected': '0 0 15px rgba(0, 226, 202, 0.2)',
				'card-hover': '0 0 10px rgba(0, 226, 202, 0.1)'
			},
			backgroundImage: {
				'sparkle': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
				'teal-glow': 'radial-gradient(circle, rgba(0,226,202,0.15) 0%, rgba(0,226,202,0.05) 50%, rgba(0,0,0,0) 70%)',
				'cyber-grid': 'linear-gradient(rgba(0,226,202,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,226,202,0.15) 1px, transparent 1px)',
				'cyber-dots': 'radial-gradient(circle, rgba(0,226,202,0.2) 1px, transparent 1px)',
				'gradient-border': 'linear-gradient(90deg, transparent, rgba(0,226,202,0.6) 50%, transparent 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'card-select': {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
					'100%': { transform: 'translateY(0)' }
				},
				'float': {
					'0%': { transform: 'translateY(0) translateX(0)' },
					'50%': { transform: 'translateY(-10px) translateX(5px)' },
					'100%': { transform: 'translateY(0) translateX(0)' }
				},
				'float-delay': {
					'0%': { transform: 'translateY(0) translateX(0)' },
					'50%': { transform: 'translateY(-8px) translateX(-5px)' },
					'100%': { transform: 'translateY(0) translateX(0)' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.9', transform: 'scale(1.02)' }
				},
				'float-particle': {
					'0%': { transform: 'translateY(0) translateX(0)', opacity: '0.7' },
					'25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.5' },
					'50%': { transform: 'translateY(-40px) translateX(-10px)', opacity: '0.3' },
					'75%': { transform: 'translateY(-60px) translateX(5px)', opacity: '0.1' },
					'100%': { transform: 'translateY(-80px) translateX(0)', opacity: '0' }
				},
				'subtle-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'sparkle-move': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'scan-line': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'grid-flow': {
					'0%': { backgroundPosition: '0px 0px' },
					'100%': { backgroundPosition: '50px 50px' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 15px 5px rgba(0,226,202,0.4)' },
					'50%': { boxShadow: '0 0 25px 10px rgba(0,226,202,0.7)' }
				},
				'border-shine': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' }
				},
				'border-glow': {
					'0%, 100%': { borderColor: 'rgba(0,226,202,0.3)' },
					'50%': { borderColor: 'rgba(0,226,202,0.8)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'card-select': 'card-select 0.3s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-delay': 'float-delay 8s ease-in-out infinite 1s',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'float-particle': 'float-particle 10s ease-in-out infinite',
				'subtle-rotate': 'subtle-rotate 120s linear infinite',
				'sparkle-move': 'sparkle-move 2s linear infinite',
				'scan-line': 'scan-line 4s linear infinite',
				'grid-flow': 'grid-flow 8s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'border-shine': 'border-shine 3s ease-in-out infinite',
				'border-glow': 'border-glow 2s ease-in-out infinite',
			},
			backdropBlur: {
				xs: '2px',
				sm: '5px',
				md: '12px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
