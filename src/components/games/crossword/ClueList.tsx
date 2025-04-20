import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { CrosswordClue } from '../../../types';
import { theme } from '../../../styles/theme';

interface ClueListProps {
  clues: CrosswordClue[];
  activeClue: CrosswordClue | null;
  title: string;
  onCluePress: (clue: CrosswordClue) => void;
}

const ClueList: React.FC<ClueListProps> = ({ 
  clues, 
  activeClue, 
  title, 
  onCluePress 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        {clues.map((clue) => (
          <TouchableOpacity
            key={`${clue.direction}-${clue.number}`}
            style={[
              styles.clueItem,
              activeClue && 
                activeClue.number === clue.number && 
                activeClue.direction === clue.direction && 
                styles.activeClue
            ]}
            onPress={() => onCluePress(clue)}
          >
            <Text style={styles.clueNumber}>{clue.number}.</Text>
            <Text 
              style={styles.clueText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {clue.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  clueItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  activeClue: {
    backgroundColor: theme.colors.accent + '30', // semi-transparent accent color
  },
  clueNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 6,
    minWidth: 20,
  },
  clueText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
});

export default ClueList;