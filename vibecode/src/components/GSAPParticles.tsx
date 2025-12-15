"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GSAPParticles() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const particleCount = 20;
        const particles: HTMLDivElement[] = [];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            const size = Math.random() * 6 + 2; // 2px to 8px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
            particle.style.position = "absolute";
            particle.style.borderRadius = "50%";
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.pointerEvents = "none";
            container.appendChild(particle);
            particles.push(particle);
        }

        // Animate particles
        particles.forEach((p) => {
            gsap.to(p, {
                x: `random(-100, 100)`,
                y: `random(-100, 100)`,
                rotation: `random(0, 360)`,
                opacity: `random(0, 0.5)`,
                duration: `random(10, 20)`,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        });

        // Cleanup
        return () => {
            particles.forEach((p) => p.remove());
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0" />;
}
