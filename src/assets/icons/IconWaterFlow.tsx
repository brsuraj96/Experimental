import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconWaterFlow: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Border */}
        <Path
          d="M3 3H21V21H3V3Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Water source */}
        <Circle cx="6" cy="6" r="2" fill="#4DD0E1" />
        
        {/* Pipes */}
        <Path
          d="M6 8V12H10V16H14V12H18V17"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Curved pipe sections */}
        <Path
          d="M6 12C6 12 6 12 8 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M10 16C10 16 10 16 12 16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M14 12C14 12 14 12 16 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Water droplets */}
        <Path
          d="M6 8.5L6.5 9L5.5 9L6 8.5Z"
          fill="#4DD0E1"
        />
        <Path
          d="M10 12.5L10.5 13L9.5 13L10 12.5Z"
          fill="#4DD0E1"
        />
        <Path
          d="M14 14.5L14.5 15L13.5 15L14 14.5Z"
          fill="#4DD0E1"
        />
        <Path
          d="M18 14.5L18.5 15L17.5 15L18 14.5Z"
          fill="#4DD0E1"
        />
        
        {/* End point */}
        <Path
          d="M17 17H19"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M18 17V19"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export default IconWaterFlow;
