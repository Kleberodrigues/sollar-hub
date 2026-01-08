'use client';

/**
 * Participant Import Dialog Component
 *
 * Modal para importação de participantes via CSV
 * para envio automatizado de emails via n8n
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
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  importParticipants,
  generateParticipantTemplate,
  type ParticipantRow,
} from '@/app/dashboard/assessments/participant-import-actions';

interface ParticipantImportDialogProps {
  assessmentId: string;
  assessmentTitle: string;
  onImportComplete?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

interface ParsedRow extends ParticipantRow {
  valid: boolean;
  errors: string[];
}

interface ParseResult {
  rows: ParsedRow[];
  validCount: number;
  invalidCount: number;
  errors: string[];
}

function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { rows: [], validCount: 0, invalidCount: 0, errors: ['Arquivo vazio'] };
  }

  // Detectar separador (ponto-e-vírgula ou vírgula)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  // Parse header
  const header = firstLine.toLowerCase().split(separator).map(h => h.trim());
  const emailIdx = header.findIndex(h => h === 'email' || h === 'e-mail');
  const nameIdx = header.findIndex(h => h === 'nome' || h === 'name');
  const deptIdx = header.findIndex(h => h === 'departamento' || h === 'department' || h === 'depto');
  const roleIdx = header.findIndex(h => h === 'lideranca' || h === 'liderança' || h === 'cargo' || h === 'role');

  if (emailIdx === -1) {
    errors.push('Coluna "email" não encontrada no cabeçalho');
  }
  if (nameIdx === -1) {
    errors.push('Coluna "nome" não encontrada no cabeçalho');
  }

  if (errors.length > 0) {
    return { rows: [], validCount: 0, invalidCount: 0, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim());
    const rowErrors: string[] = [];

    const email = values[emailIdx] || '';
    const name = values[nameIdx] || '';
    const department = deptIdx >= 0 ? values[deptIdx] : undefined;
    const role = roleIdx >= 0 ? values[roleIdx] : undefined;

    // Validate
    if (!email) {
      rowErrors.push('Email vazio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      rowErrors.push('Email inválido');
    }

    if (!name || name.length < 2) {
      rowErrors.push('Nome inválido');
    }

    rows.push({
      email,
      name,
      department,
      role,
      valid: rowErrors.length === 0,
      errors: rowErrors,
    });
  }

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return { rows, validCount, invalidCount, errors };
}

export function ParticipantImportDialog({
  assessmentId,
  assessmentTitle,
  onImportComplete,
}: ParticipantImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message?: string;
    importedCount?: number;
  } | null>(null);

  // Reset state ao fechar
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('upload');
      setFile(null);
      setParseResult(null);
      setImportResult(null);
    }, 200);
  };

  // Processar arquivo
  const processFile = useCallback(async (uploadedFile: File) => {
    // Validar tamanho (max 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    // Validar tipo
    const extension = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv') {
      toast.error('Use um arquivo CSV');
      return;
    }

    setIsLoading(true);
    setFile(uploadedFile);

    try {
      const content = await uploadedFile.text();
      const result = parseCSV(content);
      setParseResult(result);
      setStep('preview');
    } catch (error) {
      console.error('[ParticipantImport] Parse error:', error);
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const result = await generateParticipantTemplate();

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao gerar template');
        return;
      }

      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename || 'template-participantes.csv';
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
    if (!parseResult || parseResult.validCount === 0) return;

    setStep('importing');
    setIsLoading(true);

    try {
      const validRows = parseResult.rows
        .filter(r => r.valid)
        .map(r => ({
          email: r.email,
          name: r.name,
          department: r.department,
          role: r.role,
        }));

      const result = await importParticipants(assessmentId, validRows);

      if (result.success) {
        setImportResult({
          success: true,
          message: result.message,
          importedCount: result.importedCount,
        });
        setStep('complete');
        onImportComplete?.();
      } else {
        toast.error(result.error || 'Erro ao importar');
        setStep('preview');
      }
    } catch (error) {
      console.error('[Import] Error:', error);
      toast.error('Erro ao importar participantes');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Participantes
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Importar Participantes'}
            {step === 'preview' && 'Revisar Importação'}
            {step === 'importing' && 'Importando...'}
            {step === 'complete' && 'Importação Concluída'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && `Importe participantes para "${assessmentTitle}"`}
            {step === 'preview' && `${parseResult?.validCount || 0} participantes prontos para importar`}
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
                'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
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
                    accept=".csv"
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

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Formato esperado:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• <strong>email</strong> - Email do participante (obrigatório)</li>
                <li>• <strong>nome</strong> - Nome completo (obrigatório)</li>
                <li>• <strong>departamento</strong> - Departamento (opcional)</li>
                <li>• <strong>lideranca</strong> - Liderança ou Não Liderança (opcional)</li>
              </ul>
            </div>

            {/* Info box about n8n */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm border border-blue-200">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Envio automático</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Após importar, os participantes receberão automaticamente o link da pesquisa por email.
                  </p>
                </div>
              </div>
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
                {parseResult.rows.length} linhas • {parseResult.validCount} válidos • {parseResult.invalidCount} com erros
              </span>
            </div>

            {/* Global Errors */}
            {parseResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-2">
                  <XCircle className="h-4 w-4" />
                  Erros no arquivo
                </div>
                <ul className="text-xs text-red-700 space-y-1">
                  {parseResult.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Row Errors */}
            {parseResult.invalidCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  {parseResult.invalidCount} linha(s) com erros serão ignoradas
                </div>
              </div>
            )}

            {/* Preview Table */}
            {parseResult.rows.length > 0 && (
              <div className="border rounded-lg">
                <ScrollArea className="h-56">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Liderança</TableHead>
                        <TableHead className="w-12">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.rows.slice(0, 20).map((row, i) => (
                        <TableRow
                          key={i}
                          className={cn(!row.valid && 'bg-red-50/50')}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.email || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.name || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.department || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.role || '-'}
                          </TableCell>
                          <TableCell>
                            {row.valid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {parseResult.rows.length > 20 && (
                  <div className="text-xs text-center py-2 text-muted-foreground border-t">
                    Mostrando 20 de {parseResult.rows.length} linhas
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
              Importando {parseResult?.validCount} participantes...
            </p>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">
              {importResult?.importedCount} participante(s) importado(s)!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os participantes receberão o link da pesquisa por email.
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
                disabled={parseResult?.validCount === 0 || isLoading}
                className="bg-pm-terracotta hover:bg-pm-terracotta-hover"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Importar ${parseResult?.validCount || 0} participante(s)`
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
