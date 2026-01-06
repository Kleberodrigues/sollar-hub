/**
 * Correlacao - PDF Template
 *
 * Template para o relatório de correlação Clima → Riscos → Âncoras
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
import type { CorrelacaoReport } from '@/app/dashboard/analytics/reports/types';

interface CorrelacaoPDFProps {
  data: CorrelacaoReport;
}

export const CorrelacaoPDF: React.FC<CorrelacaoPDFProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Cor baseada na força da correlação
  const getCorrelationColor = (strength: number) => {
    const absStrength = Math.abs(strength);
    if (absStrength >= 0.7) return strength >= 0 ? COLORS.riskLow : COLORS.riskHigh;
    if (absStrength >= 0.4) return COLORS.riskMedium;
    return COLORS.muted;
  };

  const getCorrelationLabel = (strength: number) => {
    const absStrength = Math.abs(strength);
    const direction = strength >= 0 ? 'Positiva' : 'Negativa';
    if (absStrength >= 0.7) return `${direction} Forte`;
    if (absStrength >= 0.4) return `${direction} Moderada`;
    if (absStrength >= 0.2) return `${direction} Fraca`;
    return 'Negligível';
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
          <Text style={styles.coverTitle}>Relatório de Correlação</Text>
          <Text style={styles.coverSubtitle}>Clima → Riscos → Âncoras</Text>
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
          <Text style={styles.coverFooterText}>Análise de Alavancas Organizacionais</Text>
          <Text style={styles.coverFooterText}>
            Gerado em: {formatDate(data.metadata.generatedAt)}
          </Text>
        </View>
      </Page>

      {/* Introdução */}
      <Page size="A4" style={styles.page}>
        <PDFHeader
          title="Sobre Este Relatório"
          organizationName={data.metadata.organizationName}
        />

        <View style={styles.executiveSummary}>
          <Text style={styles.summaryTitle}>O que é Análise de Correlação?</Text>
          <Text style={[styles.summaryText, { marginBottom: 12 }]}>
            Este relatório apresenta a análise estatística das relações entre os fatores de risco
            psicossocial (causas) e os indicadores de efeito (consequências). Compreender estas
            correlações permite identificar as principais alavancas para intervenção organizacional.
          </Text>
          <Text style={styles.summaryText}>
            Uma correlação forte (r {'>'} 0.7) indica que mudanças em um fator tipicamente se refletem
            no outro. Correlações moderadas (0.4-0.7) sugerem influência significativa. Correlações
            fracas ({'<'} 0.4) indicam relação limitada ou indireta.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modelo Conceitual</Text>
          <View
            style={[
              styles.card,
              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
            ]}
          >
            <View style={{ alignItems: 'center', width: '30%' }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.terracottaLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>C</Text>
              </View>
              <Text style={[styles.cardTitle, { marginTop: 8, textAlign: 'center' }]}>CLIMA</Text>
              <Text style={[styles.cardContent, { textAlign: 'center', fontSize: 7 }]}>
                Percepção geral
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color: COLORS.terracotta }}>→</Text>
            </View>

            <View style={{ alignItems: 'center', width: '30%' }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.riskMediumBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>R</Text>
              </View>
              <Text style={[styles.cardTitle, { marginTop: 8, textAlign: 'center' }]}>RISCOS</Text>
              <Text style={[styles.cardContent, { textAlign: 'center', fontSize: 7 }]}>
                Fatores COPSOQ
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, color: COLORS.terracotta }}>→</Text>
            </View>

            <View style={{ alignItems: 'center', width: '30%' }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.oliveLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>A</Text>
              </View>
              <Text style={[styles.cardTitle, { marginTop: 8, textAlign: 'center' }]}>ÂNCORAS</Text>
              <Text style={[styles.cardContent, { textAlign: 'center', fontSize: 7 }]}>
                Indicadores de efeito
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Mapa de Correlações */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Mapa de Correlações" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Correlações Identificadas</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Relação entre fatores de risco e indicadores de efeito, ordenadas por força de correlação.
          </Text>

          {data.relationshipMap.map((corr, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: getCorrelationColor(corr.correlationStrength),
                  marginBottom: 10,
                },
              ]}
            >
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter, { marginBottom: 8 }]}>
                <View style={[styles.row, styles.alignCenter, { flex: 1 }]}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: getCorrelationColor(corr.correlationStrength),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                      {corr.correlationStrength > 0 ? '+' : ''}{corr.correlationStrength.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{corr.riskMetric}</Text>
                    <Text style={[styles.cardContent, { fontSize: 8, color: COLORS.muted }]}>
                      → {corr.anchorMetric}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: getCorrelationColor(corr.correlationStrength),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 7, fontWeight: 'bold' }}>
                    {getCorrelationLabel(corr.correlationStrength)}
                  </Text>
                </View>
              </View>

              <View style={{ marginLeft: 62 }}>
                <Text style={styles.cardContent}>{corr.interpretation}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Legenda */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={[styles.metricLabel, { marginBottom: 8 }]}>INTERPRETAÇÃO DA CORRELAÇÃO:</Text>
          <View style={[styles.row, { flexWrap: 'wrap', gap: 10 }]}>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.riskLow, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Forte positiva (r {'≥'} 0.7)</Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.riskMedium, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Moderada (0.4 - 0.7)</Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.muted, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Fraca ({'<'} 0.4)</Text>
            </View>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={{ width: 12, height: 12, backgroundColor: COLORS.riskHigh, borderRadius: 2, marginRight: 4 }} />
              <Text style={{ fontSize: 8, color: COLORS.body }}>Forte negativa (r {'≤'} -0.7)</Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Correlações Esperadas vs Reais */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Validação Teórica" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Correlações Esperadas vs Observadas</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Comparação entre as correlações teoricamente esperadas pela literatura científica
            e as correlações observadas nos dados da organização.
          </Text>

          {/* Tabela de correlações esperadas */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>FATOR</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>CORRELACIONADO COM</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>OBSERVADO</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
            </View>

            {data.expectedCorrelations.map((exp, idx) => {
              const isConfirmed = Math.abs(exp.actualCorrelation) >= 0.2;
              const _direction = exp.actualCorrelation >= 0 ? 'positiva' : 'negativa';

              return (
                <View
                  key={idx}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 2 }]}>{exp.question}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{exp.expectedWith}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1, textAlign: 'center', fontWeight: 'bold' },
                    ]}
                  >
                    {exp.actualCorrelation > 0 ? '+' : ''}{exp.actualCorrelation.toFixed(2)}
                  </Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View
                      style={{
                        backgroundColor: isConfirmed ? COLORS.riskLowBg : COLORS.riskMediumBg,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 7,
                          color: isConfirmed ? COLORS.riskLow : COLORS.riskMedium,
                          fontWeight: 'bold',
                        }}
                      >
                        {isConfirmed ? 'Confirmado' : 'Não confirmado'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <PDFNarrativeBlock
          title="Interpretação"
          content="Correlações confirmadas validam o modelo teórico e indicam áreas onde intervenções devem produzir resultados previsíveis. Correlações não confirmadas podem indicar especificidades da cultura organizacional ou necessidade de investigação adicional."
        />

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Conclusões sobre Alavancas */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Conclusões e Alavancas" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Principais Alavancas Organizacionais</Text>
          <Text style={[styles.sectionContent, { marginBottom: 15 }]}>
            Com base na análise de correlação, estas são as principais alavancas identificadas
            para melhorar os indicadores de efeito (NPS, satisfação, permanência, saúde).
          </Text>

          {data.leverConclusions.map((conclusion, idx) => (
            <View
              key={idx}
              style={[
                styles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: idx < 3 ? COLORS.terracotta : COLORS.olive,
                  marginBottom: 10,
                },
              ]}
            >
              <View style={[styles.row, { marginBottom: 6 }]}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: idx < 3 ? COLORS.terracotta : COLORS.olive,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.cardContent, { flex: 1, lineHeight: 1.5 }]}>
                  {conclusion}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Recomendações de Acompanhamento */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Próximos Passos" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendações para Acompanhamento</Text>

          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>1.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Priorize intervenções nas alavancas principais:</Text> Foque recursos nas áreas com maior correlação com os indicadores de efeito.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>2.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Monitore indicadores leading:</Text> Acompanhe mensalmente os fatores de risco para antecipar mudanças nos indicadores de efeito.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>3.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Reavalie correlações trimestralmente:</Text> Correlações podem mudar com intervenções ou mudanças no contexto organizacional.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>4.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Investigue correlações não confirmadas:</Text> Entrevistas qualitativas podem revelar dinâmicas específicas da organização.
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>5.</Text>
              <Text style={styles.listText}>
                <Text style={{ fontWeight: 'bold' }}>Comunique resultados às lideranças:</Text> Use este relatório como base para planos de ação setoriais.
              </Text>
            </View>
          </View>
        </View>

        <PDFNarrativeBlock
          title="Nota Metodológica"
          content={`Esta análise utilizou coeficiente de correlação de Pearson para ${data.metadata.participants} participantes. Para maior confiabilidade estatística, recomenda-se amostra mínima de 30 respondentes. Correlações não implicam causalidade; intervenções devem ser baseadas em análise contextual adicional.`}
        />

        <View style={[styles.section, { marginTop: 20 }]}>
          <View
            style={{
              padding: 15,
              backgroundColor: COLORS.cream,
              borderRadius: 8,
              border: `1 solid ${COLORS.sage}`,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 10, color: COLORS.muted, marginBottom: 8 }}>
              Este relatório foi gerado automaticamente pelo PsicoMapa
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.muted }}>
              Para dúvidas sobre interpretação, consulte o suporte técnico
            </Text>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>
    </Document>
  );
};

export default CorrelacaoPDF;
