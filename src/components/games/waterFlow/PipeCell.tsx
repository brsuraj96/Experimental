import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { PipeType, PipeCell as PipeCellType } from '../../../types';

interface PipeCellProps {
  cell: PipeCellType;
  size: number;
  onPress: () => void;
}

const PipeCell: React.FC<PipeCellProps> = ({ cell, size, onPress }) => {
  const { type, rotation, isFixed, isConnected } = cell;
  const cellSize = size;
  
  // Define colors based on cell state
  const baseColor = isConnected ? '#4DD0E1' : '#607D8B';
  const waterColor = isConnected ? '#FFFFFF' : 'transparent';
  const borderColor = isFixed ? '#FF6F61' : (isConnected ? '#81C784' : '#455A64');
  
  // Render the pipe based on its type
  const renderPipe = () => {
    switch (type) {
      case PipeType.STRAIGHT:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.straightPipe, { backgroundColor: baseColor }]} />
            {isConnected && <View style={[styles.straightWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.CORNER:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.cornerPipe, { backgroundColor: baseColor }]} />
            {isConnected && <View style={[styles.cornerWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.T_SHAPE:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.tPipe, { backgroundColor: baseColor }]} />
            {isConnected && <View style={[styles.tWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.CROSS:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.crossPipe, { backgroundColor: baseColor }]} />
            {isConnected && <View style={[styles.crossWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.SOURCE:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.sourcePipe, { backgroundColor: baseColor }]} />
            <View style={[styles.sourceCircle, { backgroundColor: '#FF6F61' }]} />
            {isConnected && <View style={[styles.sourceWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.DESTINATION:
        return (
          <View style={[styles.pipe, { transform: [{ rotate: `${rotation}deg` }] }]}>
            <View style={[styles.destinationPipe, { backgroundColor: baseColor }]} />
            <View style={[styles.destinationCircle, { backgroundColor: '#81C784' }]} />
            {isConnected && <View style={[styles.destinationWater, { backgroundColor: waterColor }]} />}
          </View>
        );
        
      case PipeType.EMPTY:
      default:
        return <View style={[styles.emptyPipe, { backgroundColor: '#37474F' }]} />;
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          borderColor: borderColor
        }
      ]}
      activeOpacity={isFixed ? 1 : 0.7}
      disabled={isFixed || type === PipeType.EMPTY}
    >
      {renderPipe()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#263238'
  },
  pipe: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPipe: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  straightPipe: {
    width: '100%',
    height: '25%',
    borderRadius: 4,
  },
  straightWater: {
    position: 'absolute',
    width: '90%',
    height: '10%',
    borderRadius: 2,
  },
  cornerPipe: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 16,
    // Create L-shape
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderColor: '#263238',
  },
  cornerWater: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: '40%',
    height: '40%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 8,
  },
  tPipe: {
    width: '100%',
    height: '100%',
    // Create T-shape
    borderTopWidth: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderColor: '#263238',
  },
  tWater: {
    position: 'absolute',
    bottom: 5,
    width: '60%',
    height: '40%',
  },
  crossPipe: {
    width: '100%',
    height: '100%',
    // Create a + shape with a hollow center
    borderTopWidth: 12,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderColor: '#263238',
  },
  crossWater: {
    position: 'absolute',
    width: '10%',
    height: '10%',
    borderRadius: 5,
  },
  sourcePipe: {
    width: '50%',
    height: '25%',
    position: 'absolute',
    right: 0,
    borderRadius: 4,
  },
  sourceCircle: {
    width: '40%',
    height: '40%',
    position: 'absolute',
    left: '10%',
    borderRadius: 20,
  },
  sourceWater: {
    width: '30%',
    height: '10%',
    position: 'absolute',
    right: '10%',
    borderRadius: 2,
  },
  destinationPipe: {
    width: '50%',
    height: '25%',
    position: 'absolute',
    left: 0,
    borderRadius: 4,
  },
  destinationCircle: {
    width: '40%',
    height: '40%',
    position: 'absolute',
    right: '10%',
    borderRadius: 20,
  },
  destinationWater: {
    width: '30%',
    height: '10%',
    position: 'absolute',
    left: '10%',
    borderRadius: 2,
  },
});

export default PipeCell;