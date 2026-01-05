/**
 * PDF Header Component
 *
 * Cabeçalho reutilizável para relatórios
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  organizationName?: string;
  period?: {
    start: string;
    end: string;
  };
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({
  title,
  subtitle,
  organizationName,
  period,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      {organizationName && (
        <Text style={styles.headerSubtitle}>{organizationName}</Text>
      )}
      {period && (
        <Text style={[styles.headerSubtitle, { fontSize: 9, marginTop: 4 }]}>
          Período: {formatDate(period.start)} a {formatDate(period.end)}
        </Text>
      )}
    </View>
  );
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default PDFHeader;
