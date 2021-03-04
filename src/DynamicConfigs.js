"use strict";

import fs from "fs";

/** Path to load dynamic configs from. */
const CONFIGS_PATH = "./configs.json"

/**
 * Configs to be used by default if a corresponding dynamic config is not available.
 */
const DefaultConfigs = Object.freeze({
    DEBUG:             false,
    CHECK_INTERVAL_MS: 5 * 60 * 1000,
    OUT_DIRECTORY:     "./out",        // relative to the execution folder
    STATUSES_FILENAME: "statuses.csv",
    CONTENTS_FILENAME: "contents.html"
});

/**
 * Provides all dynamic configs read from the local JSON
 * and backed by default configs if a required JSON config is not available.
 */
class DynamicConfigs {

    /* Public - safe configs. */

    /** Whether a debug mode should be enabled. */
    get debug() {
        return this.#getConfig("debug", DefaultConfigs.DEBUG);
    }

    /** How often to check statuses. */
    get checkIntervalMs() {
        return this.#getConfig("check_interval_ms", DefaultConfigs.CHECK_INTERVAL_MS);
    }

    /** Directory to place output files into. */
    get outDirectory() {
        return this.#getConfig(null, DefaultConfigs.OUT_DIRECTORY);
    }

    /** Filename to write statuses logs into. */
    get statusesFilename() {
        return this.#getConfig(null, DefaultConfigs.STATUSES_FILENAME);
    }

    /** Filename to write HTML contents into. */
    get contentsFilename() {
        return this.#getConfig(null, DefaultConfigs.CONTENTS_FILENAME);
    }





    /* Public - sensitive configs. */

    /** Skype credentials or null if nothing has been provided in the JSON. */
    get credentials() {
        return this.#getConfig("credentials", null);
    }

    /** Target usernames to be monitored or null of nothing has been provided in the JSON. */
    get targets() {
        return this.#getConfig("targets", null);
    }





    /* Private. */

    /**
     * Tries to read a config from the local JSON.
     * 
     * @param {string} key Key to get a config from the JSON, 
     *                     can be null to use a default value.
     * @param defaultValue Default value to be returned 
     *                     if a dynamic config could not be fetched.
     * 
     * @returns Read dynamic config or a default value as a fallback.
     */
    #getConfig(key, defaultValue) {
        if (!key)
            return defaultValue;
        const configsFromJSON = this.#configsFromJSON;
        if (!configsFromJSON || !configsFromJSON.hasOwnProperty(key))
            return defaultValue;
        return configsFromJSON[key];
    }

    /** All configs from the local JSON or null if reading has failed. */
    get #configsFromJSON() {
        try {
            return JSON.parse(fs.readFileSync(CONFIGS_PATH));
        }
        catch (_) {
            return null;
        }
    }

}

export default DynamicConfigs;
