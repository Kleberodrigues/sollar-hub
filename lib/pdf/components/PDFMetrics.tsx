/**
 * PDF Metrics Components
 *
 * Cards de métricas para relatórios
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  suffix,
  description,
}) => {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value}
        {suffix && <Text style={{ fontSize: 10 }}>{suffix}</Text>}
      </Text>
      {description && <Text style={styles.metricSmall}>{description}</Text>}
    </View>
  );
};

interface MetricsGridProps {
  metrics: MetricCardProps[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <View style={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </View>
  );
};

export default MetricsGrid;
