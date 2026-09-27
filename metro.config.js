// SVG'leri React component olarak import edebilmek için Metro yapılandırması.
// react-native-svg-transformer + react-native-svg birlikte çalışır.
//   import LogoMark from '@/assets/logo-mark.svg';
//   <LogoMark width={44} height={44}/>

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Kökteki ios/ ve android/ (prebuild çıktısı) izlenmez: Xcode ve Dropbox buradaki dosyalara
// sürekli dokunuyor, Metro da her seferinde "Refreshing..." ile HMR güncellemesi gönderiyordu.
const escape = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nativeDirs = ['ios', 'android'].map(
  (dir) => new RegExp(`^${escape(path.join(__dirname, dir))}[\\\\/].*`),
);

const { transformer, resolver } = config;
config.transformer = { ...transformer, babelTransformerPath: require.resolve('react-native-svg-transformer') };
config.resolver = {
  ...resolver,
  assetExts:  resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  blockList:  [...[].concat(resolver.blockList ?? []), ...nativeDirs],
};

module.exports = config;
