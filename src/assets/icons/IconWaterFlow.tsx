import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconWaterFlow: React.FC<IconProps> = ({ size = 24, color = '#00BCD4' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Pipe Elbow Piece */}
      <Path
        d="M4 12C4 10.8954 4.89543 10 6 10H10V14H6C4.89543 14 4 13.1046 4 12Z"
        fill={color}
        strokeWidth="1"
        stroke="#FFFFFF"
        strokeLinecap="round"
      />
      <Path
        d="M10 10V6C10 4.89543 10.8954 4 12 4V4C13.1046 4 14 4.89543 14 6V10H10Z"
        fill={color}
        strokeWidth="1"
        stroke="#FFFFFF"
        strokeLinecap="round"
      />
      
      {/* Pipe Straight Piece */}
      <Path
        d="M14 14H18C19.1046 14 20 13.1046 20 12V12C20 10.8954 19.1046 10 18 10H14V14Z"
        fill={color}
        strokeWidth="1"
        stroke="#FFFFFF"
        strokeLinecap="round"
      />
      
      {/* Pipe T Piece */}
      <Path
        d="M10 14V18C10 19.1046 10.8954 20 12 20V20C13.1046 20 14 19.1046 14 18V14H10Z"
        fill={color}
        strokeWidth="1"
        stroke="#FFFFFF"
        strokeLinecap="round"
      />
      
      {/* Water Droplet */}
      <Circle cx="7" cy="12" r="1.5" fill="#FFFFFF" />
      <Circle cx="10" cy="9" r="1" fill="#FFFFFF" />
      <Circle cx="13" cy="17" r="1" fill="#FFFFFF" />
    </Svg>
  );
};

export default IconWaterFlow;