/**
 * Plano de Ação - PDF Template
 *
 * Template para o relatório de plano de ação com prioridades
 */

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import {
  styles,
  COLORS,
  PDFHeader,
  PDFFooter,
  PDFNarrativeBlock,
} from '../components';
import type { PlanoAcaoReport } from '@/app/dashboard/analytics/reports/types';

interface PlanoAcaoPDFProps {
  data: PlanoAcaoReport;
}

export const PlanoAcaoPDF: React.FC<PlanoAcaoPDFProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Cor baseada na prioridade
  const getPriorityColor = (priority: number) => {
    if (priority === 1) return COLORS.riskHigh;
    if (priority === 2) return COLORS.riskMedium;
    return COLORS.olive;
  };

  // Cor baseada no esforço
  const getEffortColor = (effort: string) => {
    if (effort === 'high') return COLORS.riskHigh;
    if (effort === 'medium') return COLORS.riskMedium;
    return COLORS.riskLow;
  };

  const getEffortLabel = (effort: string) => {
    if (effort === 'high') return 'Alto';
    if (effort === 'medium') return 'Médio';
    return 'Baixo';
  };

  return (
    <Document>
      {/* Capa */}
      <Page size="A4" style={styles.coverPage}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
        >
          <Text style={styles.coverTitle}>Plano de Ação</Text>
          <Text style={styles.coverSubtitle}>{data.metadata.assessmentTitle}</Text>
          <Text style={styles.coverMeta}>{data.metadata.organizationName}</Text>
          <Text style={styles.coverMeta}>
            Período: {formatDate(data.metadata.period.start)} a{' '}
            {formatDate(data.metadata.period.end)}
          </Text>
          <Text style={[styles.coverMeta, { marginTop: 20 }]}>
            {data.priorities.length} Prioridades | {data.backlog.length} Temas no Backlog
          </Text>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>Gestão de Riscos Psicossociais - NR-1</Text>
          <Text style={styles.coverFooterText}>
            Gerado em: {formatDate(data.metadata.generatedAt)}
          </Text>
        </View>
      </Page>

      {/* Resumo Executivo */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title="Resumo Executivo"
          organizationName={data.metadata.organizationName}
        />

        <PDFNarrativeBlock
          title="Visão Geral do Plano"
          content={data.summary}
        />

        {/* Métricas */}
        <View style={styles.section}>
          <View style={[styles.row, { gap: 10 }]}>
            <View style={[styles.metricCard, { width: '30%' }]}>
              <Text style={styles.metricLabel}>Participantes</Text>
              <Text style={styles.metricValue}>{data.metadata.participants}</Text>
            </View>
            <View style={[styles.metricCard, { width: '30%' }]}>
              <Text style={styles.metricLabel}>Taxa de Resposta</Text>
              <Text style={styles.metricValue}>{data.metadata.responseRate}%</Text>
            </View>
            <View style={[styles.metricCard, { width: '30%' }]}>
              <Text style={styles.metricLabel}>Prioridades</Text>
              <Text style={styles.metricValue}>{data.priorities.length}</Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Prioridades de Ação */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Prioridades de Ação" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Prioritárias</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            As seguintes ações foram identificadas como prioritárias com base na análise dos dados.
            Ordenadas por urgência, começando pela mais crítica.
          </Text>

          {data.priorities.map((priority) => (
            <View key={priority.id} style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <View style={[styles.row, styles.alignCenter, { gap: 10 }]}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: getPriorityColor(priority.priority),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                      {priority.priority}
                    </Text>
                  </View>
                  <Text style={styles.actionTitle}>{priority.theme}</Text>
                </View>
              </View>

              <Text style={[styles.cardContent, { marginTop: 8 }]}>
                {priority.description}
              </Text>

              {priority.evidence.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.metricLabel, { marginBottom: 4 }]}>EVIDÊNCIAS:</Text>
                  {priority.evidence.map((ev, idx) => (
                    <View key={idx} style={[styles.row, { marginLeft: 8, marginBottom: 2 }]}>
                      <Text style={{ color: COLORS.terracotta, fontSize: 8, marginRight: 4 }}>•</Text>
                      <Text style={{ fontSize: 8, color: COLORS.body, flex: 1 }}>{ev}</Text>
                    </View>
                  ))}
                </View>
              )}

              {priority.indicator && (
                <View style={{ marginTop: 8, backgroundColor: COLORS.riskLowBg, padding: 6, borderRadius: 4 }}>
                  <Text style={[styles.metricLabel, { color: COLORS.riskLow }]}>
                    INDICADOR DE SUCESSO:
                  </Text>
                  <Text style={{ fontSize: 9, color: COLORS.body }}>{priority.indicator}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Backlog por Tema */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Backlog por Tema" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens de Ação Detalhados</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Cada tema contém ações específicas que devem ser executadas para endereçar as prioridades identificadas.
          </Text>

          {data.backlog.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <Text style={styles.cardTitle}>{item.theme}</Text>
                <View
                  style={{
                    backgroundColor: getEffortColor(item.estimatedEffort),
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' }}>
                    Esforço {getEffortLabel(item.estimatedEffort)}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                {item.items.map((action, idx) => (
                  <View key={idx} style={[styles.row, { marginBottom: 4 }]}>
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: COLORS.backgroundAlt,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ fontSize: 8, color: COLORS.muted }}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.cardContent, { flex: 1 }]}>{action}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Governança */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Estrutura de Governança" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modelo de Acompanhamento</Text>

          {/* Sponsor */}
          <View style={[styles.card, { borderLeftColor: COLORS.terracotta, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Sponsor / Patrocinador</Text>
            <Text style={styles.cardContent}>{data.governance.sponsor}</Text>
          </View>

          {/* Comitê */}
          <View style={[styles.card, { borderLeftColor: COLORS.olive, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Comitê de Acompanhamento</Text>
            <View style={{ marginTop: 6 }}>
              {data.governance.committee.map((member, idx) => (
                <View key={idx} style={[styles.row, { marginBottom: 3 }]}>
                  <Text style={{ color: COLORS.olive, fontSize: 8, marginRight: 6 }}>•</Text>
                  <Text style={[styles.cardContent, { flex: 1 }]}>{member}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Frequência */}
          <View style={[styles.card, { borderLeftColor: COLORS.accent, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Frequência de Revisão</Text>
            <Text style={styles.cardContent}>{data.governance.reviewFrequency}</Text>
          </View>

          {/* Escalation */}
          <View style={[styles.card, { borderLeftColor: COLORS.riskMedium, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Caminho de Escalação</Text>
            <Text style={styles.cardContent}>{data.governance.escalationPath}</Text>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Devolutiva aos Colaboradores */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Devolutiva aos Colaboradores" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comunicação Sugerida</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Texto sugerido para comunicação aos colaboradores sobre os resultados da pesquisa e próximos passos.
          </Text>

          <PDFNarrativeBlock
            title="Texto para Comunicação Interna"
            content={data.feedback}
          />
        </View>

        {/* Próximos Passos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cronograma Sugerido</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>1.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Semana 1:</Text> Validar plano com comitê e definir responsáveis
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>2.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Semana 2:</Text> Comunicar resultados aos colaboradores
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>3.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Semanas 3-4:</Text> Iniciar implementação das ações prioritárias
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>4.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Mês 2:</Text> Primeira revisão de progresso
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>5.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Mês 3:</Text> Avaliação de resultados e ajustes
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>
    </Document>
  );
};

export default PlanoAcaoPDF;
