/**
 * Relatório Mensal de Clima - PDF Template
 *
 * Template para o pulso mensal de clima organizacional
 */

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import {
  styles,
  COLORS,
  PDFHeader,
  PDFFooter,
  MetricsGrid,
  PDFNarrativeBlock,
} from '../components';
import type { ClimaMensalReport } from '@/app/dashboard/analytics/reports/types';

interface ClimaMensalPDFProps {
  data: ClimaMensalReport;
}

export const ClimaMensalPDF: React.FC<ClimaMensalPDFProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Determinar cor do score
  const getScoreColor = (score: number, maxScore: number = 5) => {
    const normalized = (score / maxScore) * 100;
    if (normalized >= 70) return COLORS.riskLow;
    if (normalized >= 50) return COLORS.riskMedium;
    return COLORS.riskHigh;
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
          <Text style={styles.coverTitle}>Relatório Mensal de Clima</Text>
          <Text style={styles.coverSubtitle}>{data.metadata.assessmentTitle}</Text>
          <Text style={styles.coverMeta}>{data.metadata.organizationName}</Text>
          <Text style={styles.coverMeta}>
            Período: {formatDate(data.metadata.period.start)} a{' '}
            {formatDate(data.metadata.period.end)}
          </Text>
          <Text style={[styles.coverMeta, { marginTop: 20 }]}>
            Participantes: {data.metadata.participants} | Taxa de Resposta:{' '}
            {data.metadata.responseRate}%
          </Text>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>Pesquisa de Clima Organizacional</Text>
          <Text style={styles.coverFooterText}>
            Gerado em: {formatDate(data.metadata.generatedAt)}
          </Text>
        </View>
      </Page>

      {/* Números Essenciais */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title="Números Essenciais"
          organizationName={data.metadata.organizationName}
        />

        {/* Abertura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visão Geral</Text>
          <MetricsGrid
            metrics={[
              {
                label: 'Participantes',
                value: data.opening.n,
              },
              {
                label: 'Taxa de Resposta',
                value: data.opening.responseRate,
                suffix: '%',
              },
              {
                label: 'Média Geral',
                value: data.essentialNumbers.overallAverage.toFixed(1),
                suffix: '/10',
                description:
                  data.essentialNumbers.overallAverage >= 7
                    ? 'Excelente'
                    : data.essentialNumbers.overallAverage >= 5
                    ? 'Bom'
                    : 'Atenção',
              },
            ]}
          />
        </View>

        {/* Destaques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destaques do Período</Text>

          <View style={[styles.card, { borderLeftColor: COLORS.riskLow, borderLeftWidth: 4 }]}>
            <Text style={styles.cardTitle}>Ponto Forte</Text>
            <Text style={styles.cardContent}>
              {data.essentialNumbers.highestScore.axis}: {data.essentialNumbers.highestScore.score.toFixed(1)}
            </Text>
          </View>

          <View style={[styles.card, { borderLeftColor: COLORS.riskHigh, borderLeftWidth: 4, marginTop: 10 }]}>
            <Text style={styles.cardTitle}>Ponto de Atenção</Text>
            <Text style={styles.cardContent}>
              {data.essentialNumbers.lowestScore.axis}: {data.essentialNumbers.lowestScore.score.toFixed(1)}
            </Text>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Análise por Eixo */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Análise por Eixo" />

        <View style={styles.section}>
          {data.axes.map((axis, idx) => (
            <View key={axis.axisId} style={styles.card}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <Text style={styles.cardTitle}>{axis.axisName}</Text>
                <View
                  style={{
                    backgroundColor: getScoreColor(axis.average),
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                    {axis.average.toFixed(1)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardContent, { marginTop: 8 }]}>
                {axis.narrative}
              </Text>
              {axis.trend && (
                <Text style={[styles.cardContent, { marginTop: 4, color: COLORS.muted }]}>
                  Tendência: {axis.trend === 'up' ? '↑ Melhorando' : axis.trend === 'down' ? '↓ Piorando' : '→ Estável'}
                </Text>
              )}
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Voz do Colaborador */}
      {data.voiceOfEmployee.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PDFHeader title="Voz do Colaborador" />

          <PDFNarrativeBlock
            title="O que os colaboradores estão dizendo"
            content="Os temas abaixo foram identificados através de análise de linguagem natural (NLP) das respostas abertas da pergunta sobre feedback geral."
          />

          <View style={styles.section}>
            {data.voiceOfEmployee.map((theme, idx) => (
              <View key={idx} style={styles.themeCard}>
                <View style={styles.themeHeader}>
                  <Text style={styles.themeName}>{theme.theme}</Text>
                  <Text style={styles.themeCount}>
                    {theme.count} menções ({theme.percentage}%)
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor:
                      theme.sentiment === 'positive'
                        ? COLORS.riskLowBg
                        : theme.sentiment === 'negative'
                        ? COLORS.riskHighBg
                        : COLORS.riskMediumBg,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    alignSelf: 'flex-start',
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color:
                        theme.sentiment === 'positive'
                          ? COLORS.riskLow
                          : theme.sentiment === 'negative'
                          ? COLORS.riskHigh
                          : COLORS.riskMedium,
                    }}
                  >
                    {theme.sentiment === 'positive'
                      ? 'Positivo'
                      : theme.sentiment === 'negative'
                      ? 'Negativo'
                      : 'Neutro'}
                  </Text>
                </View>
                {theme.examples.length > 0 && (
                  <Text style={[styles.themeExamples, { marginTop: 8 }]}>
                    &quot;{theme.examples[0].substring(0, 150)}
                    {theme.examples[0].length > 150 ? '...' : ''}&quot;
                  </Text>
                )}
              </View>
            ))}
          </View>

          <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
        </Page>
      )}

      {/* Insights */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Insights do Período" />

        {/* 3 Aprendizados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3 Aprendizados</Text>
          <View style={styles.list}>
            {data.insights.learnings.map((learning, idx) => (
              <View key={idx} style={styles.listItem}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: COLORS.riskLowBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: COLORS.riskLow, fontSize: 12, fontWeight: 'bold' }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.listText, { flex: 1 }]}>{learning}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3 Preocupações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3 Pontos de Atenção</Text>
          <View style={styles.list}>
            {data.insights.concerns.map((concern, idx) => (
              <View key={idx} style={styles.listItem}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: COLORS.riskHighBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: COLORS.riskHigh, fontSize: 12, fontWeight: 'bold' }}>
                    !
                  </Text>
                </View>
                <Text style={[styles.listText, { flex: 1 }]}>{concern}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Próximos Passos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Passos Sugeridos</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>1.</Text>
              <Text style={styles.listText}>
                Compartilhar resultados com lideranças em reunião de alinhamento
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>2.</Text>
              <Text style={styles.listText}>
                Criar grupo focal para aprofundar os pontos de atenção identificados
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>3.</Text>
              <Text style={styles.listText}>
                Definir ações rápidas (quick wins) para endereçar preocupações
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>4.</Text>
              <Text style={styles.listText}>
                Agendar próximo pulso para acompanhamento em 30 dias
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>
    </Document>
  );
};

export default ClimaMensalPDF;
