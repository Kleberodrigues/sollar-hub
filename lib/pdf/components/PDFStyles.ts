/**
 * PDF Styles - Design System Sollar
 *
 * Estilos compartilhados para todos os relatórios PDF
 * Baseado nas cores e tipografia da marca Sollar
 */

import { StyleSheet, Font } from '@react-pdf/renderer';

// Cores da marca Sollar
export const COLORS = {
  // Cores primárias
  terracotta: '#D4644A',
  terracottaLight: '#E8A090',
  olive: '#7A8450',
  oliveLight: '#A8B080',
  sage: '#BEC5AD',
  cream: '#F8F5F0',

  // Texto
  heading: '#1F2937',
  body: '#374151',
  muted: '#6B7280',
  light: '#9CA3AF',

  // Status
  riskHigh: '#EF4444',
  riskHighBg: '#FEE2E2',
  riskMedium: '#F59E0B',
  riskMediumBg: '#FEF3C7',
  riskLow: '#22C55E',
  riskLowBg: '#D1FAE5',

  // Sentimento
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444',

  // UI
  border: '#E5E7EB',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  accent: '#3B82F6',
};

// Estilos base
export const styles = StyleSheet.create({
  // ==========================================
  // Página
  // ==========================================
  page: {
    padding: 40,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.background,
    color: COLORS.body,
  },

  coverPage: {
    padding: 0,
    backgroundColor: COLORS.cream,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================
  // Cabeçalho e Rodapé
  // ==========================================
  header: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: `2 solid ${COLORS.terracotta}`,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTop: `1 solid ${COLORS.border}`,
    fontSize: 8,
    color: COLORS.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // ==========================================
  // Seções
  // ==========================================
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: `1 solid ${COLORS.border}`,
  },

  sectionContent: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.body,
  },

  // ==========================================
  // Cards e Containers
  // ==========================================
  card: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 6,
    border: `1 solid ${COLORS.border}`,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginBottom: 6,
  },

  cardContent: {
    fontSize: 9,
    color: COLORS.body,
    lineHeight: 1.4,
  },

  // ==========================================
  // Métricas
  // ==========================================
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },

  metricCard: {
    width: '48%',
    padding: 10,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 6,
    border: `1 solid ${COLORS.border}`,
  },

  metricLabel: {
    fontSize: 8,
    color: COLORS.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },

  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.heading,
  },

  metricSmall: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ==========================================
  // Badges de Risco
  // ==========================================
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },

  riskHigh: {
    backgroundColor: COLORS.riskHighBg,
    color: COLORS.riskHigh,
  },

  riskMedium: {
    backgroundColor: COLORS.riskMediumBg,
    color: COLORS.riskMedium,
  },

  riskLow: {
    backgroundColor: COLORS.riskLowBg,
    color: COLORS.riskLow,
  },

  // ==========================================
  // Narrativas
  // ==========================================
  narrativeBlock: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F0F4F8',
    borderRadius: 6,
    borderLeft: `3 solid ${COLORS.olive}`,
  },

  narrativeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginBottom: 6,
  },

  narrativeText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.body,
    textAlign: 'justify',
  },

  // ==========================================
  // Tabelas
  // ==========================================
  table: {
    width: '100%',
    marginBottom: 12,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.terracotta,
    padding: 6,
  },

  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.background,
    textTransform: 'uppercase',
  },

  tableRow: {
    flexDirection: 'row',
    borderBottom: `1 solid ${COLORS.border}`,
    padding: 6,
  },

  tableRowAlt: {
    backgroundColor: COLORS.backgroundAlt,
  },

  tableCell: {
    flex: 1,
    fontSize: 9,
    color: COLORS.body,
  },

  // ==========================================
  // Listas
  // ==========================================
  list: {
    marginLeft: 10,
    marginBottom: 10,
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  listBullet: {
    width: 12,
    fontSize: 9,
    color: COLORS.terracotta,
  },

  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.body,
  },

  // ==========================================
  // Temas NLP
  // ==========================================
  themeCard: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 4,
    border: `1 solid ${COLORS.border}`,
  },

  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  themeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.heading,
  },

  themeCount: {
    fontSize: 8,
    color: COLORS.muted,
  },

  themeExamples: {
    fontSize: 8,
    color: COLORS.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // ==========================================
  // Alertas
  // ==========================================
  alertBox: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  alertWarning: {
    backgroundColor: COLORS.riskMediumBg,
    borderLeft: `3 solid ${COLORS.riskMedium}`,
  },

  alertDanger: {
    backgroundColor: COLORS.riskHighBg,
    borderLeft: `3 solid ${COLORS.riskHigh}`,
  },

  alertSuccess: {
    backgroundColor: COLORS.riskLowBg,
    borderLeft: `3 solid ${COLORS.riskLow}`,
  },

  alertText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },

  // ==========================================
  // Ações Prioritárias
  // ==========================================
  actionCard: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    border: `1 solid ${COLORS.border}`,
    borderLeft: `3 solid ${COLORS.terracotta}`,
  },

  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  actionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.heading,
    flex: 1,
  },

  actionMeta: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 4,
  },

  // ==========================================
  // Sumário Executivo
  // ==========================================
  executiveSummary: {
    padding: 15,
    marginBottom: 20,
    backgroundColor: COLORS.cream,
    borderRadius: 8,
    border: `1 solid ${COLORS.sage}`,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.terracotta,
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.body,
    textAlign: 'justify',
  },

  // ==========================================
  // Score Display
  // ==========================================
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundAlt,
    border: `2 solid ${COLORS.terracotta}`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.terracotta,
  },

  scoreLabel: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ==========================================
  // Capa do Relatório
  // ==========================================
  coverLogo: {
    width: 120,
    marginBottom: 40,
  },

  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.terracotta,
    textAlign: 'center',
    marginBottom: 10,
  },

  coverSubtitle: {
    fontSize: 16,
    color: COLORS.heading,
    textAlign: 'center',
    marginBottom: 40,
  },

  coverMeta: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 4,
  },

  coverFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  coverFooterText: {
    fontSize: 9,
    color: COLORS.muted,
  },

  // ==========================================
  // Utilities
  // ==========================================
  row: {
    flexDirection: 'row',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  alignCenter: {
    alignItems: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },

  textRight: {
    textAlign: 'right',
  },

  mt10: {
    marginTop: 10,
  },

  mb10: {
    marginBottom: 10,
  },

  pageBreak: {
    marginTop: 'auto',
  },
});

export default styles;
