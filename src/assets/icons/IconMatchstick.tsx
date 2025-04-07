import React from 'react';
import Svg, { Line, Circle, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconMatchstick: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Matchsticks */}
        <Line
          x1="6"
          y1="6"
          x2="18"
          y2="6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="6"
          y1="12"
          x2="18"
          y2="12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="6"
          y1="18"
          x2="18"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="6"
          y1="6"
          x2="6"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="12"
          y1="6"
          x2="12"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Line
          x1="18"
          y1="6"
          x2="18"
          y2="18"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Dots indicating junction points */}
        <Circle cx="6" cy="6" r="1.5" fill={color} />
        <Circle cx="12" cy="6" r="1.5" fill={color} />
        <Circle cx="18" cy="6" r="1.5" fill={color} />
        <Circle cx="6" cy="12" r="1.5" fill={color} />
        <Circle cx="12" cy="12" r="1.5" fill={color} />
        <Circle cx="18" cy="12" r="1.5" fill={color} />
        <Circle cx="6" cy="18" r="1.5" fill={color} />
        <Circle cx="12" cy="18" r="1.5" fill={color} />
        <Circle cx="18" cy="18" r="1.5" fill={color} />
      </G>
    </Svg>
  );
};

export default IconMatchstick;
