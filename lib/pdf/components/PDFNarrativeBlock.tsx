/**
 * PDF Narrative Block Component
 *
 * Bloco de texto narrativo para análises
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

interface PDFNarrativeBlockProps {
  title?: string;
  content: string;
  variant?: 'default' | 'summary' | 'alert';
}

export const PDFNarrativeBlock: React.FC<PDFNarrativeBlockProps> = ({
  title,
  content,
  variant = 'default',
}) => {
  const blockStyle =
    variant === 'summary'
      ? styles.executiveSummary
      : variant === 'alert'
      ? [styles.narrativeBlock, styles.alertWarning]
      : styles.narrativeBlock;

  const titleStyle =
    variant === 'summary' ? styles.summaryTitle : styles.narrativeTitle;

  const textStyle =
    variant === 'summary' ? styles.summaryText : styles.narrativeText;

  return (
    <View style={blockStyle}>
      {title && <Text style={titleStyle}>{title}</Text>}
      <Text style={textStyle}>{content}</Text>
    </View>
  );
};

export default PDFNarrativeBlock;
