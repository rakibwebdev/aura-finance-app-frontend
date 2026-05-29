import { readFile, writeFile } from "node:fs/promises";

const configPath = new URL(
    "../ios/App/App/capacitor.config.json",
    import.meta.url,
);
const pluginNames = ["GoalARPlugin", "CapacitorBarcodeScannerPlugin"];

const rawConfig = await readFile(configPath, "utf8");
const config = JSON.parse(rawConfig);
const packageClassList = Array.isArray(config.packageClassList)
    ? config.packageClassList
    : [];

const missingPluginNames = pluginNames.filter(
    (pluginName) => !packageClassList.includes(pluginName),
);

if (missingPluginNames.length > 0) {
    packageClassList.push(...missingPluginNames);
    config.packageClassList = packageClassList;
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    console.log(
        `Added ${missingPluginNames.join(", ")} to ios/App/App/capacitor.config.json`,
    );
} else {
    console.log("Capacitor plugin class list is already up to date");
}
