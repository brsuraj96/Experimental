import React from 'react';
import Svg, { Path, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconSudoku: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Border */}
        <Rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="2"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Horizontal grid lines */}
        <Path d="M2 8H22" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <Path d="M2 14H22" stroke={color} strokeWidth="1" strokeLinecap="round" />
        
        {/* Vertical grid lines */}
        <Path d="M8 2V22" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <Path d="M14 2V22" stroke={color} strokeWidth="1" strokeLinecap="round" />
        
        {/* Numbers */}
        <Path
          d="M5 5.5C5 5.22386 5.22386 5 5.5 5C5.77614 5 6 5.22386 6 5.5C6 5.77614 5.77614 6 5.5 6C5.22386 6 5 5.77614 5 5.5Z"
          fill={color}
        />
        <Path
          d="M11 11.5C11 11.2239 11.2239 11 11.5 11C11.7761 11 12 11.2239 12 11.5C12 11.7761 11.7761 12 11.5 12C11.2239 12 11 11.7761 11 11.5Z"
          fill={color}
        />
        <Path
          d="M17 17.5C17 17.2239 17.2239 17 17.5 17C17.7761 17 18 17.2239 18 17.5C18 17.7761 17.7761 18 17.5 18C17.2239 18 17 17.7761 17 17.5Z"
          fill={color}
        />
        
        {/* Numbers */}
        <Path
          d="M16.5 5L17.5 5L17.5 6L16.5 6L16.5 5Z"
          fill={color}
        />
        <Path
          d="M10.5 11L11.5 11L11.5 12L10.5 12L10.5 11Z"
          fill={color}
        />
        <Path
          d="M4.5 18L5.5 18L5.5 19L4.5 19L4.5 18Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default IconSudoku;
