import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Platform 
} from 'react-native';
import { CrosswordCell as CrosswordCellType } from '../../../types';
import { theme } from '../../../styles/theme';

interface CrosswordCellProps {
  cell: CrosswordCellType;
  size: number;
  onPress: () => void;
}

const CrosswordCell: React.FC<CrosswordCellProps> = ({ 
  cell, 
  size, 
  onPress 
}) => {
  if (cell.isBlank) {
    return (
      <View
        style={[
          styles.blankCell,
          { width: size, height: size }
        ]}
      />
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: size, height: size },
        cell.isHighlighted && styles.highlightedCell,
        cell.isError && styles.errorCell
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {cell.number !== undefined && (
        <Text style={styles.cellNumber}>{cell.number}</Text>
      )}
      <Text style={styles.cellText}>
        {cell.userLetter}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardBackground,
    margin: 1,
  },
  blankCell: {
    backgroundColor: theme.colors.background,
    margin: 1,
  },
  highlightedCell: {
    backgroundColor: theme.colors.accent + '40', // Add transparency
    borderColor: theme.colors.accent,
  },
  errorCell: {
    backgroundColor: theme.colors.error + '40', // Add transparency
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  cellNumber: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
    color: theme.colors.textDim,
  },
});

export default CrosswordCell;