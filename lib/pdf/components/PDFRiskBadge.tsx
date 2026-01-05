/**
 * PDF Risk Badge Component
 *
 * Badge visual para níveis de risco
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

type RiskLevel = 'low' | 'medium' | 'high';

interface PDFRiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showLabel?: boolean;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Baixo Risco',
  medium: 'Risco Médio',
  high: 'Alto Risco',
};

export const PDFRiskBadge: React.FC<PDFRiskBadgeProps> = ({
  level,
  score,
  showLabel = true,
}) => {
  const badgeStyle = [
    styles.riskBadge,
    level === 'high'
      ? styles.riskHigh
      : level === 'medium'
      ? styles.riskMedium
      : styles.riskLow,
  ];

  return (
    <View style={badgeStyle}>
      <Text>
        {showLabel && RISK_LABELS[level]}
        {score !== undefined && ` (${score.toFixed(2)})`}
      </Text>
    </View>
  );
};

export default PDFRiskBadge;
