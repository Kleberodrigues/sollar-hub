'use client';

/**
 * Import Dialog Component
 *
 * Modal para importação de dados CSV/XLSX
 * Inclui drag-and-drop, preview e validação
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  parseCSV,
  validateImportData,
  validateFileSize,
  validateFileType,
  type ParseResult,
} from '@/lib/imports/csv-parser';
import {
  importResponses,
  getAssessmentQuestionIds,
  generateImportTemplate,
} from '@/app/dashboard/analytics/import-actions';
import type { PlanType } from '@/lib/stripe/config';

interface ImportDialogProps {
  assessmentId: string;
  currentPlan?: PlanType;
  onImportComplete?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function ImportDialog({
  assessmentId,
  currentPlan: _currentPlan = 'base',
  onImportComplete,
}: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message?: string;
    importedCount?: number;
  } | null>(null);

  // All plans have access to import features
  const _canImport = true;

  // Reset state ao fechar
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('upload');
      setFile(null);
      setParseResult(null);
      setValidationErrors([]);
      setValidationWarnings([]);
      setImportResult(null);
    }, 200);
  };

  // Processar arquivo
  const processFile = useCallback(async (uploadedFile: File) => {
    // Validar arquivo
    const sizeValidation = validateFileSize(uploadedFile);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error);
      return;
    }

    const typeValidation = validateFileType(uploadedFile);
    if (!typeValidation.valid) {
      toast.error(typeValidation.error);
      return;
    }

    setIsLoading(true);
    setFile(uploadedFile);

    try {
      // Ler arquivo
      const content = await uploadedFile.text();

      // Parsear CSV
      const result = parseCSV(content);
      setParseResult(result);

      if (result.errors.length > 0) {
        setValidationErrors(result.errors);
        setStep('preview');
        return;
      }

      // Buscar question_ids válidos
      const validation = await getAssessmentQuestionIds(assessmentId);

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setStep('preview');
        return;
      }

      // Validar dados
      const dataValidation = validateImportData(result.data, {
        questionIds: validation.questionIds,
        maxRows: 10000,
      });

      setValidationErrors(dataValidation.errors);
      setValidationWarnings([...result.warnings, ...dataValidation.warnings]);
      setStep('preview');
    } catch (error) {
      console.error('[Import] Parse error:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  // File input handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      const result = await generateImportTemplate(assessmentId);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao gerar template');
        return;
      }

      // Download
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename || 'template-import.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Template baixado!');
    } catch (error) {
      console.error('[Template] Error:', error);
      toast.error('Erro ao baixar template');
    } finally {
      setIsLoading(false);
    }
  };

  // Executar import
  const handleImport = async () => {
    if (!parseResult?.data || validationErrors.length > 0) return;

    setStep('importing');
    setIsLoading(true);

    try {
      const result = await importResponses(assessmentId, parseResult.data);

      if (result.success) {
        setImportResult({
          success: true,
          message: result.message,
          importedCount: result.importedCount,
        });
        setStep('complete');
        onImportComplete?.();
      } else {
        if (result.upgradeRequired) {
          toast.error(result.error, {
            action: {
              label: 'Ver planos',
              onClick: () => window.location.href = '/dashboard/configuracoes/billing',
            },
          });
          handleClose();
        } else {
          setValidationErrors([result.error || 'Erro desconhecido']);
          setStep('preview');
        }
      }
    } catch (error) {
      console.error('[Import] Error:', error);
      toast.error('Erro ao importar dados');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Importar Dados'}
            {step === 'preview' && 'Revisar Importação'}
            {step === 'importing' && 'Importando...'}
            {step === 'complete' && 'Importação Concluída'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Faça upload de um arquivo CSV com as respostas'}
            {step === 'preview' && `${parseResult?.validRows || 0} linhas prontas para importar`}
            {step === 'importing' && 'Aguarde enquanto processamos os dados'}
            {step === 'complete' && importResult?.message}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging
                  ? 'border-pm-terracotta bg-pm-terracotta/5'
                  : 'border-border hover:border-pm-terracotta/50'
              )}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-pm-terracotta" />
                  <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                </div>
              ) : (
                <>
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    Arraste um arquivo CSV aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            {/* Download Template */}
            <div className="flex justify-center">
              <Button
                variant="link"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isLoading}
                className="gap-2 text-muted-foreground"
              >
                <Download className="h-3 w-3" />
                Baixar template CSV
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{file?.name}</Badge>
              <span className="text-muted-foreground">
                {parseResult.totalRows} linhas • {parseResult.validRows} válidas
              </span>
            </div>

            {/* Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-2">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.length} erro(s) encontrado(s)
                </div>
                <ScrollArea className="h-24">
                  <ul className="text-xs text-red-700 space-y-1">
                    {validationErrors.slice(0, 10).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {validationErrors.length > 10 && (
                      <li className="font-medium">
                        ... e mais {validationErrors.length - 10} erros
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Warnings */}
            {validationWarnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  {validationWarnings.length} aviso(s)
                </div>
                <ScrollArea className="h-20">
                  <ul className="text-xs text-amber-700 space-y-1">
                    {validationWarnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Preview Table */}
            {parseResult.data.length > 0 && validationErrors.length === 0 && (
              <div className="border rounded-lg">
                <ScrollArea className="h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Participante</TableHead>
                        <TableHead>Resposta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.data.slice(0, 10).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.anonymous_id.substring(0, 12)}...
                          </TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {row.response_text}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {parseResult.data.length > 10 && (
                  <div className="text-xs text-center py-2 text-muted-foreground border-t">
                    Mostrando 10 de {parseResult.data.length} linhas
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-pm-terracotta mb-4" />
            <p className="text-sm text-muted-foreground">
              Importando {parseResult?.validRows} respostas...
            </p>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">
              {importResult?.importedCount} respostas importadas!
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Voltar
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationErrors.length > 0 || isLoading}
                className="bg-pm-terracotta hover:bg-pm-terracotta-hover"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Importar ${parseResult?.validRows || 0} linhas`
                )}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
