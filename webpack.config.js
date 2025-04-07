const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any modules that need to be transpiled
          'react-native-reanimated',
          '@react-navigation',
        ],
      },
    },
    argv
  );

  // Customize the config before returning it
  if (config.module && config.module.rules) {
    // Find and remove the problematic filter
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.oneOf) {
        rule.oneOf = rule.oneOf.filter(oneOf => {
          // Remove the specific rule causing the "Unrecognised filter type - 208" error
          return oneOf.parser && oneOf.parser.requireEnsure !== false;
        });
      }
      return true;
    });
  }

  return config;
};