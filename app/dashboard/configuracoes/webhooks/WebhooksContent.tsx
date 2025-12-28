'use client';

/**
 * Webhooks Content Component
 * Client-side UI for viewing and filtering webhook events
 */

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Webhook,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  Hash,
} from 'lucide-react';
import { getWebhookEvents, getWebhookStats, type WebhookEvent, type WebhookStats, type WebhookEventsResponse } from './actions';

// Helper function to format date in Brazilian Portuguese
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `ha ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `ha ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `ha ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return formatDateTime(dateString);
}

interface WebhooksContentProps {
  initialStats: WebhookStats | null;
  initialEvents: WebhookEventsResponse;
  eventTypes: string[];
}

// Event type display configuration
const eventTypeConfig: Record<string, { label: string; color: string; icon: 'success' | 'warning' | 'info' }> = {
  'checkout.session.completed': { label: 'Checkout Concluido', color: 'bg-green-100 text-green-700', icon: 'success' },
  'customer.subscription.created': { label: 'Assinatura Criada', color: 'bg-blue-100 text-blue-700', icon: 'info' },
  'customer.subscription.updated': { label: 'Assinatura Atualizada', color: 'bg-amber-100 text-amber-700', icon: 'info' },
  'customer.subscription.deleted': { label: 'Assinatura Cancelada', color: 'bg-red-100 text-red-700', icon: 'warning' },
  'invoice.paid': { label: 'Fatura Paga', color: 'bg-green-100 text-green-700', icon: 'success' },
  'invoice.payment_failed': { label: 'Pagamento Falhou', color: 'bg-red-100 text-red-700', icon: 'warning' },
  'customer.created': { label: 'Cliente Criado', color: 'bg-blue-100 text-blue-700', icon: 'info' },
  'customer.updated': { label: 'Cliente Atualizado', color: 'bg-amber-100 text-amber-700', icon: 'info' },
};

function getEventDisplay(eventType: string) {
  return eventTypeConfig[eventType] || {
    label: eventType.replace(/\./g, ' ').replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-700',
    icon: 'info' as const
  };
}

export function WebhooksContent({ initialStats, initialEvents, eventTypes }: WebhooksContentProps) {
  const [stats, setStats] = useState<WebhookStats | null>(initialStats);
  const [events, setEvents] = useState<WebhookEventsResponse>(initialEvents);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const [newStats, newEvents] = await Promise.all([
        getWebhookStats(),
        getWebhookEvents(page, 20, selectedType === 'all' ? undefined : selectedType),
      ]);
      setStats(newStats);
      setEvents(newEvents);
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    startTransition(async () => {
      const newEvents = await getWebhookEvents(
        newPage,
        20,
        selectedType === 'all' ? undefined : selectedType
      );
      setEvents(newEvents);
    });
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setPage(1);
    startTransition(async () => {
      const newEvents = await getWebhookEvents(
        1,
        20,
        type === 'all' ? undefined : type
      );
      setEvents(newEvents);
    });
  };

  const totalPages = Math.ceil(events.total / 20);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pm-terracotta/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-pm-terracotta" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total de Eventos</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pm-olive/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-pm-olive" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Ultimas 24h</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.last24Hours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Ultimos 7 dias</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.last7Days}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pm-olive/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-pm-olive" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tipos de Evento</p>
                  <p className="text-2xl font-bold text-text-heading">
                    {Object.keys(stats.eventsByType).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events by Type */}
      {stats && Object.keys(stats.eventsByType).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Webhook className="w-5 h-5 text-pm-terracotta" />
              Eventos por Tipo (ultimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.eventsByType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const display = getEventDisplay(type);
                  return (
                    <Badge
                      key={type}
                      variant="outline"
                      className={`${display.color} border-0`}
                    >
                      {display.label}: {count}
                    </Badge>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-pm-olive" />
              Eventos Recentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedType} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEventDisplay(type).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isPending}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {events.error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              {events.error}
            </div>
          ) : events.events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Webhook className="w-12 h-12 mb-4 text-text-muted/50" />
              <p className="text-lg font-medium">Nenhum evento encontrado</p>
              <p className="text-sm">Os eventos de webhook aparecerao aqui quando forem processados</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-bg-secondary/50">
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Tipo de Evento</TableHead>
                      <TableHead className="w-[200px]">ID do Stripe</TableHead>
                      <TableHead className="w-[180px]">Processado em</TableHead>
                      <TableHead className="w-[150px]">Tempo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.events.map((event: WebhookEvent) => {
                      const display = getEventDisplay(event.event_type);
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${display.color} border-0`}
                            >
                              {display.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-muted">
                            {event.stripe_event_id.substring(0, 20)}...
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(event.processed_at)}
                          </TableCell>
                          <TableCell className="text-sm text-text-muted">
                            {formatRelativeTime(event.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-text-muted">
                  Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, events.total)} de {events.total} eventos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isPending}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-text-muted">
                    Pagina {page} de {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!events.hasMore || isPending}
                  >
                    Proxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
