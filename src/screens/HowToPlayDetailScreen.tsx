import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SUDOKU_GRID = [
  [7, 1, 5, 6, 2, 3, 9, 4, 8],
  [4, 3, 6, 5, 9, 8, 7, 2, 1],
  [2, 8, 9, 1, 7, 4, 3, 5, 6],
  [1, 7, 3, 2, 8, 9, 4, 6, 5],
  [6, 9, 8, 3, 4, 5, 2, 1, 7],
  [5, 4, 2, 7, 6, 1, 8, 9, 3],
  [3, 6, 1, 8, 2, 5, 1, 5, 9],
  [8, 2, 7, 9, 5, 6, 1, 3, 4],
  [9, 5, 4, 1, 3, 7, 6, 8, 2],
];

const Slide1 = ({ animations }: { animations: any }) => {
  const boxOpacity = animations.boxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });
  const rowOpacity = animations.rowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });
  const colOpacity = animations.colAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View style={[styles.slide, { opacity: animations.fadeAnim }]}>
      <View style={styles.sudokuGridContainer}>
        <View style={styles.sudokuGrid}>
          {SUDOKU_GRID.map((row, r) => (
            <View key={r} style={styles.sudokuRow}>
              {row.map((num, c) => {
                const isBox = r >= 0 && r <= 2 && c <= 2;
                const isRow = r === 6;
                const isCol = c === 5;
                return (
                  <View key={c} style={styles.sudokuCellWrap}>
                    {isBox && (
                      <Animated.View
                        style={[
                          styles.sudokuCellHighlight,
                          {
                            backgroundColor: "#3CB371",
                            opacity: boxOpacity,
                            borderColor: "#3CB371",
                            borderWidth: 2,
                            borderRadius: 4,
                          },
                        ]}
                      />
                    )}
                    {isRow && (
                      <Animated.View
                        style={[
                          styles.sudokuCellHighlight,
                          {
                            backgroundColor: "#FFD600",
                            opacity: rowOpacity,
                            borderColor: "#FFD600",
                            borderWidth: 2,
                            borderRadius: 4,
                          },
                        ]}
                      />
                    )}
                    {isCol && (
                      <Animated.View
                        style={[
                          styles.sudokuCellHighlight,
                          {
                            backgroundColor: "#FF6F61",
                            opacity: colOpacity,
                            borderColor: "#FF6F61",
                            borderWidth: 2,
                            borderRadius: 4,
                          },
                        ]}
                      />
                    )}
                    <Text style={[styles.sudokuCell]}>{num}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
      <Animated.Text style={styles.slide1Text}>
        In classic sudoku, each
        <Text style={{ color: "#4CAF50" }}> 3×3 box</Text>,
        <Text style={{ color: "#f1c40f" }}> horizontal row</Text>, and
        <Text style={{ color: "#e74c3c" }}> vertical column</Text> on the Sudoku
        grid should have digits from 1 to 9.
      </Animated.Text>
    </Animated.View>
  );
};

const SlideVideo = ({
  videoSource,
  shouldPlay,
  description,
  highlightText,
  onLayout,
}: {
  videoSource: any;
  shouldPlay: boolean;
  description: string;
  highlightText: string;
  onLayout?: (e: any) => void;
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<Video>(null);

  // Always reset videoLoaded to false on mount and when shouldPlay changes
  useEffect(() => {
    setVideoLoaded(false);
  }, [videoSource]);

  return (
    <View style={styles.videoSlideWrapper} onLayout={onLayout}>
      <View style={styles.videoContainer}>
        {!videoLoaded && (
          <View style={styles.videoOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Only render the Video component after it's ready */}
        {shouldPlay && (
          <Video
            ref={videoRef}
            source={videoSource}
            style={[
              styles.video,
              {
                opacity: videoLoaded ? 1 : 0,
              },
            ]}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            isLooping={false}
            shouldPlay={true}
            onLoadStart={() => setVideoLoaded(false)}
            onReadyForDisplay={() => setVideoLoaded(true)}
            onError={(e) => console.error("Video error", e)}
          />
        )}
      </View>

      <Text style={styles.videoCaption}>
        {description} <Text style={styles.highlightText}>{highlightText}</Text>{" "}
        in Sudoku!
      </Text>
    </View>
  );
};

const HowToPlayDetailScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const animations = useRef({
    fadeAnim: new Animated.Value(0),
    boxAnim: new Animated.Value(0),
    rowAnim: new Animated.Value(0),
    colAnim: new Animated.Value(0),
  }).current;

  const animateSlide1 = useCallback(() => {
    Animated.sequence([
      Animated.timing(animations.fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(animations.boxAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animations.rowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animations.colAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animations]);

  useEffect(() => {
    if (step === 0) {
      animations.fadeAnim.setValue(0);
      animations.boxAnim.setValue(0);
      animations.rowAnim.setValue(0);
      animations.colAnim.setValue(0);
      animateSlide1();
    }
  }, [step, animateSlide1]);

  const renderSlide = () => {
    switch (step) {
      case 0:
        return <Slide1 animations={animations} />;
      case 1:
        return (
          <SlideVideo
            videoSource={require("../assets/video/Slide_2.mp4")}
            shouldPlay={step === 1}
            description="Watch how to"
            highlightText="fill a cell"
          />
        );
      case 2:
        return (
          <SlideVideo
            videoSource={require("../assets/video/Slide_3.mp4")}
            shouldPlay={step === 2}
            description="Watch how to use"
            highlightText="Notes"
          />
        );
      case 3:
        return (
          <SlideVideo
            videoSource={require("../assets/video/Slide_4.mp4")}
            shouldPlay={step === 3}
            description="Watch how to use"
            highlightText="Hints"
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <FontAwesome5 name="times" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How To Play</Text>
        <Text style={styles.headerStep}>{`${step + 1}/${totalSteps}`}</Text>
      </View>
      {renderSlide()}
      <View style={styles.pagination}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[styles.dot, step === i && styles.activeDot]} />
        ))}
      </View>
      <View style={styles.navButtons}>
        <TouchableOpacity
          onPress={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={[styles.navBtn, step === 0 && styles.navBtnDisabled]}
        >
          <FontAwesome5
            name="arrow-left"
            size={24}
            color={step === 0 ? "#ccc" : "#1976D2"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            step === totalSteps - 1
              ? navigation.goBack()
              : setStep(Math.min(totalSteps - 1, step + 1))
          }
          style={styles.navBtn}
        >
          <FontAwesome5
            name={step === totalSteps - 1 ? "check" : "arrow-right"}
            size={24}
            color="#1976D2"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CELL_SIZE = Math.floor(width / 10); // Increase cell size for larger board

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  headerStep: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "500",
  },
  slide: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  videoSlideWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  videoContainer: {
    width: "90%",
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  video: { width: "100%", height: "100%" },
  videoOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#1976D2", fontSize: 16, fontWeight: "bold" },
  videoCaption: {
    marginTop: 14,
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "500",
    textAlign: "center",
  },
  highlightText: { color: "#ff000dff", fontWeight: "700", fontSize: 18 },
  sudokuGridContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  videoDescription: {
    marginTop: 14,
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "500",
    textAlign: "center",
  },
  sudokuGrid: {
    borderWidth: 3,
    borderColor: "#222",
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  sudokuRow: {
    flexDirection: "row",
  },
  sudokuCellWrap: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1.5,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#fff",
  },
  sudokuCellHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  sudokuCell: {
    fontSize: 28,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
  },
  slide1Text: {
    width: "80%",
    marginTop: 16,
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#1976D2",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
  navBtn: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: "#f0f0f0",
  },
  navBtnDisabled: {
    backgroundColor: "#e0e0e0",
  },
});

export default HowToPlayDetailScreen;
