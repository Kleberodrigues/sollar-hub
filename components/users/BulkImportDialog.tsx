'use client';

/**
 * Bulk Import Dialog Component
 *
 * Modal para importação em massa de usuários via CSV/XLSX
 * Inclui drag-and-drop, preview com validação e envio de convites
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  FileUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  Users,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  parseAndValidateImportFile,
  bulkImportUsers,
  sendBulkInvites,
  generateBulkImportTemplate,
} from '@/app/dashboard/users/bulk-import-actions';
import type {
  BulkImportValidationResult,
  BulkImportResult,
  BulkImportRow,
} from '@/lib/validations/bulk-import';

interface Department {
  id: string;
  name: string;
}

interface BulkImportDialogProps {
  departments: Department[];
  onImportComplete?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function BulkImportDialog({
  departments,
  onImportComplete,
}: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<BulkImportValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendInvites, setSendInvites] = useState(true);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [sendingInvites, setSendingInvites] = useState(false);

  // Reset state ao fechar
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('upload');
      setFile(null);
      setValidation(null);
      setImportResult(null);
      setSendInvites(true);
    }, 200);
  };

  // Processar arquivo
  const processFile = useCallback(async (uploadedFile: File) => {
    // Validar tamanho (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 10MB');
      return;
    }

    // Validar tipo
    const extension = uploadedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx'].includes(extension || '')) {
      toast.error('Tipo de arquivo não suportado. Use CSV ou XLSX.');
      return;
    }

    setIsLoading(true);
    setFile(uploadedFile);

    try {
      let content: string;
      const fileType = extension as 'csv' | 'xlsx';

      if (fileType === 'csv') {
        content = await uploadedFile.text();
      } else {
        // For XLSX, convert to base64
        const buffer = await uploadedFile.arrayBuffer();
        content = Buffer.from(buffer).toString('base64');
      }

      // Parse and validate
      const result = await parseAndValidateImportFile(content, fileType);

      if (!result.success) {
        toast.error(result.error || 'Erro ao processar arquivo');
        setIsLoading(false);
        return;
      }

      setValidation(result.validation || null);
      setStep('preview');
    } catch (error) {
      console.error('[BulkImport] Parse error:', error);
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
  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      setIsLoading(true);
      const result = await generateBulkImportTemplate(format);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao gerar template');
        return;
      }

      // Download
      if (format === 'csv') {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || 'template-importacao-usuarios.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // XLSX is base64 encoded
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || 'template-importacao-usuarios.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

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
    if (!validation || validation.validRows === 0) return;

    // Get valid rows data
    const validRows = validation.rows
      .filter((r) => r.valid && r.data)
      .map((r) => r.data as BulkImportRow);

    if (validRows.length === 0) {
      toast.error('Nenhum usuário válido para importar');
      return;
    }

    setStep('importing');
    setIsLoading(true);

    try {
      const result = await bulkImportUsers(validRows, { sendInvites });
      setImportResult(result);
      setStep('complete');

      if (result.success) {
        toast.success(`${result.successful} usuário(s) importado(s)!`);
        onImportComplete?.();
      } else if (result.successful > 0) {
        toast.warning(`${result.successful} importados, ${result.failed} falharam`);
        onImportComplete?.();
      } else {
        toast.error('Falha ao importar usuários');
      }
    } catch (error) {
      console.error('[BulkImport] Error:', error);
      toast.error('Erro ao importar usuários');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar convites manualmente
  const handleSendInvites = async () => {
    if (!importResult?.createdUserIds.length) return;

    setSendingInvites(true);
    try {
      const result = await sendBulkInvites(importResult.createdUserIds);

      if (result.success) {
        toast.success(`${result.sentCount} convite(s) enviado(s)!`);
        setImportResult((prev) =>
          prev ? { ...prev, invitesSent: result.sentCount } : null
        );
      } else {
        toast.warning(
          `${result.sentCount} enviados, ${result.failedCount} falharam`
        );
      }
    } catch (error) {
      console.error('[SendInvites] Error:', error);
      toast.error('Erro ao enviar convites');
    } finally {
      setSendingInvites(false);
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role: string): "default" | "success" | "warning" | "outline" => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'success';
      case 'member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Importar em Massa
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Importar Usuários'}
            {step === 'preview' && 'Revisar Importação'}
            {step === 'importing' && 'Importando...'}
            {step === 'complete' && 'Importação Concluída'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Faça upload de um arquivo CSV ou Excel com os dados dos usuários'}
            {step === 'preview' && `${validation?.validRows || 0} usuários prontos para importar`}
            {step === 'importing' && 'Aguarde enquanto processamos os dados'}
            {step === 'complete' && `${importResult?.successful || 0} usuários importados com sucesso`}
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
                    Arraste um arquivo CSV ou Excel aqui
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou clique para selecionar (máx. 500 usuários)
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            {/* Download Template */}
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    disabled={isLoading}
                    className="gap-2 text-muted-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Baixar template
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownloadTemplate('csv')}>
                    Template CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadTemplate('xlsx')}>
                    Template Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Formato esperado:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• <strong>email</strong> - Email do usuário (obrigatório)</li>
                <li>• <strong>nome</strong> - Nome completo (obrigatório)</li>
                <li>• <strong>departamento</strong> - Nome do departamento (opcional)</li>
                <li>• <strong>cargo</strong> - admin, manager, member ou viewer (obrigatório)</li>
              </ul>
              {departments.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Departamentos disponíveis: {departments.map((d) => d.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && validation && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{file?.name}</Badge>
              <span className="text-muted-foreground">
                {validation.totalRows} linhas • {validation.validRows} válidas •{' '}
                {validation.invalidRows} com erros
              </span>
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-2">
                  <XCircle className="h-4 w-4" />
                  {validation.errors.length} erro(s) encontrado(s)
                </div>
                <ScrollArea className="h-24">
                  <ul className="text-xs text-red-700 space-y-1">
                    {validation.errors.slice(0, 10).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {validation.errors.length > 10 && (
                      <li className="font-medium">
                        ... e mais {validation.errors.length - 10} erros
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  {validation.warnings.length} aviso(s)
                </div>
                <ScrollArea className="h-20">
                  <ul className="text-xs text-amber-700 space-y-1">
                    {validation.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                    {validation.warnings.length > 5 && (
                      <li className="font-medium">
                        ... e mais {validation.warnings.length - 5} avisos
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Preview Table */}
            {validation.validRows > 0 && (
              <div className="border rounded-lg">
                <ScrollArea className="h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead className="w-12">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.rows.slice(0, 15).map((row, i) => (
                        <TableRow
                          key={i}
                          className={cn(!row.valid && 'bg-red-50/50')}
                        >
                          <TableCell className="text-muted-foreground text-xs">
                            {row.row}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.data?.email || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.data?.fullName || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.data?.department || '-'}
                          </TableCell>
                          <TableCell>
                            {row.data?.role && (
                              <Badge variant={getRoleBadgeVariant(row.data.role)}>
                                {row.data.role}
                              </Badge>
                            )}
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
                {validation.rows.length > 15 && (
                  <div className="text-xs text-center py-2 text-muted-foreground border-t">
                    Mostrando 15 de {validation.rows.length} linhas
                  </div>
                )}
              </div>
            )}

            {/* Send Invites Checkbox */}
            {validation.validRows > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="sendInvites"
                  checked={sendInvites}
                  onCheckedChange={(checked) => setSendInvites(checked === true)}
                />
                <Label
                  htmlFor="sendInvites"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Enviar email de convite automaticamente após importar
                </Label>
              </div>
            )}
          </div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-pm-terracotta mb-4" />
            <p className="text-sm text-muted-foreground">
              Importando {validation?.validRows} usuários...
            </p>
            {sendInvites && (
              <p className="text-xs text-muted-foreground mt-2">
                Enviando convites por email...
              </p>
            )}
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && importResult && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">
                {importResult.successful} usuário(s) importado(s)!
              </p>
              {importResult.invitesSent > 0 && (
                <p className="text-sm text-muted-foreground">
                  {importResult.invitesSent} convite(s) enviado(s)
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">
                  {importResult.successful}
                </p>
                <p className="text-xs text-green-700">Importados</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-600">
                  {importResult.failed}
                </p>
                <p className="text-xs text-red-700">Falharam</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">
                  {importResult.invitesSent}
                </p>
                <p className="text-xs text-blue-700">Convites</p>
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-2">
                  <XCircle className="h-4 w-4" />
                  Erros na importação
                </div>
                <ScrollArea className="h-24">
                  <ul className="text-xs text-red-700 space-y-1">
                    {importResult.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>
                        • Linha {err.row}: {err.email} - {err.error}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Send Invites Button (if not sent automatically) */}
            {!sendInvites && importResult.successful > 0 && importResult.invitesSent === 0 && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSendInvites}
                  disabled={sendingInvites}
                  className="gap-2"
                >
                  {sendingInvites ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Enviar convites para todos ({importResult.successful})
                </Button>
              </div>
            )}
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
                disabled={validation?.validRows === 0 || isLoading}
                className="bg-pm-terracotta hover:bg-pm-terracotta-hover"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Importar ${validation?.validRows || 0} usuário(s)`
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
