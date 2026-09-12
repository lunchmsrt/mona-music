'use client';

import { useState, useEffect } from 'react';

const slides = [
  '/mona/qermezdasht.jpg',
  '/mona/zarddasht.jpg',
];

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {slides.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          <img
            src={src}
            alt={`Mona album ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}
    </div>
  );
}