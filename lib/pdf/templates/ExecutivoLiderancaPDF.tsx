/**
 * Executivo Liderança - PDF Template
 *
 * Template para o relatório executivo focado em líderes
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
import type { ExecutivoLiderancaReport } from '@/app/dashboard/analytics/reports/types';

interface ExecutivoLiderancaPDFProps {
  data: ExecutivoLiderancaReport;
}

export const ExecutivoLiderancaPDF: React.FC<ExecutivoLiderancaPDFProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Cor baseada na severidade
  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return COLORS.riskHigh;
    if (severity === 'alert') return COLORS.riskMedium;
    return COLORS.olive;
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === 'critical') return 'Crítico';
    if (severity === 'alert') return 'Alerta';
    return 'Atenção';
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
          <Text style={styles.coverTitle}>Relatório Executivo</Text>
          <Text style={styles.coverSubtitle}>Para Liderança</Text>
          <Text style={[styles.coverMeta, { marginTop: 30 }]}>{data.metadata.assessmentTitle}</Text>
          <Text style={styles.coverMeta}>{data.metadata.organizationName}</Text>
          <Text style={styles.coverMeta}>
            Período: {formatDate(data.metadata.period.start)} a{' '}
            {formatDate(data.metadata.period.end)}
          </Text>
          <Text style={[styles.coverMeta, { marginTop: 20 }]}>
            {data.metadata.participants} participantes | {data.metadata.responseRate}% de resposta
          </Text>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>Resumo Executivo para Tomada de Decisão</Text>
          <Text style={styles.coverFooterText}>
            Gerado em: {formatDate(data.metadata.generatedAt)}
          </Text>
        </View>
      </Page>

      {/* Pulse do Período */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title="Pulse do Período"
          organizationName={data.metadata.organizationName}
        />

        <View style={styles.executiveSummary}>
          <Text style={styles.summaryTitle}>5 Insights Executivos</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Resumo dos principais achados para discussão com a diretoria.
          </Text>

          {data.pulseOfPeriod.map((bullet, idx) => (
            <View key={idx} style={[styles.row, { marginBottom: 12 }]}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: COLORS.terracotta,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                  {idx + 1}
                </Text>
              </View>
              <Text style={[styles.summaryText, { flex: 1 }]}>{bullet}</Text>
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Top 3 Áreas de Foco */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Top 3 Áreas de Foco" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prioridades para Ação de Liderança</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            As três áreas mais importantes para atenção da liderança neste período.
          </Text>

          {data.topFocusAreas.map((focus, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: idx === 0 ? COLORS.riskHigh : idx === 1 ? COLORS.riskMedium : COLORS.olive,
                },
              ]}
            >
              <View style={[styles.row, styles.alignCenter, { marginBottom: 8 }]}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: idx === 0 ? COLORS.riskHighBg : idx === 1 ? COLORS.riskMediumBg : COLORS.riskLowBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: idx === 0 ? COLORS.riskHigh : idx === 1 ? COLORS.riskMedium : COLORS.riskLow,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, { fontSize: 13 }]}>{focus.area}</Text>
              </View>

              <View style={{ marginLeft: 44 }}>
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.metricLabel, { color: COLORS.terracotta }]}>POR QUE É IMPORTANTE:</Text>
                  <Text style={styles.cardContent}>{focus.why}</Text>
                </View>

                <View style={{ backgroundColor: COLORS.backgroundAlt, padding: 8, borderRadius: 4 }}>
                  <Text style={[styles.metricLabel, { color: COLORS.olive }]}>AÇÃO RECOMENDADA:</Text>
                  <Text style={[styles.cardContent, { fontWeight: 'bold' }]}>{focus.action}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Sinais de Risco */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Sinais de Risco" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores que Requerem Atenção</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Sinais identificados na pesquisa que merecem monitoramento ou ação.
          </Text>

          {data.riskSignals.map((signal, idx) => (
            <View
              key={idx}
              style={[
                styles.alertBox,
                {
                  backgroundColor: signal.severity === 'critical' ? COLORS.riskHighBg : signal.severity === 'alert' ? COLORS.riskMediumBg : COLORS.backgroundAlt,
                  borderLeftWidth: 4,
                  borderLeftColor: getSeverityColor(signal.severity),
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={[styles.row, styles.spaceBetween, styles.alignCenter, { marginBottom: 4 }]}>
                  <Text style={[styles.cardTitle, { fontSize: 10 }]}>{signal.category}</Text>
                  <View
                    style={{
                      backgroundColor: getSeverityColor(signal.severity),
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: 'bold' }}>
                      {getSeverityLabel(signal.severity)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.alertText}>{signal.signal}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Legenda de Severidade */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={[styles.metricLabel, { marginBottom: 8 }]}>LEGENDA DE SEVERIDADE:</Text>
          <View style={[styles.row, { gap: 15 }]}>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.riskHigh, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Crítico - Ação imediata</Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.riskMedium, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Alerta - Monitorar de perto</Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.olive, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Atenção - Acompanhar</Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Roteiro de Conversa */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Roteiro de Conversa com a Equipe" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guia para Discussão dos Resultados</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Use este roteiro para conduzir conversas produtivas com sua equipe sobre os resultados da pesquisa.
          </Text>

          {/* Abertura */}
          <View style={[styles.card, { borderLeftColor: COLORS.olive, borderLeftWidth: 4 }]}>
            <Text style={[styles.cardTitle, { color: COLORS.olive }]}>
              📣 ABERTURA DA CONVERSA
            </Text>
            <Text style={[styles.cardContent, { marginTop: 8, lineHeight: 1.6 }]}>
              {data.teamConversationScript.opening}
            </Text>
          </View>

          {/* Perguntas-Chave */}
          <View style={[styles.card, { borderLeftColor: COLORS.terracotta, borderLeftWidth: 4 }]}>
            <Text style={[styles.cardTitle, { color: COLORS.terracotta }]}>
              💬 PERGUNTAS PARA DISCUSSÃO
            </Text>
            <View style={{ marginTop: 8 }}>
              {data.teamConversationScript.keyQuestions.map((question, idx) => (
                <View key={idx} style={[styles.row, { marginBottom: 8 }]}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: COLORS.terracottaLight,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: COLORS.terracotta, fontWeight: 'bold' }}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text style={[styles.cardContent, { flex: 1, fontStyle: 'italic' }]}>
                    &ldquo;{question}&rdquo;
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Encerramento */}
          <View style={[styles.card, { borderLeftColor: COLORS.accent, borderLeftWidth: 4 }]}>
            <Text style={[styles.cardTitle, { color: COLORS.accent }]}>
              ✅ ORIENTAÇÃO PARA ENCERRAMENTO
            </Text>
            <Text style={[styles.cardContent, { marginTop: 8, lineHeight: 1.6 }]}>
              {data.teamConversationScript.closingGuidance}
            </Text>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Dicas para Líderes */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Dicas para Líderes" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boas Práticas para a Conversa</Text>

          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Escute ativamente:</Text> Deixe a equipe falar primeiro. Evite interromper ou defender-se.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Agradeça a honestidade:</Text> Reconheça a coragem de compartilhar feedback, mesmo quando difícil.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Foque em soluções:</Text> Direcione a conversa para o que pode ser feito, não apenas o que está errado.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Comprometa-se publicamente:</Text> Escolha 1-2 ações concretas e comunique prazos.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Faça follow-up:</Text> Retorne em 2-3 semanas com progresso ou explicações.
              </Text>
            </View>
          </View>

          <PDFNarrativeBlock
            title="Lembre-se"
            content="A pesquisa é o início de uma conversa, não o fim. O que você faz com os resultados é mais importante do que os números em si. Sua equipe está observando suas ações, não apenas suas palavras."
          />
        </View>

        {/* Próximos Passos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cronograma Sugerido</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>1.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Esta semana:</Text> Agende conversa com a equipe (30-45 min)
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>2.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Próxima semana:</Text> Realize a conversa usando este roteiro
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>3.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Em 2 semanas:</Text> Implemente quick wins identificados
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>4.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Em 1 mês:</Text> Faça follow-up com a equipe sobre progresso
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>
    </Document>
  );
};

export default ExecutivoLiderancaPDF;
