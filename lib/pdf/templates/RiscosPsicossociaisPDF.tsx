/**
 * Relatório de Riscos Psicossociais - PDF Template
 *
 * Template completo para o relatório trimestral NR-1
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
  PDFRiskBadge,
} from '../components';
import type { RiscosPsicossociaisReport } from '@/app/dashboard/analytics/reports/types';

interface RiscosPsicossociaisPDFProps {
  data: RiscosPsicossociaisReport;
}

export const RiscosPsicossociaisPDF: React.FC<RiscosPsicossociaisPDFProps> = ({
  data,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
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
          <Text style={styles.coverTitle}>Relatório de Riscos Psicossociais</Text>
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
          <Text style={styles.coverFooterText}>
            Baseado no COPSOQ II-BR | Alinhado à NR-1
          </Text>
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

        <PDFNarrativeBlock content={data.executiveSummary} variant="summary" />

        {/* Métricas Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores Gerais</Text>
          <MetricsGrid
            metrics={[
              {
                label: 'Participantes',
                value: data.metadata.participants,
              },
              {
                label: 'Taxa de Resposta',
                value: data.metadata.responseRate,
                suffix: '%',
              },
              {
                label: 'NPS',
                value: data.anchors.nps.score,
                description:
                  data.anchors.nps.score >= 50
                    ? 'Excelente'
                    : data.anchors.nps.score >= 0
                    ? 'Bom'
                    : 'Atenção',
              },
              {
                label: 'Satisfação Geral',
                value: data.anchors.satisfaction.average.toFixed(1),
                suffix: '/10',
              },
            ]}
          />
        </View>

        {/* Panorama de Riscos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Panorama de Riscos por Bloco</Text>
          {data.blocks.map((block) => (
            <View key={block.blockId} style={styles.card}>
              <View
                style={[styles.row, styles.spaceBetween, styles.alignCenter]}
              >
                <Text style={styles.cardTitle}>{block.blockName}</Text>
                <PDFRiskBadge level={block.riskLevel} score={block.averageScore} />
              </View>
            </View>
          ))}

          {/* Bloco 6 - Violência */}
          <View style={styles.card}>
            <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
              <Text style={styles.cardTitle}>{data.violenceBlock.blockName}</Text>
              <PDFRiskBadge
                level={data.violenceBlock.riskLevel}
                score={data.violenceBlock.averageScore}
              />
            </View>
            {data.violenceBlock.preferNotToAnswer.alert && (
              <View style={[styles.alertBox, styles.alertWarning]}>
                <Text style={styles.alertText}>
                  Atenção: {data.violenceBlock.preferNotToAnswer.percentage.toFixed(1)}%
                  dos colaboradores preferiram não responder questões deste bloco
                </Text>
              </View>
            )}
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Introdução Técnica */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Metodologia" />

        <PDFNarrativeBlock
          title="Sobre o COPSOQ II-BR e NR-1"
          content={data.introduction}
        />

        {/* Escala de Interpretação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escala de Interpretação</Text>
          <View style={[styles.alertBox, styles.alertDanger]}>
            <Text style={styles.alertText}>
              Score {'<'} 2.5 = Alto Risco - Requer ação imediata
            </Text>
          </View>
          <View style={[styles.alertBox, styles.alertWarning]}>
            <Text style={styles.alertText}>
              Score 2.5 - 3.4 = Risco Médio - Requer monitoramento
            </Text>
          </View>
          <View style={[styles.alertBox, styles.alertSuccess]}>
            <Text style={styles.alertText}>
              Score ≥ 3.5 = Baixo Risco - Situação adequada
            </Text>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Análise por Bloco */}
      {data.blocks.map((block) => (
        <Page key={block.blockId} size="A4" style={styles.page}>
          <PDFHeader title={block.blockName} />

          {/* Score e Risco */}
          <View style={[styles.row, styles.spaceBetween, { marginBottom: 15 }]}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Score Médio</Text>
              <Text style={styles.metricValue}>
                {block.averageScore.toFixed(2)}/5.0
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Nível de Risco</Text>
              <PDFRiskBadge level={block.riskLevel} />
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Respostas</Text>
              <Text style={styles.metricValue}>{block.responseCount}</Text>
            </View>
          </View>

          {/* Narrativa */}
          <PDFNarrativeBlock title="Análise" content={block.narrative} />

          {/* Perguntas com menor score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perguntas por Score</Text>
            {block.questions
              .sort((a, b) => a.avgScore - b.avgScore)
              .slice(0, 5)
              .map((q, idx) => (
                <View key={q.questionId} style={styles.card}>
                  <View
                    style={[styles.row, styles.spaceBetween, styles.alignCenter]}
                  >
                    <Text style={[styles.cardContent, { flex: 1 }]}>
                      {q.questionText.substring(0, 80)}
                      {q.questionText.length > 80 ? '...' : ''}
                    </Text>
                    <PDFRiskBadge level={q.riskLevel} score={q.avgScore} />
                  </View>
                </View>
              ))}
          </View>

          <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
        </Page>
      ))}

      {/* Bloco 6 - Análise Especial */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title={data.violenceBlock.blockName} />

        <View style={[styles.row, styles.spaceBetween, { marginBottom: 15 }]}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Score Médio</Text>
            <Text style={styles.metricValue}>
              {data.violenceBlock.averageScore.toFixed(2)}/5.0
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Nível de Risco</Text>
            <PDFRiskBadge level={data.violenceBlock.riskLevel} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Prefiro Não Responder</Text>
            <Text style={styles.metricValue}>
              {data.violenceBlock.preferNotToAnswer.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        {data.violenceBlock.preferNotToAnswer.alert && (
          <View style={[styles.alertBox, styles.alertDanger]}>
            <Text style={styles.alertText}>
              ALERTA: Um percentual significativo de colaboradores optou por não
              responder questões sobre violência e assédio. Isso pode indicar
              receio em se expor ou experiências traumáticas. Recomenda-se
              investigação cuidadosa e fortalecimento dos canais de denúncia.
            </Text>
          </View>
        )}

        <PDFNarrativeBlock title="Análise" content={data.violenceBlock.narrative} />

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Âncoras - Indicadores de Efeito */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Bloco 7: Âncoras - Indicadores de Efeito" />

        <PDFNarrativeBlock
          title="Sobre os Indicadores de Efeito"
          content="Os indicadores de efeito (âncoras) medem os resultados das condições de trabalho na percepção dos colaboradores. NPS, satisfação, intenção de permanência e saúde autopercebida são reflexos das causas identificadas nos blocos 1-6."
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Net Promoter Score (NPS)</Text>
          <MetricsGrid
            metrics={[
              {
                label: 'NPS Score',
                value: data.anchors.nps.score,
                description:
                  data.anchors.nps.score >= 50
                    ? 'Zona de Excelência'
                    : data.anchors.nps.score >= 0
                    ? 'Zona de Aperfeiçoamento'
                    : 'Zona Crítica',
              },
              {
                label: 'Promotores (9-10)',
                value: data.anchors.nps.promoters,
              },
              {
                label: 'Passivos (7-8)',
                value: data.anchors.nps.passives,
              },
              {
                label: 'Detratores (0-6)',
                value: data.anchors.nps.detractors,
              },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intenção de Permanência</Text>
          <MetricsGrid
            metrics={[
              {
                label: 'Ficariam',
                value: data.anchors.permanence.stayPercentage,
                suffix: '%',
              },
              {
                label: 'Sairiam',
                value: data.anchors.permanence.leavePercentage,
                suffix: '%',
              },
              {
                label: 'Indecisos',
                value: data.anchors.permanence.undecidedPercentage,
                suffix: '%',
              },
            ]}
          />
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Temas das Perguntas Abertas */}
      {Object.keys(data.nlpThemes).length > 0 && (
        <Page size="A4" style={styles.page}>
          <PDFHeader title="Análise Qualitativa - Temas Identificados" />

          <PDFNarrativeBlock
            title="Metodologia"
            content="Os temas abaixo foram identificados através de análise de linguagem natural (NLP) das respostas abertas. Cada tema representa padrões recorrentes nas manifestações dos colaboradores."
          />

          {Object.entries(data.nlpThemes)
            .slice(0, 3)
            .map(([questionId, themes]) => (
              <View key={questionId} style={styles.section}>
                {themes.slice(0, 5).map((theme, idx) => (
                  <View key={idx} style={styles.themeCard}>
                    <View style={styles.themeHeader}>
                      <Text style={styles.themeName}>{theme.theme}</Text>
                      <Text style={styles.themeCount}>
                        {theme.count} menções ({theme.percentage}%)
                      </Text>
                    </View>
                    <Text style={styles.themeExamples}>
                      Sentimento: {theme.sentiment === 'positive' ? 'Positivo' : theme.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                    </Text>
                    {theme.examples.length > 0 && (
                      <Text style={styles.themeExamples}>
                        Exemplo: &quot;{theme.examples[0].substring(0, 100)}...&quot;
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}

          <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
        </Page>
      )}

      {/* Hipóteses Organizacionais */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Hipóteses Organizacionais" />

        <PDFNarrativeBlock
          title="Sobre as Hipóteses"
          content="Com base nos dados quantitativos e qualitativos, foram identificadas as seguintes hipóteses sobre possíveis causas organizacionais para os padrões observados. Estas hipóteses devem ser validadas através de investigação complementar."
        />

        <View style={styles.section}>
          {data.organizationalHypotheses.map((hypothesis, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.listItem}>
                <Text style={styles.listBullet}>{idx + 1}.</Text>
                <Text style={styles.listText}>{hypothesis}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Visão Sistêmica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visão Sistêmica</Text>
          <PDFNarrativeBlock content={data.systemicView} />
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>

      {/* Recomendações */}
      <Page size="A4" style={styles.page}>
        <PDFHeader title="Recomendações e Plano de Ação" />

        <View style={styles.section}>
          {data.recommendations.map((rec, idx) => (
            <View
              key={idx}
              style={[
                styles.actionCard,
                {
                  borderLeftColor:
                    rec.priority === 'high'
                      ? COLORS.riskHigh
                      : rec.priority === 'medium'
                      ? COLORS.riskMedium
                      : COLORS.riskLow,
                },
              ]}
            >
              <View style={styles.actionHeader}>
                <Text style={styles.actionTitle}>{rec.action}</Text>
                <PDFRiskBadge
                  level={
                    rec.priority === 'high'
                      ? 'high'
                      : rec.priority === 'medium'
                      ? 'medium'
                      : 'low'
                  }
                  showLabel={false}
                />
              </View>
              <Text style={styles.actionMeta}>
                Prazo: {rec.timeline} | Responsável: {rec.responsible}
              </Text>
              {rec.indicator && (
                <Text style={styles.actionMeta}>Indicador: {rec.indicator}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Próximos Passos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Passos Sugeridos</Text>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>1.</Text>
              <Text style={styles.listText}>
                Apresentar resultados à liderança em reunião específica
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>2.</Text>
              <Text style={styles.listText}>
                Formar comitê para elaboração do plano de ação detalhado
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>3.</Text>
              <Text style={styles.listText}>
                Comunicar colaboradores sobre principais achados e compromissos
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.listBullet}>4.</Text>
              <Text style={styles.listText}>
                Agendar nova avaliação em 90 dias para monitoramento
              </Text>
            </View>
          </View>
        </View>

        <PDFFooter generatedAt={formatDate(data.metadata.generatedAt)} />
      </Page>
    </Document>
  );
};

export default RiscosPsicossociaisPDF;
