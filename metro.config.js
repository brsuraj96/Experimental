const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add .js to sourceExts
config.resolver.sourceExts = [...config.resolver.sourceExts, "js"];

// Add react-navigation specific resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "../GestureHandler": require.resolve("react-native-gesture-handler"),
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
