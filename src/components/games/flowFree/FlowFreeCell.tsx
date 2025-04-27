import React from "react";
import { View, StyleSheet } from "react-native";
import { FlowPoint } from "../../../types";
import { theme } from "../../../styles/theme";

interface FlowFreeCellProps {
  cell: FlowPoint | null;
  row: number;
  col: number;
  size: number;
  isActive: boolean;
}

const FlowFreeCell: React.FC<FlowFreeCellProps> = ({
  cell,
  row,
  col,
  size,
  isActive,
}) => {
  if (!cell) {
    return (
      <View
        style={[
          styles.cell,
          {
            top: row * size,
            left: col * size,
            width: size,
            height: size,
          },
        ]}
      />
    );
  }

  // Render cell with endpoint or connections
  return (
    <View
      style={[
        styles.cell,
        {
          top: row * size,
          left: col * size,
          width: size,
          height: size,
        },
      ]}
    >
      {/* Cell background for connections */}
      {cell.connections.length > 0 && (
        <View
          style={[
            styles.connectionBackground,
            {
              backgroundColor: cell.color,
            },
          ]}
        />
      )}

      {/* Draw connections */}
      {cell.connections.map((connection, index) => {
        // Determine the direction of the connection
        const fromDirection = getDirection(
          row,
          col,
          connection.fromRow,
          connection.fromCol
        );
        const toDirection = getDirection(
          row,
          col,
          connection.toRow,
          connection.toCol
        );

        return (
          <View
            key={`conn-${index}`}
            style={[
              styles.connection,
              getConnectionStyle(fromDirection, toDirection, size),
              {
                backgroundColor: cell.color,
              },
            ]}
          />
        );
      })}

      {/* Endpoint circle */}
      {cell.isEndpoint && (
        <View
          style={[
            styles.endpoint,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              backgroundColor: cell.color,
              borderColor: isActive
                ? theme.colors.white
                : `${theme.colors.backgroundDark}4D`,
              transform: [{ scale: isActive ? 1.1 : 1 }],
            },
          ]}
        />
      )}
    </View>
  );
};

// Get the direction from one cell to another
const getDirection = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): "top" | "right" | "bottom" | "left" => {
  if (fromRow > toRow) return "top";
  if (fromRow < toRow) return "bottom";
  if (fromCol > toCol) return "left";
  if (fromCol < toCol) return "right";
  return "top"; // fallback
};

// Create connection styles based on direction
const getConnectionStyle = (
  fromDirection: string,
  toDirection: string,
  size: number
) => {
  const thickness = size * 0.4;
  const offset = (size - thickness) / 2;

  const style: any = {
    width: thickness,
    height: thickness,
  };

  // Extend the connection in both directions
  if (fromDirection === "top" || toDirection === "top") {
    style.height = thickness + offset;
    style.top = 0;
    style.bottom = undefined;
  }

  if (fromDirection === "bottom" || toDirection === "bottom") {
    style.height = thickness + offset;
    style.bottom = 0;
    style.top = undefined;
  }

  if (fromDirection === "left" || toDirection === "left") {
    style.width = thickness + offset;
    style.left = 0;
    style.right = undefined;
  }

  if (fromDirection === "right" || toDirection === "right") {
    style.width = thickness + offset;
    style.right = 0;
    style.left = undefined;
  }

  // Handle corner cases
  if (
    (fromDirection === "top" && toDirection === "right") ||
    (fromDirection === "right" && toDirection === "top")
  ) {
    style.width = thickness + offset;
    style.height = thickness + offset;
    style.top = 0;
    style.right = 0;
    style.borderBottomLeftRadius = thickness;
  } else if (
    (fromDirection === "top" && toDirection === "left") ||
    (fromDirection === "left" && toDirection === "top")
  ) {
    style.width = thickness + offset;
    style.height = thickness + offset;
    style.top = 0;
    style.left = 0;
    style.borderBottomRightRadius = thickness;
  } else if (
    (fromDirection === "bottom" && toDirection === "right") ||
    (fromDirection === "right" && toDirection === "bottom")
  ) {
    style.width = thickness + offset;
    style.height = thickness + offset;
    style.bottom = 0;
    style.right = 0;
    style.borderTopLeftRadius = thickness;
  } else if (
    (fromDirection === "bottom" && toDirection === "left") ||
    (fromDirection === "left" && toDirection === "bottom")
  ) {
    style.width = thickness + offset;
    style.height = thickness + offset;
    style.bottom = 0;
    style.left = 0;
    style.borderTopRightRadius = thickness;
  } else if (
    (fromDirection === "top" && toDirection === "bottom") ||
    (fromDirection === "bottom" && toDirection === "top")
  ) {
    style.height = size;
    style.top = 0;
  } else if (
    (fromDirection === "left" && toDirection === "right") ||
    (fromDirection === "right" && toDirection === "left")
  ) {
    style.width = size;
    style.left = 0;
  }

  return style;
};

const styles = StyleSheet.create({
  cell: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  connectionBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
    backgroundColor: theme.colors.backgroundLight,
  },
  connection: {
    position: "absolute",
    backgroundColor: theme.colors.primary, // Will be overridden by dynamic color
    borderRadius: 2,
  },
  endpoint: {
    position: "absolute",
    borderWidth: 2,
    borderColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default FlowFreeCell;
