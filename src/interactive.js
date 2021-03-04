"use strict";

import readline from "readline-sync";

import DynamicConfigs     from "./DynamicConfigs.js";
import BrowserManipulator from "./BrowserManipulator.js";
import SkypeScrapper      from "./SkypeScrapper.js";



// These instances will be required frequently, so let's allocate them only once.
const dynamic_configs     = new DynamicConfigs();
const browser_manipulator = new BrowserManipulator();



// Navigating to the target URL.
const browser = await browser_manipulator.launchBrowser();
const page    = await browser.newPage();
await page.goto(SkypeScrapper.TARGET_URL);



/**
 * Saves a screenshot of the current state.
 * 
 * @throws Throws exceptions on various errors. 
 */
const save_screenshot = async () => {
    await browser_manipulator.saveScreenshot(
        page, 
        dynamic_configs.outDirectory,
        "contents.png"
    );
};

/**
 * Saves current HTML contents.
 * 
 * @throws Throws exceptions on various errors. 
 */
const save_content = async () => {
    await browser_manipulator.saveContent(
        page, 
        dynamic_configs.outDirectory,
        dynamic_configs.contentsFilename
    );
};

/**
 * Performs typing into a target input.
 * 
 * @param {boolean} is_password Whether the console input for a value should be hidden.
 * 
 * @throws Throws exceptions on various errors. 
 */
const perform_typing = async (is_password = false) => {
    const selector = readline.question("Type a selector to find a target input: ");
    const options  = is_password ? { hideEchoBack: true, mask: '' } : null;
    const value    = readline.question("Type a value to fill the target input with: ", options);
    await browser_manipulator.typeIntoInput(page, selector, value);
};

/**
 * Performs a click on a target button.
 * 
 * @throws Throws exceptions on various errors. 
 */
const perform_click = async () => {
    const selector = readline.question("Type a selector to find a target button: ");
    await browser_manipulator.clickElement(page, selector);
};



// All commands with captions and corresponding actions.
const commands = [
    { caption: "SAVE SCREENSHOT",          action: save_screenshot                        },
    { caption: "SAVE HTML CONTENT",        action: save_content                           },
    { caption: "TYPE INTO INPUT",          action: perform_typing                         },
    { caption: "TYPE PASSWORD INTO INPUT", action: async () => await perform_typing(true) },
    { caption: "CLICK BUTTON",             action: perform_click                          }
]; 

// Executing requested commands in the loop.
for (;;) {
    const index = readline.keyInSelect(
        commands.map(command => command.caption), 
        "What should be done?"
    );
    if (index < 0)
        break;
    try {
        await commands.map(command => command.action)[index]();
    }
    catch (error) {
        console.error("Could not execute command:", error);
    }
}



// Closing browser finally.
await browser.close();
 