"use strict";

import puppeteer from "puppeteer";

import FilesHelper from "./FilesHelper.js";





/** Defaul args to launch a browser with. */
const LAUNCH_BROWSER_ARGS           = [ "--lang=en" ];

/** Languages settings page can be opened in Chrome. */
const CHROME_LANGUAGES_SETTINGS_URL = "chrome://settings/languages";

/** Timeout millis to be waited on a settings page. */
const LANGUAGES_SETTINGS_TIMEOUT_MS = 5 * 1000;





/**
 * Helper to do basic manipulations with a browser 
 * and HTML controls in its' opened pages
 * (works with puppeteer-wrapped browsers).
 */
class BrowserManipulator {

    /* Public. */

    /**
     * Launches a new browser's instance wtih default and configured options.
     * 
     * @param {boolean} headless            Whether a browser should be started in the headless mode.
     * @param {boolean} openSettingsAndWait Whether it's required to open a settings page in a browser
     *                                      and wait for a short timeout here.
     * 
     * @returns Launched browser's instance.
     * 
     * @throws Throws an exception if a browser could not be launched or configured for some reason. 
     */
    async launchBrowser(headless = true, openSettingsAndWait = false) {
        const browser = await puppeteer.launch({ 
            args: LAUNCH_BROWSER_ARGS,
            headless: headless
        });
        if (openSettingsAndWait)
            await this.#openSettingsAndWait(browser)
        return browser;
    }

    /**
     * Types a string value into an input found by a selector.
     * 
     * @param page              Page to look for an input in.
     * @param {string} selector Selector to find a required input.
     * @param {string} value    Value to be typed.
     * 
     * @throws Throws an exception if a required input was not found
     *         or in the case of other errors.         
     */
    async typeIntoInput(page, selector, value) {
        await page.waitForSelector(selector, { visible: true });
        await page.focus(selector);
        await page.keyboard.type(value);
    }

    /**
     * Clicks an element found by a selector.
     * 
     * @param page              Page to look for an element in.
     * @param {string} selector Selector to find a required element.
     * 
     * @throws Throws an exception if a required element was not found
     *         or in the case of other errors.   
     */
    async clickElement(page, selector) {
        await page.waitForSelector(selector, { visible: true });
        await page.click(selector);
    }

    /**
     * Captures and saves a screenshot from the current page.
     * 
     * @param page               Page to capture a screenshot from.
     * @param {string} directory Directory to save a screenshot into.
     * @param {string} name      File name to save a screenshot with.
     * 
     * @throws Throws an exception if a wrong page has been provided
     *         or screenshot was not captured or saved for some reason.
     */
    async saveScreenshot(page, directory, name) {
        if (!this.#filesHelper.recursiveMkdirSync(directory))
            throw new Error("Could not prepare an output directory to save a screenshot");
        await page.screenshot({ path: `${directory}/${name}` });
    }

    /**
     * Saves all current HTML contents of the page into a file.
     * 
     * @param page               Page to get contents from.
     * @param {string} directory Directory to save contents into.
     * @param {string} name      File name to save contents with.
     * 
     * @throws Throws an exception if a wrong page has been provided
     *         or contents saving has failed for some reason.
     */
    async saveContent(page, directory, name) {
        const content = await page.content();
        if (!this.#filesHelper.writeFileSync(content, directory, name))
            throw new Error("Could not write page's contents to a file");
    }





    /* Private. */

    /**
     * Opens a settings page and waits for a short timeout.
     * 
     * @param browser Browser to open settings in.
     * 
     * @throws Throws an exception if settings could not be opened for some reason.
     */
    async #openSettingsAndWait(browser) {
        const page = await browser.newPage();
        await page.goto(CHROME_LANGUAGES_SETTINGS_URL);
        await page.waitForTimeout(LANGUAGES_SETTINGS_TIMEOUT_MS);
    }

    /** Dynamic getter for a files helper. */
    get #filesHelper() {
        return new FilesHelper();
    }

}

export default BrowserManipulator;
