import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';

interface MatchstickControlsProps {
  onMove: (dx: number, dy: number) => void;
  onRotate: (clockwise: boolean) => void;
  onHint: () => void;
  isMatchstickSelected: boolean;
}

const MatchstickControls: React.FC<MatchstickControlsProps> = ({
  onMove,
  onRotate,
  onHint,
  isMatchstickSelected,
}) => {
  return (
    <View style={styles.container}>
      {/* Movement Controls */}
      <View style={styles.movementControls}>
        <TouchableOpacity 
          style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
          onPress={() => isMatchstickSelected && onMove(0, -20)}
          disabled={!isMatchstickSelected}
        >
          <Feather name="arrow-up" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
        </TouchableOpacity>
        
        <View style={styles.middleRow}>
          <TouchableOpacity 
            style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
            onPress={() => isMatchstickSelected && onMove(-20, 0)}
            disabled={!isMatchstickSelected}
          >
            <Feather name="arrow-left" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.hintButton]} 
            onPress={onHint}
          >
            <Feather name="help-circle" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
            onPress={() => isMatchstickSelected && onMove(20, 0)}
            disabled={!isMatchstickSelected}
          >
            <Feather name="arrow-right" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
          onPress={() => isMatchstickSelected && onMove(0, 20)}
          disabled={!isMatchstickSelected}
        >
          <Feather name="arrow-down" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
        </TouchableOpacity>
      </View>
      
      {/* Rotation Controls */}
      <View style={styles.rotationControls}>
        <TouchableOpacity 
          style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
          onPress={() => isMatchstickSelected && onRotate(false)}
          disabled={!isMatchstickSelected}
        >
          <MaterialIcons name="rotate-left" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, !isMatchstickSelected && styles.buttonDisabled]} 
          onPress={() => isMatchstickSelected && onRotate(true)}
          disabled={!isMatchstickSelected}
        >
          <MaterialIcons name="rotate-right" size={24} color={isMatchstickSelected ? theme.colors.text : theme.colors.textDim} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  movementControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  rotationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  hintButton: {
    backgroundColor: theme.colors.secondary,
  },
});

export default MatchstickControls;