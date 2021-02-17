"use strict";

import puppeteer from "puppeteer";

class SkypeScrapper {

    /* Public. */

    constructor(login, password, debug = false) {
        this.#login    = login;
        this.#password = password;
        this.#debug    = debug;
    }

    async connect() {
        if (!this.#browser) 
            this.#browser = await puppeteer.launch({ 
                args: ["--lang=en"],
                headless: !this.#debug
            });
        if (this.#debug) {
            const page = await this.#browser.newPage();
            await page.goto("chrome://settings/languages");
            await page.waitForTimeout(5000);
        }
        if (!this.#page)
            this.#page = await this.#browser.newPage();
        await this.#page.goto(SkypeScrapper.#TARGET_URL);
        await this.#fillInput(SkypeScrapper.#INPUT_LOGIN, this.#login);
        await this.#clickElement(SkypeScrapper.#INPUT_SUBMIT_NEXT); 
        await this.#page.waitForTimeout(2000); // !!!
        await this.#fillInput(SkypeScrapper.#INPUT_PASSWORD, this.#password);
        await this.#clickElement(SkypeScrapper.#INPUT_SUBMIT_SIGNIN);
        try {
            await this.#clickElement(SkypeScrapper.#BUTTON_GOT_IT);
        }
        catch (e) {}
    }

    async disconnect() {
        if (this.#browser) {
            await this.#browser.close();
            this.#browser = null;
        }
        this.#page = null;
    }

    async checkUserOnline(username) {
        await this.#clickElement(SkypeScrapper.#BUTTON_SEARCH);
        await this.#page.waitForTimeout(SkypeScrapper.#DELAY_TO_TYPE_USERNAME);
        await this.#fillInput(SkypeScrapper.#INPUT_SEARCH, username);
        await this.#page.waitForTimeout(SkypeScrapper.#DELAY_TO_TYPE_USERNAME);
        const ariaLabel = await this.#page.evaluate((query, skypename) => {
            const users = Array.from(document.querySelectorAll(query))
                               .filter(element => element.ariaLabel && 
                                                  element.ariaLabel.includes(skypename));
            return users.length ? users[0].ariaLabel : null;
        }, SkypeScrapper.#BUTTON_ITEM, this.#generateSkypeName(username));
        await this.#clickElement(SkypeScrapper.#BUTTON_CLOSE_SEARCH);
        if (!ariaLabel)
            return SkypeScrapper.STATUS_CHECK_FAILED;
        return ariaLabel.includes(SkypeScrapper.#STATUS_STRING_ONLINE) 
             ? SkypeScrapper.STATUS_ONLINE 
             : SkypeScrapper.STATUS_OFFLINE;
    }

    async doScreenshot() {
        if (this.#page) 
            await this.#page.screenshot({ path: "screenshot.png" });
    }

    static STATUS_ONLINE       = 1;
    static STATUS_OFFLINE      = 2;
    static STATUS_CHECK_FAILED = 3;





    /* Private. */

    async #fillInput(selector, value, delay = 0) {
        await this.#page.waitForSelector(selector, { visible: true });
        await this.#page.focus(selector);
        await this.#page.keyboard.type(value, { delay: delay });
    }

    async #clickElement(selector) {
        await this.#page.waitForSelector(selector, { visible: true });
        await this.#page.click(selector);
    }

    #generateSkypeName(username) {
        return `Skype Name: ${username}`;
    }

    static #TARGET_URL = "https://web.skype.com";

    static #INPUT_LOGIN         = "input[name=loginfmt]";
    static #INPUT_SUBMIT_NEXT   = "input[type=submit][value=Next]";
    static #INPUT_PASSWORD      = "input[name=passwd]";
    static #INPUT_SUBMIT_SIGNIN = "input[type=submit][value='Sign in']";

    static #BUTTON_GOT_IT       = "button[aria-label='Got it!']";
    static #BUTTON_SEARCH       = "button[title='People, groups & messages']";
    static #INPUT_SEARCH        = "input[aria-label='Search Skype']";
    static #BUTTON_ITEM         = "div[role=button]";
    static #BUTTON_CLOSE_SEARCH = "button[aria-label='Close search']";

    static #STATUS_STRING_ONLINE = "Active now";

    static #DELAY_TO_TYPE_USERNAME = 3000;
    
    #login;
    #password;
    #debug;

    #browser;
    #page;

}

export default SkypeScrapper;
