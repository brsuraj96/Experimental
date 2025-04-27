import React from "react";
import Svg, { Circle, Path, G } from "react-native-svg";
import { theme } from "../../styles/theme";

interface IconProps {
  size?: number;
  color?: string;
}

const IconFlowFree: React.FC<IconProps> = ({
  size = 24,
  color = theme.colors.white,
}) => {
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
        <Circle cx="6" cy="6" r="2" fill={theme.colors.red} />
        <Circle cx="18" cy="12" r="2" fill={theme.colors.red} />
        <Path
          d="M6 6H6V12H18V12"
          stroke={theme.colors.red}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Blue flow */}
        <Circle cx="12" cy="6" r="2" fill={theme.colors.blue} />
        <Circle cx="18" cy="18" r="2" fill={theme.colors.blue} />
        <Path
          d="M12 6V18H18"
          stroke={theme.colors.blue}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Green flow */}
        <Circle cx="6" cy="18" r="2" fill={theme.colors.green} />
        <Circle cx="12" cy="12" r="2" fill={theme.colors.green} />
        <Path
          d="M6 18V12H12"
          stroke={theme.colors.green}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default IconFlowFree;
