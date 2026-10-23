const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  expo: {
    // Dev sürümü ayrı scheme: iki sürüm aynı cihazdayken SSO linki store sürümünü açsın
    scheme: IS_DEV ? "boostifywrite-dev" : "boostifywrite",
    name: IS_DEV ? "BoostifyWrite DEV" : "BoostifyWrite",
    slug: "boostifywrite",
    version: "1.0.0",
    owner: "selcuksenol",
    orientation: "portrait",
    icon: IS_DEV ? "./assets/images/icon-dev.png" : "./assets/images/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      icon: IS_DEV
        ? {
            light: "./assets/images/icon-dev.png",
            dark: "./assets/images/icon-dev-dark.png"
          }
        : {
            light: "./assets/images/icon.png",
            dark: "./assets/images/icon-dark.png"
          },
      bundleIdentifier: IS_DEV ? "com.uesturkey.boostifywrite.dev" : "com.uesturkey.boostifywrite",
      buildNumber: "1",
      infoPlist: {
        NSFaceIDUsageDescription: "BoostifyWrite uses Face ID to provide secure and convenient login for student accounts.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: IS_DEV ? "./assets/images/adaptive-icon-dev.png" : "./assets/images/adaptive-icon.png",
        // Foreground görseli kendi zeminini içeriyor; bu renk yalnızca maske kenarında görünür
        backgroundColor: "#3D44F0"
      },
      package: IS_DEV ? "com.uesturkey.boostifywrite.dev" : "com.uesturkey.boostifywrite",
      versionCode: 1,
      permissions: [
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-font",
      "expo-asset",
      "./plugins/withPodsDeploymentTarget",
      [
        "expo-splash-screen",
        {
          // Tam ekran görsel, her iki varyantta aynı. Tablet yatayda üstten/alttan kırpılır, logo ortada kalır.
          image: "./assets/images/splash.png",
          resizeMode: "cover",
          backgroundColor: "#3D44F0",
          enableFullScreenImage_legacy: true
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "BoostifyWrite uses photo library access to allow students to select and upload profile photos for their educational account.",
          cameraPermission: "BoostifyWrite uses camera access to allow students to capture and upload profile photos for their educational account."
        }
      ],
      "expo-status-bar",
      [
        "expo-build-properties",
        {
          ios: {
            // Xcode 27 / iOS 27 SDK UIScene yaşam döngüsünü zorunlu kılıyor (SDK 58'de varsayılan olacak)
            enableSceneSupport: true
          }
        }
      ]
    ],
    extra: {
      // Çalışma anında src/config/env.ts okur (dev araçlarını göstermek için)
      appVariant: IS_DEV ? "development" : "production",
      eas: {
        projectId: "fb90bd8f-f11f-4c9b-bfeb-e312a868a6e3"
      }
    }
  }
};
