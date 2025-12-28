'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, MessageSquare, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WordData {
  text: string;
  value: number;
}

interface TextResponse {
  questionId: string;
  questionText: string;
  responses: string[];
}

interface WordCloudTabProps {
  textResponses: TextResponse[];
}

// Simple word frequency analyzer
function analyzeWords(texts: string[]): WordData[] {
  const stopWords = new Set([
    "de", "da", "do", "das", "dos", "e", "ou", "que", "o", "a", "os", "as",
    "um", "uma", "uns", "umas", "em", "no", "na", "nos", "nas", "com", "para",
    "por", "pelo", "pela", "pelos", "pelas", "se", "ao", "aos", "à", "às",
    "é", "são", "foi", "foram", "ser", "estar", "ter", "haver", "muito",
    "mais", "menos", "como", "quando", "onde", "porque", "mas", "também",
    "já", "ainda", "isso", "isto", "esse", "essa", "este", "esta", "ele",
    "ela", "eles", "elas", "eu", "tu", "você", "nós", "vocês", "meu", "minha",
    "seu", "sua", "nosso", "nossa", "não", "sim", "bem", "mal", "só", "todo",
    "toda", "todos", "todas", "cada", "outro", "outra", "outros", "outras"
  ]);

  const wordCount: Record<string, number> = {};

  texts.forEach(text => {
    const words = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents for matching
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}

// Separate component for frequent words list (to be used in its own card)
export function FrequentWordsList({ textResponses }: WordCloudTabProps) {
  const filteredTexts = textResponses.flatMap(tr => tr.responses);
  const words = useMemo(() => analyzeWords(filteredTexts), [filteredTexts]);

  if (textResponses.length === 0 || filteredTexts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Aguardando respostas de texto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {words.slice(0, 12).map((word, index) => (
        <motion.div
          key={word.text}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          className="flex items-center justify-between p-2.5 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors"
        >
          <span className="font-medium text-text-heading capitalize">
            {word.text}
          </span>
          <span className="text-sm text-text-muted bg-white px-2.5 py-0.5 rounded-full font-medium">
            {word.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function WordCloudTab({ textResponses }: WordCloudTabProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("all");

  const filteredTexts = useMemo(() => {
    if (selectedQuestion === "all") {
      return textResponses.flatMap(tr => tr.responses);
    }
    return textResponses.find(tr => tr.questionId === selectedQuestion)?.responses || [];
  }, [selectedQuestion, textResponses]);

  const words = useMemo(() => analyzeWords(filteredTexts), [filteredTexts]);

  const maxValue = Math.max(...words.map(w => w.value), 1);

  // Color palette for words - matching the reference image
  const getWordColor = (index: number, value: number) => {
    const ratio = value / maxValue;
    // Higher frequency = more prominent colors
    if (ratio > 0.7) {
      return index % 2 === 0 ? "text-pm-olive" : "text-pm-terracotta";
    }
    if (ratio > 0.4) {
      const colors = ["text-pm-green-dark", "text-[#8B7355]", "text-pm-olive-dark"];
      return colors[index % colors.length];
    }
    // Lower frequency = muted colors
    const mutedColors = ["text-[#A89078]", "text-[#6B8E5A]", "text-[#9C7A5A]", "text-[#7A9A6A]"];
    return mutedColors[index % mutedColors.length];
  };

  const getWordSize = (value: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.85) return "text-4xl font-bold";      // Reduced from 5xl
    if (ratio > 0.7) return "text-3xl font-bold";       // Reduced from 4xl
    if (ratio > 0.5) return "text-2xl font-semibold";   // Reduced from 3xl
    if (ratio > 0.35) return "text-xl font-medium";     // Reduced from 2xl
    if (ratio > 0.2) return "text-lg font-medium";      // Reduced from xl
    if (ratio > 0.1) return "text-base";                // Reduced from lg
    return "text-sm";                                    // Reduced from base
  };

  // Rotation angles - subtle for readability
  const getWordRotation = (index: number, ratio: number) => {
    if (ratio > 0.6) return 0; // Large words stay horizontal
    if (ratio > 0.3) {
      const rotations = [-8, 0, 5, 0, -5, 0, 8, 0];
      return rotations[index % rotations.length];
    }
    // Smaller words: subtle rotations only
    const rotations = [-15, -8, 0, 0, 0, 8, 15, -12, 12, 0];
    return rotations[index % rotations.length];
  };

  // Pre-calculated positions - well spaced to avoid overlaps, with safe margins
  const cloudPositions = useMemo(() => {
    const positions = [
      // Center - largest word (index 0)
      { x: 50, y: 48 },
      // Ring 1 - words 1-4 (well spaced around center)
      { x: 25, y: 35 },
      { x: 75, y: 38 },
      { x: 35, y: 65 },
      { x: 68, y: 62 },
      // Ring 2 - words 5-10 (medium distance)
      { x: 20, y: 52 },
      { x: 80, y: 50 },
      { x: 50, y: 25 },
      { x: 45, y: 78 },
      { x: 30, y: 20 },
      { x: 72, y: 22 },
      // Ring 3 - words 11-18 (outer)
      { x: 18, y: 70 },
      { x: 82, y: 68 },
      { x: 55, y: 88 },
      { x: 62, y: 12 },
      { x: 15, y: 40 },
      { x: 85, y: 35 },
      { x: 28, y: 85 },
      { x: 75, y: 82 },
      // Ring 4 - words 19-25 (far edges with safe margin)
      { x: 40, y: 12 },
      { x: 88, y: 55 },
      { x: 12, y: 58 },
      { x: 65, y: 75 },
      { x: 22, y: 28 },
      { x: 78, y: 28 },
      { x: 35, y: 92 },
    ];
    return positions;
  }, []);

  const getWordPosition = (index: number) => {
    if (index < cloudPositions.length) {
      return cloudPositions[index];
    }
    // Fallback - place remaining words in safe positions
    const row = Math.floor((index - cloudPositions.length) / 3);
    const col = (index - cloudPositions.length) % 3;
    return {
      x: 25 + col * 25,
      y: 92 - row * 15
    };
  };

  if (textResponses.length === 0 || filteredTexts.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <Cloud className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Nuvem de Palavras
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              A nuvem de palavras será gerada quando houver respostas de texto
              (sugestões e comentários).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-text-muted" />
              <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Filtrar por pergunta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as respostas de texto</SelectItem>
                  {textResponses.map(tr => (
                    <SelectItem key={tr.questionId} value={tr.questionId}>
                      {tr.questionText.substring(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-text-muted">
                {filteredTexts.length} respostas analisadas
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Word Cloud - Optimized cloud layout with pre-calculated positions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <div className="relative min-h-[380px] w-full px-8 py-4">
          {words.slice(0, 26).map((word, index) => {
            const ratio = word.value / maxValue;
            const rotation = getWordRotation(index, ratio);
            const position = getWordPosition(index);

            return (
              <motion.span
                key={word.text}
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.025,
                  type: "spring",
                  stiffness: 120,
                  damping: 12
                }}
                whileHover={{
                  scale: 1.2,
                  zIndex: 100,
                  transition: { duration: 0.15 }
                }}
                className={cn(
                  "absolute cursor-default transition-all whitespace-nowrap select-none",
                  getWordSize(word.value),
                  getWordColor(index, word.value)
                )}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  zIndex: 40 - index, // Most frequent words on top
                }}
                title={`${word.text}: ${word.value} ocorrências`}
              >
                {word.text}
              </motion.span>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
