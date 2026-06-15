const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// 安全地获取 Expo 的默认排除列表
const existingBlockList = [].concat(config.resolver.blockList || []);

config.resolver.blockList = [
  ...existingBlockList,
  /.*\/\.expo\/.*/,
  /.*\/react-native\/ReactAndroid\/.*/,
  /.*\/react-native\/ReactCommon\/.*/,
  /.*\/__tests__\/.*/,
  /.*\.git\/.*/,
];

module.exports = withUniwindConfig(config);
