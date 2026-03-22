"use client";

import { useEffect, useRef } from "react";

interface HypeGaugeProps {
  score: number;
  size?: number;
  animated?: boolean;
}

export function HypeGauge({
  score,
  size = 240,
  animated = true,
}: HypeGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedScore = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    const getColor = (val: number) => {
      if (val <= 30) return "#22c55e";
      if (val <= 50) return "#eab308";
      if (val <= 70) return "#f97316";
      return "#ef4444";
    };

    const draw = (currentScore: number) => {
      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();

      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (totalAngle * i) / 10;
        const isMajor = i % 5 === 0;
        const innerR = radius - (isMajor ? 20 : 14);
        const outerR = radius - 8;
        ctx.beginPath();
        ctx.moveTo(
          cx + innerR * Math.cos(angle),
          cy + innerR * Math.sin(angle),
        );
        ctx.lineTo(
          cx + outerR * Math.cos(angle),
          cy + outerR * Math.sin(angle),
        );
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
      }

      if (currentScore > 0) {
        const valueAngle = startAngle + (totalAngle * currentScore) / 100;
        const gradient = ctx.createLinearGradient(
          cx + radius * Math.cos(startAngle),
          cy + radius * Math.sin(startAngle),
          cx + radius * Math.cos(valueAngle),
          cy + radius * Math.sin(valueAngle),
        );
        gradient.addColorStop(0, "#22c55e");
        gradient.addColorStop(0.4, "#eab308");
        gradient.addColorStop(0.7, "#f97316");
        gradient.addColorStop(1, "#ef4444");

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, valueAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, valueAngle);
        ctx.strokeStyle = getColor(currentScore) + "40";
        ctx.lineWidth = 24;
        ctx.stroke();

        const dotX = cx + radius * Math.cos(valueAngle);
        const dotY = cy + radius * Math.sin(valueAngle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = getColor(currentScore);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
        ctx.fillStyle = getColor(currentScore) + "30";
        ctx.fill();
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${size * 0.2}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = getColor(currentScore);
      ctx.fillText(Math.round(currentScore).toString(), cx, cy - 8);

      ctx.font = `500 ${size * 0.055}px 'Inter', sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("HYPE SCORE", cx, cy + size * 0.1);

      ctx.font = `500 ${size * 0.042}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = "#22c55e80";
      const lx = cx + (radius + 24) * Math.cos(startAngle);
      const ly = cy + (radius + 24) * Math.sin(startAngle);
      ctx.fillText("REAL", lx + 10, ly);

      ctx.fillStyle = "#ef444480";
      const rx = cx + (radius + 24) * Math.cos(endAngle);
      const ry = cy + (radius + 24) * Math.sin(endAngle);
      ctx.fillText("HYPE", rx - 10, ry);
    };

    if (animated) {
      const startTime = performance.now();
      const duration = 1500;
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        animatedScore.current = eased * score;
        draw(animatedScore.current);
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    } else {
      draw(score);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [score, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="drop-shadow-lg"
    />
  );
}
