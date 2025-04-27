import React from "react";
import Svg, { Path, G, Circle, Text } from "react-native-svg";
import { theme } from "../../styles/theme";

interface IconProps {
  size?: number;
  color?: string;
}

const IconTrivia: React.FC<IconProps> = ({
  size = 24,
  color = theme.colors.white,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Question mark circle */}
        <Circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Question mark */}
        <Path
          d="M12 17V16.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M12 14.5C12 13.6716 12.5 13 13.5 12.5C14.5 12 15 11.3284 15 10.5C15 9.11929 13.6569 8 12 8C10.3431 8 9 9.11929 9 10.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Multiple choice options */}
        <G>
          <Circle cx="6" cy="20" r="1" fill={color} />
          <Text
            x="7.5"
            y="20.5"
            fontSize="2"
            fill={color}
            textAnchor="start"
            alignmentBaseline="middle"
          >
            A
          </Text>
        </G>

        <G>
          <Circle cx="12" cy="20" r="1" fill={color} />
          <Text
            x="13.5"
            y="20.5"
            fontSize="2"
            fill={color}
            textAnchor="start"
            alignmentBaseline="middle"
          >
            B
          </Text>
        </G>

        <G>
          <Circle cx="18" cy="20" r="1" fill={color} />
          <Text
            x="19.5"
            y="20.5"
            fontSize="2"
            fill={color}
            textAnchor="start"
            alignmentBaseline="middle"
          >
            C
          </Text>
        </G>
      </G>
    </Svg>
  );
};

export default IconTrivia;
