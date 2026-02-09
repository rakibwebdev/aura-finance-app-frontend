import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.aurafinance.app",
    appName: "Aura Finance",
    webDir: "dist",
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: "#0f172a",
            showSpinner: false,
        },
    },
};

export default config;
