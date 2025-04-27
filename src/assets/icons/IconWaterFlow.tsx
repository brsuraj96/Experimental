import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { theme } from "../../styles/theme";

interface IconProps {
  size?: number;
  color?: string;
}

const IconWaterFlow: React.FC<IconProps> = ({
  size = 24,
  color = theme.colors.white,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Pipe Corner Piece */}
      <Path
        d="M4 10V14C4 15.1046 4.89543 16 6 16H10V12H6C4.89543 12 4 11.1046 4 10Z"
        fill={color}
        strokeWidth="1"
        stroke={theme.colors.transparent}
        strokeLinecap="round"
      />

      {/* Pipe Straight Piece */}
      <Path
        d="M14 14H18C19.1046 14 20 13.1046 20 12V12C20 10.8954 19.1046 10 18 10H14V14Z"
        fill={color}
        strokeWidth="1"
        stroke={theme.colors.transparent}
        strokeLinecap="round"
      />

      {/* Pipe T Piece */}
      <Path
        d="M10 14V18C10 19.1046 10.8954 20 12 20V20C13.1046 20 14 19.1046 14 18V14H10Z"
        fill={color}
        strokeWidth="1"
        stroke={theme.colors.transparent}
        strokeLinecap="round"
      />

      {/* Water Droplets */}
      <Circle cx="7" cy="12" r="1.5" fill={theme.colors.water} />
      <Circle cx="10" cy="9" r="1" fill={theme.colors.water} />
      <Circle cx="13" cy="17" r="1" fill={theme.colors.water} />
    </Svg>
  );
};

export default IconWaterFlow;
