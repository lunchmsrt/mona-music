'use client';

import { useState, useEffect } from 'react';

interface Background {
  name: string;
  path: string;
  url: string;
}

export function BackgroundSlideshow() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/backgrounds');
        const data = await res.json();
        setBackgrounds(data.backgrounds || []);
      } catch (err) {
        console.error('خطا در خواندن پس‌زمینه‌ها:', err);
      }
    };
    load();
    const reload = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(reload);
  }, []);

  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  if (backgrounds.length === 0) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      {backgrounds.map((bg, index) => (
        <div
          key={bg.name}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          <img
            src={bg.url}
            alt={`Background ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}
    </div>
  );
}