'use client';

/**
 * Participants List Component
 *
 * Lista de participantes importados com opção de ver todos e enviar emails
 */

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ChevronDown, ChevronUp, Mail, Loader2, CheckCircle } from 'lucide-react';
import { sendParticipantEmails } from '@/app/dashboard/assessments/participant-import-actions';

interface Participant {
  id: string;
  email: string;
  name: string;
  department: string | null;
  role: string | null;
  status: 'pending' | 'sent' | 'responded' | 'bounced' | 'opted_out';
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  assessmentId: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'text-yellow-600' },
  sent: { label: 'Enviado', color: 'text-blue-600' },
  responded: { label: 'Respondido', color: 'text-green-600' },
  bounced: { label: 'Erro', color: 'text-red-600' },
  opted_out: { label: 'Opt-out', color: 'text-gray-600' },
};

export function ParticipantsList({ participants, assessmentId }: ParticipantsListProps) {
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const count = participants.length;
  const pendingCount = participants.filter(p => p.status === 'pending').length;
  const displayedParticipants = showAll ? participants : participants.slice(0, 10);
  const hasMore = count > 10;

  const handleSendEmails = () => {
    setResult(null);
    startTransition(async () => {
      const response = await sendParticipantEmails(assessmentId);
      setResult({
        success: response.success,
        message: response.success
          ? response.message || 'Emails enviados com sucesso!'
          : response.error || 'Erro ao enviar emails',
      });
    });
  };

  if (count === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participantes Importados
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {count} participante(s)
            </span>
          </div>

          {/* Botão Enviar E-mail */}
          {pendingCount > 0 && (
            <Button
              onClick={handleSendEmails}
              disabled={isPending}
              className="gap-2 bg-pm-green-dark hover:bg-pm-green-dark-hover"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar E-mail ({pendingCount})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Feedback de resultado */}
        {result && (
          <div className={`mt-3 p-3 rounded-md flex items-center gap-2 ${
            result.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.success && <CheckCircle className="w-4 h-4" />}
            <span className="text-sm">{result.message}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className={showAll && count > 15 ? 'h-[400px]' : undefined}>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase border-b pb-2">
              <span>Nome</span>
              <span>Email</span>
              <span>Departamento</span>
              <span>Cargo</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {displayedParticipants.map((p) => {
              const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-5 gap-4 text-sm py-2 border-b border-border/50"
                >
                  <span className="font-medium truncate">{p.name}</span>
                  <span className="text-muted-foreground truncate">{p.email}</span>
                  <span className="text-muted-foreground">{p.department || '-'}</span>
                  <span className="text-muted-foreground">{p.role || '-'}</span>
                  <span className={statusConfig.color}>
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Ver mais / Ver menos */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Ver todos ({count - 10} mais)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
