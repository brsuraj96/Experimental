import React from "react";
import Svg, { Path, Circle, G, Rect } from "react-native-svg";
import { theme } from "../../styles/theme";

interface IconProps {
  size?: number;
  color?: string;
}

const IconRiddles: React.FC<IconProps> = ({
  size = 24,
  color = theme.colors.white,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Light bulb outline */}
        <Path
          d="M9 16.5C9 15.5 7 14 7 11C7 8.23858 9.23858 6 12 6C14.7614 6 17 8.23858 17 11C17 14 15 15.5 15 16.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Light bulb base */}
        <Path
          d="M9 17H15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M10 19H14"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Light rays */}
        <Path
          d="M12 3V4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M18.5 5.5L17.5 6.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M21 12L20 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M5.5 5.5L6.5 6.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M4 12L3 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Puzzle elements inside the bulb */}
        <Circle cx="12" cy="10" r="1" fill={color} />
        <Path
          d="M10 12L14 12"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <Path
          d="M10 14L14 14"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="1 1"
        />
      </G>
    </Svg>
  );
};

export default IconRiddles;
