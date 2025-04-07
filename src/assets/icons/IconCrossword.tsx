import React from 'react';
import Svg, { Rect, Path, G, Text } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconCrossword: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Border */}
        <Rect
          x="3"
          y="3"
          width="18"
          height="18"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Grid lines */}
        <Path d="M3 7H21" stroke={color} strokeWidth="1" />
        <Path d="M3 11H21" stroke={color} strokeWidth="1" />
        <Path d="M3 15H21" stroke={color} strokeWidth="1" />
        <Path d="M3 19H21" stroke={color} strokeWidth="1" />
        
        <Path d="M7 3V21" stroke={color} strokeWidth="1" />
        <Path d="M11 3V21" stroke={color} strokeWidth="1" />
        <Path d="M15 3V21" stroke={color} strokeWidth="1" />
        <Path d="M19 3V21" stroke={color} strokeWidth="1" />
        
        {/* Letters */}
        <Text
          x="5"
          y="9"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          P
        </Text>
        <Text
          x="9"
          y="9"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          U
        </Text>
        <Text
          x="13"
          y="9"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Z
        </Text>
        <Text
          x="17"
          y="9"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Z
        </Text>
        
        <Text
          x="9"
          y="13"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          A
        </Text>
        
        <Text
          x="9"
          y="17"
          fontSize="4"
          fill={color}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          M
        </Text>
        
        {/* Black cells */}
        <Rect x="3" y="3" width="4" height="4" fill={color} />
        <Rect x="17" y="11" width="4" height="4" fill={color} />
        <Rect x="3" y="17" width="4" height="4" fill={color} />
        <Rect x="13" y="17" width="8" height="4" fill={color} />
      </G>
    </Svg>
  );
};

export default IconCrossword;
