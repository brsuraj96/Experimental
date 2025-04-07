import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconFlowFree: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Grid background */}
        <Path
          d="M3 3H21V21H3V3Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Red flow */}
        <Circle cx="6" cy="6" r="2" fill="#EF5350" />
        <Circle cx="18" cy="12" r="2" fill="#EF5350" />
        <Path
          d="M6 6H6V12H18V12"
          stroke="#EF5350"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Blue flow */}
        <Circle cx="12" cy="6" r="2" fill="#4DD0E1" />
        <Circle cx="18" cy="18" r="2" fill="#4DD0E1" />
        <Path
          d="M12 6V18H18"
          stroke="#4DD0E1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Green flow */}
        <Circle cx="6" cy="18" r="2" fill="#81C784" />
        <Circle cx="12" cy="12" r="2" fill="#81C784" />
        <Path
          d="M6 18V12H12"
          stroke="#81C784"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default IconFlowFree;
