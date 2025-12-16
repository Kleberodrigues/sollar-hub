/**
 * Assessment Report PDF Template
 *
 * Template para geração de relatório executivo em PDF
 * usando @react-pdf/renderer
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Tipos para os dados do relatório
interface CategoryScore {
  category: string;
  categoryName: string;
  avgScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskLabel: string;
  responseCount: number;
  questionCount: number;
}

interface AssessmentData {
  assessmentTitle: string;
  organizationName: string;
  totalParticipants: number;
  totalQuestions: number;
  completionRate: number;
  lastResponseDate: string;
  categoryScores: CategoryScore[];
  generatedAt: string;
}

// Estilos do documento PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2 solid #E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 15,
  },
  metricCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    border: '1 solid #E5E7EB',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoryCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    border: '1 solid #E5E7EB',
    borderRadius: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  riskBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  riskLow: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  riskMedium: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  riskHigh: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  statItem: {
    fontSize: 9,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1 solid #E5E7EB',
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  interpretationSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    border: '1 solid #BFDBFE',
  },
  interpretationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 10,
    color: '#1E3A8A',
    lineHeight: 1.5,
  },
});

// Componente do documento PDF
export const AssessmentReportDocument: React.FC<{ data: AssessmentData }> = ({
  data,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Avaliação NR-1</Text>
          <Text style={styles.subtitle}>{data.assessmentTitle}</Text>
          <Text style={styles.subtitle}>{data.organizationName}</Text>
          <Text style={[styles.subtitle, { fontSize: 10, marginTop: 8 }]}>
            Gerado em: {data.generatedAt}
          </Text>
        </View>

        {/* Métricas Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total de Participantes</Text>
              <Text style={styles.metricValue}>{data.totalParticipants}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Taxa de Conclusão</Text>
              <Text style={styles.metricValue}>
                {data.completionRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total de Perguntas</Text>
              <Text style={styles.metricValue}>{data.totalQuestions}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Última Resposta</Text>
              <Text style={styles.metricValue}>{data.lastResponseDate}</Text>
            </View>
          </View>
        </View>

        {/* Scores por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise por Categoria NR-1</Text>
          {data.categoryScores.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.categoryName}</Text>
                <Text style={styles.scoreDisplay}>
                  {category.avgScore.toFixed(2)}
                </Text>
              </View>
              <View
                style={[
                  styles.riskBadge,
                  category.riskLevel === 'low'
                    ? styles.riskLow
                    : category.riskLevel === 'medium'
                    ? styles.riskMedium
                    : styles.riskHigh,
                ]}
              >
                <Text>Risco: {category.riskLabel}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.statItem}>
                  {category.responseCount} respostas
                </Text>
                <Text style={styles.statItem}>
                  {category.questionCount} perguntas
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Interpretação */}
        <View style={styles.interpretationSection}>
          <Text style={styles.interpretationTitle}>
            Interpretação dos Resultados
          </Text>
          <Text style={styles.interpretationText}>
            • Pontuação {'<'} 2.5: Risco Alto - Necessita ação imediata{'\n'}
            • Pontuação 2.5 - 3.4: Risco Médio - Requer atenção e
            monitoramento
            {'\n'}• Pontuação ≥ 3.5: Risco Baixo - Situação adequada, manter
            monitoramento
          </Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>
            Relatório gerado automaticamente pelo Sollar Insight Hub | Baseado
            na NR-1 - Gerenciamento de Riscos Ocupacionais
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Função helper para gerar o PDF
export const generateAssessmentPDF = async (
  data: AssessmentData
): Promise<Blob> => {
  const { pdf } = await import('@react-pdf/renderer');
  return await pdf(<AssessmentReportDocument data={data} />).toBlob();
};
