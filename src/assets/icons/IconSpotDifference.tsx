import React from 'react';
import Svg, { Rect, Circle, G, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconSpotDifference: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Left image frame */}
        <Rect
          x="2"
          y="5"
          width="8"
          height="14"
          rx="1"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Right image frame */}
        <Rect
          x="14"
          y="5"
          width="8"
          height="14"
          rx="1"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* VS text */}
        <Path
          d="M12 10L11 14"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M13 14L12 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Left image content (same in both) */}
        <Circle cx="4" cy="8" r="1" fill={color} />
        <Circle cx="8" cy="8" r="1" fill={color} />
        <Circle cx="6" cy="11" r="1" fill={color} />
        <Circle cx="4" cy="14" r="1" fill={color} />
        <Circle cx="8" cy="14" r="1" fill={color} />
        
        {/* Right image content (with one difference) */}
        <Circle cx="16" cy="8" r="1" fill={color} />
        <Circle cx="20" cy="8" r="1" fill={color} />
        <Circle cx="18" cy="11" r="1" fill={color} />
        <Circle cx="16" cy="14" r="1" fill={color} />
        {/* The difference - a star instead of a circle */}
        <Path
          d="M20 14L20.5 13L21 14L20 14.5L21 15L20 14.5L19 15L20 14.5L19 14L20 13.5L20 14Z"
          fill={color}
        />
        
        {/* Magnifying glass highlighting the difference */}
        <Circle cx="19.5" cy="14.5" r="2" stroke={color} strokeWidth="0.8" fill="none" />
        <Path
          d="M21 16L22 17"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export default IconSpotDifference;
