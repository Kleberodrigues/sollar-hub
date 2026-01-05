/**
 * PDF Footer Component
 *
 * Rodapé com paginação e informações de geração
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './PDFStyles';

interface PDFFooterProps {
  generatedAt?: string;
  pageNumber?: number;
  totalPages?: number;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({
  generatedAt,
  pageNumber,
  totalPages,
}) => {
  const dateStr = generatedAt || new Date().toLocaleString('pt-BR');

  return (
    <View style={styles.footer} fixed>
      <Text>Sollar Insight Hub | Relatório gerado em {dateStr}</Text>
      {pageNumber && totalPages && (
        <Text>
          Página {pageNumber} de {totalPages}
        </Text>
      )}
    </View>
  );
};

export default PDFFooter;
