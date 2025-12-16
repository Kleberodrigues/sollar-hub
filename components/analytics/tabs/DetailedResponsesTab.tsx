'use client';

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  List,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Shield,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryName } from "@/app/dashboard/analytics/utils";
import { ANONYMITY_THRESHOLDS } from "@/lib/constants/anonymity-thresholds";
import { Progress } from "@/components/ui/progress";

interface DetailedResponse {
  id: string;
  anonymousId: string;
  questionText: string;
  category: string;
  responseText: string;
  responseValue?: number;
  createdAt: string;
}

interface DetailedResponsesTabProps {
  responses: DetailedResponse[];
  categories: string[];
  totalParticipants?: number;
}

const ITEMS_PER_PAGE = 20;

export function DetailedResponsesTab({
  responses,
  categories,
  totalParticipants
}: DetailedResponsesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate unique participants from responses if totalParticipants not provided
  const participantCount = useMemo(() => {
    if (totalParticipants !== undefined) return totalParticipants;
    const uniqueIds = new Set(responses.map(r => r.anonymousId));
    return uniqueIds.size;
  }, [responses, totalParticipants]);

  // Check if detailed responses should be suppressed
  const isSuppressed = participantCount < ANONYMITY_THRESHOLDS.DETAILED_RESPONSES;
  const remaining = Math.max(0, ANONYMITY_THRESHOLDS.DETAILED_RESPONSES - participantCount);
  const percentComplete = Math.min(100, (participantCount / ANONYMITY_THRESHOLDS.DETAILED_RESPONSES) * 100);

  // Filter responses
  const filteredResponses = responses.filter(response => {
    const matchesSearch = searchTerm === "" ||
      response.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.responseText.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      response.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getResponseBadge = (value?: number) => {
    if (!value) return null;
    const colors = {
      1: "bg-green-100 text-green-700",
      2: "bg-green-50 text-green-600",
      3: "bg-yellow-100 text-yellow-700",
      4: "bg-orange-100 text-orange-700",
      5: "bg-red-100 text-red-700",
    };
    return colors[value as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  // Empty state
  if (responses.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pm-olive/20 to-pm-terracotta/10 flex items-center justify-center">
              <List className="w-8 h-8 text-pm-olive" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-heading mb-2">
              Respostas Detalhadas
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              As respostas individuais aparecerão aqui quando houver participantes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Suppression state - protect anonymity when insufficient participants
  if (isSuppressed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <CardContent className="py-12 px-6">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
                <Shield className="w-10 h-10 text-amber-600" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-display font-semibold text-amber-900 mb-2">
                  Respostas Protegidas
                </h3>
                <p className="text-amber-800 max-w-lg mx-auto">
                  Para garantir o anonimato dos respondentes e evitar a identificação individual,
                  as respostas detalhadas só são exibidas quando há no mínimo{' '}
                  <span className="font-semibold">{ANONYMITY_THRESHOLDS.DETAILED_RESPONSES} participantes</span>.
                </p>
              </div>

              {/* Progress Section */}
              <div className="max-w-sm mx-auto space-y-3">
                <Progress
                  value={percentComplete}
                  className="h-3 bg-amber-200"
                />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-700">
                    <span className="font-semibold text-amber-900">{participantCount}</span> participantes atuais
                  </span>
                  <span className="text-amber-600">
                    Faltam <span className="font-semibold">{remaining}</span>
                  </span>
                </div>
              </div>

              {/* Info badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm">
                <Lock className="w-4 h-4" />
                <span>Proteção de anonimato ativa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Buscar em perguntas ou respostas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-muted" />
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 text-sm text-text-muted">
              {filteredResponses.length} respostas encontradas
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Responses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-l-4 border-l-pm-olive">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pm-olive/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-pm-olive" />
            </div>
            <CardTitle className="font-display text-xl text-text-heading">
              Respostas Individuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg-secondary">
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Pergunta</TableHead>
                    <TableHead className="w-[150px]">Categoria</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead className="w-[80px]">Valor</TableHead>
                    <TableHead className="w-[120px]">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResponses.map((response, index) => (
                    <motion.tr
                      key={response.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-bg-sage/50"
                    >
                      <TableCell className="font-mono text-xs text-text-muted">
                        {response.anonymousId.substring(0, 8)}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm text-text-heading line-clamp-2">
                          {response.questionText}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(response.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm line-clamp-2">
                          {response.responseText}
                        </p>
                      </TableCell>
                      <TableCell>
                        {response.responseValue && (
                          <Badge className={cn("text-xs", getResponseBadge(response.responseValue))}>
                            {response.responseValue}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {new Date(response.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-text-muted">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
