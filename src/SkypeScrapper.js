"use strict";

import BrowserManipulator from "./utility/BrowserManipulator.js";





/* Utility. */

/** Target URL to do all scrapping in. */
const TARGET_URL = "https://web.skype.com";

/**
 * Some kind of enum to represent all possible user statuses. 
 */
const Statuses = Object.freeze({
    FAILED:  0,
    ONLINE:  1,
    OFFLINE: 2
});

/** 
 * All delays to wait in ms.
 */
const DelaysMs = Object.freeze({
    LOGIN:    2000,
    USERNAME: 3000
});

/** 
 * Inputs to interact with.
 */
const Inputs = Object.freeze({
    LOGIN:         "input[name=loginfmt]",
    SUBMIT_NEXT:   "input[type=submit][value=Next]",
    PASSWORD:      "input[name=passwd]",
    SUBMIT_SIGNIN: "input[type=submit][value='Sign in']",
    SEARCH:        "input[aria-label='Search Skype']"
});

/** 
 * Buttons to interact with.
 */
const Buttons = Object.freeze({
    GOT_IT:       "button[aria-label='Got it!']",
    SEARCH:       "button[title='People, groups & messages']",
    ITEM:         "div[role=button]",
    CLOSE_SEARCH: "button[aria-label='Close search']"
});

/**
 * All status strings available in Skype.
 */
const StatusStrings = Object.freeze({
     ONLINE: "Active now"
});





/* Main class. */

/**
 * Incorporates all scrapping logic to extract Skype users' statuses.
 */
class SkypeScrapper {

    /* Public. */

    /**
     * Launches a browser instance, 
     * opens Skype login page in it
     * and tries to sign a user in with provided credentials.
     * This method should be safely reentrant:
     * all further calls will do nothing.
     * 
     * @param {string}  login               User's login.
     * @param {string}  password            User's password.
     * @param {boolean} headfulWithSettings Whether a browser should be opened in a headful mode
     *                                      and proceed to a settings page initially.
     * 
     * @throws Throws an exception in the case if any of the described above actions
     *         were not performed successfully.
     */
    async connectAndSignIn(login, password, headfulWithSettings = false) {

        // Instance of a browser manipulator to avoid unnecessary allocations.
        const browserManipulator = this.#browserManipulator;

        // Checking if connection and signon have already been performed.
        if (this.#browser && this.#page)
            return;

        // Launching a browser with required options if it wasn't started yet.
        if (!this.#browser) 
            this.#browser = await browserManipulator.launchBrowser(!headfulWithSettings, headfulWithSettings);

        // A target page has already been configured.
        if (this.#page)
            return;

        // Opening a new page to do all magic stuff in.
        this.#page = await this.#browser.newPage();

        // Opening a target Skype URL.
        await this.#page.goto(TARGET_URL);

        // Typing a login and going next.
        await browserManipulator.typeIntoInput(this.#page, Inputs.LOGIN, login);
        await browserManipulator.clickElement(this.#page, Inputs.SUBMIT_NEXT); 

        /* For some reason we have to wait for a short delay after providing a login,
           scrapping fails otherwise. */
        await this.#page.waitForTimeout(DelaysMs.LOGIN);

        // Typing a password and going next.
        await browserManipulator.typeIntoInput(this.#page, Inputs.PASSWORD, password);
        await browserManipulator.clickElement(this.#page, Inputs.SUBMIT_SIGNIN);

        /* We need to close some useless prompt to proceed successfully 
           but if it didn't appear, it should not crash the process. */
        try {
            await browserManipulator.clickElement(this.#page, Buttons.GOT_IT);
        }
        catch (_) {}

    }

    /**
     * Closes the current browser's instance. 
     */
    async disconnect() {
        if (this.#browser) {
            await this.#browser.close();
            this.#browser = null;
        }
        this.#page = null;
    }

    /**
     * Tries to find a target user and get his status.
     * 
     * @param {string} username User to look for.
     * 
     * @returns User's status.
     * 
     * @throws Throws an exception if some target scrapping element was not found.
     */
    async checkUserStatus(username) {

        // Instance of a browser manipulator to avoid unnecessary allocations.
        const browserManipulator = this.#browserManipulator;

        /* Tapping on the search field, typing a target username. 
           this action requires delays to make it work. */
        await browserManipulator.clickElement(this.#page, Buttons.SEARCH);
        await this.#page.waitForTimeout(DelaysMs.USERNAME);
        await browserManipulator.typeIntoInput(this.#page, Inputs.SEARCH, username);
        await this.#page.waitForTimeout(DelaysMs.USERNAME);

        // Fetching an item (its aria label) with a target Skype name.
        const ariaLabel = await this.#page.evaluate((query, skypename) => {
            const users = Array.from(document.querySelectorAll(query))
                               .filter(element => element.ariaLabel && 
                                                  element.ariaLabel.includes(skypename));
            return users.length ? users[0].ariaLabel : null;
        }, Buttons.ITEM, this.#generateSkypeName(username));

        // Closing a search field in any case.
        await browserManipulator.clickElement(this.#page, Buttons.CLOSE_SEARCH);

        // Target user was not found for some reason.
        if (!ariaLabel)
            return Statuses.FAILED;

        // Checking found user's status string.
        return ariaLabel.includes(StatusStrings.ONLINE) ? Statuses.ONLINE : Statuses.OFFLINE;

    }

    /**
     * Saves a screenshot of the current state.
     * 
     * @param {string} directory Directory to save a screenshot into.
     * @param {string} name      Name to save a screenshot with.
     * 
     * @throws Throws an exception if a screenshot has failed to be saved for some reason. 
     */
    async saveScreenshot(directory, name) {
        if (this.#page) 
            await this.#browserManipulator.saveScreenshot(this.#page, directory, name);
    }

    /** Skype app's web page. */
    static get TARGET_URL() { return TARGET_URL; }

    /** All possible user statuses. */
    static get Statuses() { return Statuses; }





    /* Private. */

    /**
     * Generates a username string to find a required user. 
     * 
     * @param {string} username Target username.
     * 
     * @returns Generated username string.
     */
    #generateSkypeName(username) {
        return `Skype Name: ${username}`;
    }

    /** Dynamic getter for a browser manipulator. */
    get #browserManipulator() {
        return new BrowserManipulator(); 
    }

    /** Working browser instance. */
    #browser; 
    
    /** Working browser page. */
    #page;

}

export default SkypeScrapper;
