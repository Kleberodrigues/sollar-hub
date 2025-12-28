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
    if (ratio > 0.85) return "text-5xl font-bold";
    if (ratio > 0.7) return "text-4xl font-bold";
    if (ratio > 0.5) return "text-3xl font-semibold";
    if (ratio > 0.35) return "text-2xl font-medium";
    if (ratio > 0.2) return "text-xl font-medium";
    if (ratio > 0.1) return "text-lg";
    return "text-base";
  };

  // Rotation angles for organic cloud effect
  const getWordRotation = (index: number) => {
    const rotations = [-15, -10, -5, 0, 0, 0, 5, 10, 15, -8, 8, -3, 3];
    return rotations[index % rotations.length];
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

      {/* Word Cloud + Top Words Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word Cloud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-pm-olive h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-pm-olive" />
              </div>
              <div>
                <CardTitle className="font-display text-xl text-text-heading">
                  Nuvem de Palavras
                </CardTitle>
                <p className="text-sm text-text-muted">
                  Visualização das palavras mais frequentes
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-wrap gap-x-2 gap-y-1 justify-center items-center py-6 min-h-[300px] px-4">
                {words.map((word, index) => {
                  const rotation = getWordRotation(index);
                  return (
                    <motion.span
                      key={word.text}
                      initial={{
                        opacity: 0,
                        scale: 0,
                        rotate: rotation - 20,
                        y: 30
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: rotation,
                        y: 0
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{
                        scale: 1.15,
                        transition: { duration: 0.2 }
                      }}
                      className={cn(
                        "cursor-default transition-all inline-block leading-tight",
                        getWordSize(word.value),
                        getWordColor(index, word.value)
                      )}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        marginLeft: index % 3 === 0 ? '-0.25rem' : undefined,
                        marginRight: index % 4 === 0 ? '-0.25rem' : undefined,
                      }}
                      title={`${word.text}: ${word.value} ocorrências`}
                    >
                      {word.text}
                    </motion.span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Words List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-pm-terracotta h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pm-terracotta/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-pm-terracotta" />
              </div>
              <CardTitle className="font-display text-xl text-text-heading">
                Palavras Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {words.slice(0, 20).map((word, index) => (
                  <motion.div
                    key={word.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-bg-secondary overflow-hidden"
                    title={word.text}
                  >
                    <span className="font-medium text-text-heading capitalize truncate flex-1 min-w-0">
                      {word.text}
                    </span>
                    <span className="text-sm text-text-muted bg-white px-2 py-0.5 rounded flex-shrink-0">
                      {word.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
