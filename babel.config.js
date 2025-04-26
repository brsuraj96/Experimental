// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [
//       "babel-preset-expo", // required for Expo projects
//       "@babel/preset-react", // add this
//       "@babel/preset-typescript",
//       "module:metro-react-native-babel-preset", // add this for React Native projects
//     ],
//   };
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
