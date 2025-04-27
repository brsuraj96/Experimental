import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  ImageSourcePropType,
  GestureResponderEvent,
} from "react-native";
import { DifferenceSpot } from "../../../types";
import { theme } from "../../../styles/theme";

interface SpotDifferenceImageProps {
  imageSource: string;
  imageNumber: 1 | 2;
  maxWidth: number;
  differences: DifferenceSpot[];
  onTap: (imageNum: 1 | 2, x: number, y: number) => void;
}

const SpotDifferenceImage: React.FC<SpotDifferenceImageProps> = ({
  imageSource,
  imageNumber,
  maxWidth,
  differences,
  onTap,
}) => {
  // Handle touch on image
  const handleTouch = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    onTap(imageNumber, locationX, locationY);
  };

  // Use the SVG directly as the source
  // Correctly typed as ImageSourcePropType
  const source: ImageSourcePropType = { uri: imageSource };

  return (
    <View style={[styles.container, { width: maxWidth }]}>
      <TouchableWithoutFeedback onPress={handleTouch}>
        <View>
          <Image
            source={source}
            style={{ width: maxWidth, height: maxWidth * 0.75 }}
            resizeMode="contain"
          />

          {/* Overlay for found differences */}
          {differences.map(
            (spot, index) =>
              spot.isFound && (
                <View
                  key={index}
                  style={[
                    styles.foundDifference,
                    {
                      left: spot.x - spot.radius,
                      top: spot.y - spot.radius,
                      width: spot.radius * 2,
                      height: spot.radius * 2,
                      borderRadius: spot.radius,
                    },
                  ]}
                />
              )
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  foundDifference: {
    position: "absolute",
    backgroundColor: `${theme.colors.success}99`, // Using success color with 60% opacity
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
});

export default SpotDifferenceImage;
