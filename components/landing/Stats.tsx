'use client';

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Building2, Users, Award, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: 50,
    suffix: "+",
    label: "Empresas",
    description: "confiam na PsicoMapa",
  },
  {
    icon: Users,
    value: 5000,
    suffix: "+",
    label: "Colaboradores",
    description: "avaliados",
  },
  {
    icon: Award,
    value: 98,
    suffix: "%",
    label: "Satisfação",
    description: "dos clientes",
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: "%",
    label: "Compliance",
    description: "NR-1 / NR-17",
  },
];

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useCountUp(stat.value, 2000, isInView);

  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-pm-olive/10 rounded-xl mb-4">
        <Icon className="w-7 h-7 text-pm-olive" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-text-heading mb-1">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-lg font-semibold text-text-primary">{stat.label}</div>
      <div className="text-sm text-text-muted">{stat.description}</div>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
