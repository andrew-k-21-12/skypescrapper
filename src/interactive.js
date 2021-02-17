"use strict";

import puppeteer from "puppeteer";
import readline  from "readline-sync";
import fs        from "fs";

const browser = await puppeteer.launch({ 
    args: ["--lang=en"],
    headless: true
});

const page = await browser.newPage();
await page.goto("https://web.skype.com");

const save_html = async () => {
    const html = await page.content();
    fs.writeFileSync("./contents.html", html);
};

const perform_typing = async (is_password = false) => {
    const selector = readline.question("Gimme target selector: ");
    const params   = is_password ? { hideEchoBack: true, mask: '' } : null;
    const value    = readline.question("Gimme value to be typed: ", params);
    try {
        await page.waitForSelector(selector, { visible: true });
        await page.focus(selector);
        await page.keyboard.type(value);
    }
    catch (error) {
        console.error("Could not perform typing:", error);
    }
};

const perform_click = async () => {
    const selector = readline.question("Gimme target selector: ");
    try {
        await page.waitForSelector(selector, { visible: true });
        await page.click(selector);
    }
    catch (error) {
        console.error("Could not perform a click:", error);
    }
};

const command_screenshot = "SCREENSHOT";
const command_save_html  = "SAVE_HTML";
const command_type       = "TYPE";
const command_type_pass  = "TYPE_PASS";
const command_click      = "CLICK";
const commands = [ command_screenshot, command_save_html, command_type, command_type_pass, command_click ];
for (;;) {
    const index = readline.keyInSelect(commands, "What should I do?");
    if (index < 0)
        break;
    switch (commands[index]) {
        case command_screenshot:
            await page.screenshot({ path: "screenshot.png" });
            break;
        case command_save_html:
            await save_html();
            break;
        case command_type:
            await perform_typing();
            break;
        case command_type_pass:
            await perform_typing(true);
            break;
        case command_click:
            await perform_click();
            break;
    }
}

await browser.close();
 