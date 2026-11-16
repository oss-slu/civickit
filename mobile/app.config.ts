import { ExpoConfig, ConfigContext } from "expo/config";

const APP_ID_PREFIX = "org.civickit";

function getName(base: string) {
    switch (process.env.APP_VARIANT) {
        case "production":
            return base;
        case "preview":
            return `${base} (Preview)`;
        default:
            return `${base} (Dev)`;
    }
}

function getAppId() {
    switch (process.env.APP_VARIANT) {
        case "production":
            return APP_ID_PREFIX;
        case "preview":
            return `${APP_ID_PREFIX}.preview`;
        default:
            return `${APP_ID_PREFIX}.dev`;
    }
}

export default ({ config }: ConfigContext): any => ({
    ...config,
    name: getName(config.name ?? "Civickit"),
    ios: { ...config.ios, bundleIdentifier: getAppId() },
    android: {
        ...config.android, package: getAppId(),
        config: { googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY } }
    },
});