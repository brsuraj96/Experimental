import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WordSearchWord } from '../../../types';
import { theme } from '../../../styles/theme';

interface WordListProps {
  words: WordSearchWord[];
}

const WordList: React.FC<WordListProps> = ({ words }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Words to Find:</Text>
      <ScrollView 
        contentContainerStyle={styles.wordList}
        showsVerticalScrollIndicator={false}
      >
        {words.map((word, index) => (
          <View 
            key={index} 
            style={[
              styles.wordItem, 
              word.isFound && styles.wordFound
            ]}
          >
            <Text 
              style={[
                styles.wordText, 
                word.isFound && styles.wordFoundText
              ]}
            >
              {word.word}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
    maxHeight: 200,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  wordItem: {
    backgroundColor: theme.colors.backgroundMedium,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  wordFound: {
    backgroundColor: theme.colors.success,
  },
  wordText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  wordFoundText: {
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
  },
});

export default WordList;