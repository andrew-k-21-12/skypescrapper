"use strict";

import readline from "readline-sync";
import fs       from "fs";

import configs from "../configs.json";
import targets from "../targets.json";

import SkypeScrapper from "./SkypeScrapper.js";
import Scheduler     from "./Scheduler.js";



const credentials = configs.creds_from_console 
                    ? {
                        login:    readline.question("Type your Skype login: "),
                        password: readline.question("Type your Skype password: ", {
                            hideEchoBack: true,
                            mask: ''
                        })
                    }
                    : (await import("../credentials.json")).default;



const skype_scrapper = new SkypeScrapper(
    credentials.login, 
    credentials.password,
    configs.is_debug
);

try {
    await skype_scrapper.connect();
}
catch (error) {
    console.error("Could not establish a connection:", error);
    process.exit(0);
}



await new Scheduler().runForever(async () => {
    try {
        for (const target of targets) {
            const status = await skype_scrapper.checkUserOnline(target);
            fs.appendFileSync(configs.logs_out_file, `${target},${status},${new Date().getTime()}\n`);
        }
        console.log("All statuses have been fetched:", new Date().toString());
    }
    catch (error) {
        console.error("Could not check if the user is online:", error);
        skype_scrapper.doScreenshot();
    }
}, configs.check_interval);
