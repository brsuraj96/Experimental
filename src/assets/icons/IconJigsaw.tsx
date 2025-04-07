import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconJigsaw: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Jigsaw pieces */}
        <Path
          d="M4 5.5V9.5C4 10.05 4.224 10.5 5 10.5C5.776 10.5 6 11.1716 6 12C6 12.8284 5.776 13.5 5 13.5C4.224 13.5 4 13.95 4 14.5V18.5C4 19.3284 4.67157 20 5.5 20H9.5C10.05 20 10.5 19.776 10.5 19C10.5 18.224 11.1716 18 12 18C12.8284 18 13.5 18.224 13.5 19C13.5 19.776 13.95 20 14.5 20H18.5C19.3284 20 20 19.3284 20 18.5V14.5C20 13.95 19.776 13.5 19 13.5C18.224 13.5 18 12.8284 18 12C18 11.1716 18.224 10.5 19 10.5C19.776 10.5 20 10.05 20 9.5V5.5C20 4.67157 19.3284 4 18.5 4H14.5C13.95 4 13.5 4.224 13.5 5C13.5 5.776 12.8284 6 12 6C11.1716 6 10.5 5.776 10.5 5C10.5 4.224 10.05 4 9.5 4H5.5C4.67157 4 4 4.67157 4 5.5Z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Inner dividing lines */}
        <Path
          d="M12 4V20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 3"
        />
        <Path
          d="M4 12H20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 3"
        />
      </G>
    </Svg>
  );
};

export default IconJigsaw;
