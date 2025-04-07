import React from 'react';
import Svg, { Rect, G, Text } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const IconSlideTiles: React.FC<IconProps> = ({ size = 24, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Background */}
        <Rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="2"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
        
        {/* Top row tiles */}
        <G>
          <Rect
            x="3"
            y="3"
            width="5"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="5.5"
            y="6.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            1
          </Text>
        </G>
        
        <G>
          <Rect
            x="9"
            y="3"
            width="5"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="11.5"
            y="6.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            2
          </Text>
        </G>
        
        <G>
          <Rect
            x="15"
            y="3"
            width="6"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="18"
            y="6.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            3
          </Text>
        </G>
        
        {/* Middle row tiles */}
        <G>
          <Rect
            x="3"
            y="9"
            width="5"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="5.5"
            y="12.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            4
          </Text>
        </G>
        
        <G>
          <Rect
            x="9"
            y="9"
            width="5"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="11.5"
            y="12.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            5
          </Text>
        </G>
        
        <G>
          <Rect
            x="15"
            y="9"
            width="6"
            height="5"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="18"
            y="12.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            6
          </Text>
        </G>
        
        {/* Bottom row tiles */}
        <G>
          <Rect
            x="3"
            y="15"
            width="5"
            height="6"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="5.5"
            y="18.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            7
          </Text>
        </G>
        
        <G>
          <Rect
            x="9"
            y="15"
            width="5"
            height="6"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <Text
            x="11.5"
            y="18.5"
            fontSize="3"
            fill={color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            8
          </Text>
        </G>
        
        {/* Empty space for tile 9 */}
      </G>
    </Svg>
  );
};

export default IconSlideTiles;
