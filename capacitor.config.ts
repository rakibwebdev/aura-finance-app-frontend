import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.aurafinance.app",
    appName: "Aura Finance",
    webDir: "dist",
    includePlugins: ["@capacitor/barcode-scanner"],
    plugins: {
        SplashScreen: {
            launchShowDuration: 0,
            backgroundColor: "#0D0D0D",
            showSpinner: false,
        },
    },
    ios: {
        scheme: "App",
    },
};

export default config;
