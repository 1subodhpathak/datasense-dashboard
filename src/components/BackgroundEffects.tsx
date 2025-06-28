
import { useEffect, useRef } from "react";

const BackgroundEffects = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Enhanced animation effects for game-like particles
  useEffect(() => {
    const createParticle = () => {
      const container = document.querySelector('.particle-container');
      if (!container) return;
      
      const particle = document.createElement('div');
      particle.classList.add('floating-particle');
      
      // Random position, size and opacity
      const size = Math.random() * 6 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const opacity = Math.random() * 0.5 + 0.2;
      const delay = Math.random() * 5;
      const duration = Math.random() * 5 + 5; // 5-10 seconds for animation
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = `${opacity}`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      container.appendChild(particle);
      
      // Remove particle after animation completes
      setTimeout(() => {
        particle.remove();
      }, duration * 1000);
    };
    
    // Create initial particles
    for (let i = 0; i < 30; i++) {
      createParticle();
    }
    
    // Add more particles periodically
    const interval = setInterval(() => {
      createParticle();
    }, 800);
    
    // Create flowing lines
    const createFlowLine = () => {
      const container = document.querySelector('.flow-line-container');
      if (!container) return;
      
      const line = document.createElement('div');
      line.classList.add('flow-line');
      
      const posY = Math.random() * 100;
      const width = Math.random() * 100 + 50;
      const opacity = Math.random() * 0.3 + 0.05;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 5; // 5-8 seconds
      
      line.style.top = `${posY}%`;
      line.style.width = `${width}px`;
      line.style.opacity = `${opacity}`;
      line.style.animationDelay = `${delay}s`;
      line.style.animationDuration = `${duration}s`;
      
      container.appendChild(line);
      
      // Remove line after animation completes
      setTimeout(() => {
        line.remove();
      }, duration * 1000);
    };
    
    // Create initial lines
    for (let i = 0; i < 15; i++) {
      createFlowLine();
    }
    
    // Add more lines periodically
    const lineInterval = setInterval(() => {
      createFlowLine();
    }, 600);
    
    // Canvas animation for dynamic grid
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Grid parameters
        const gridSize = 40;
        let time = 0;
        
        // Animation loop
        const animate = () => {
          time += 0.05;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw hexagonal grid
          ctx.strokeStyle = 'rgba(0, 226, 202, 0.15)';
          ctx.lineWidth = 0.5;
          
          for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
            for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
              const offsetX = Math.sin(time + x * 0.01) * 5;
              const offsetY = Math.cos(time + y * 0.01) * 5;
              
              ctx.beginPath();
              ctx.moveTo(x + offsetX, y + offsetY);
              ctx.lineTo(x + gridSize/2 + offsetX, y + offsetY);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(x + offsetX, y + offsetY);
              ctx.lineTo(x + offsetX, y + gridSize/2 + offsetY);
              ctx.stroke();
            }
          }
          
          requestAnimationFrame(animate);
        };
        
        animate();
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(lineInterval);
    };
  }, []);
  
  return (
    <>
      {/* Canvas for dynamic grid animation */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-20"
      />
      
      {/* Game-style background with hexagonal pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full game-grid-pattern"></div>
        <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-30 animate-grid-flow"></div>
      </div>
      
      {/* Flow lines container */}
      <div className="flow-line-container absolute inset-0 z-0 overflow-hidden"></div>
      
      {/* Particle container */}
      <div className="particle-container absolute inset-0 z-0 overflow-hidden"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 z-0">
        <div className="hexagon-grid h-full w-full opacity-20"></div>
      </div>
      
      {/* Teal lens flares */}
      <div className="absolute inset-0 z-0">
        <div className="teal-lens-flare fixed top-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-teal-glow opacity-20 animate-pulse-subtle"></div>
        <div className="teal-lens-flare fixed top-[60%] left-[70%] w-[200px] h-[200px] rounded-full bg-teal-glow opacity-15 animate-pulse-subtle" style={{animationDelay: '1s'}}></div>
      </div>
    </>
  );
};

export default BackgroundEffects;
