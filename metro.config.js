// SVG'leri React component olarak import edebilmek için Metro yapılandırması.
// react-native-svg-transformer + react-native-svg birlikte çalışır.
//   import LogoMark from '@/assets/logo-mark.svg';
//   <LogoMark width={44} height={44}/>

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;
config.transformer = { ...transformer, babelTransformerPath: require.resolve('react-native-svg-transformer') };
config.resolver = {
  ...resolver,
  assetExts:  resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
