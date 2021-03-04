"use strict";

import readline from "readline-sync";

import DynamicConfigs from "../DynamicConfigs.js";
import SkypeScrapper  from "../SkypeScrapper.js";
import Scheduler      from "../utility/Scheduler.js";
import FilesHelper    from "../utility/FilesHelper.js";



// These instances will be required frequently, so let's allocate them only once.
const dynamic_configs = new DynamicConfigs();
const skype_scrapper  = new SkypeScrapper();



// Connecting and signing in.
try {
    const debug       = dynamic_configs.debug;
    const credentials = dynamic_configs.credentials;

    // Using configured credentials if they were provided.
    if (credentials)
        await skype_scrapper.connectAndSignIn(credentials.login, credentials.password, debug);

    // Reading credentials from the console otherwise.
    else {
        const login    = readline.question("Type your Skype login: ");
        const password = readline.question("Type your Skype password: ", {
            hideEchoBack: true,
            mask: ''
        });
        await skype_scrapper.connectAndSignIn(login, password, debug);
    }

    // Logging a successful signin.
    console.log("Successfully connected and signed in");
    await skype_scrapper.saveScreenshot(dynamic_configs.outDirectory, "signin_success.png");
}

// Logging and exiting on failure.
catch (error) {
    console.error("Could not connect and sign in:", error);
    await skype_scrapper.saveScreenshot(dynamic_configs.outDirectory, "signing_failure.png");
    process.exit(0);
}



// Scheduling target users monitoring with a dynamic interval.
{
    let latest_console_username; // to type a target username in the console only once
    await new Scheduler().runWithDynamicInterval(
        async () => {
            
            // Getting configured targets or reading a target from the console if nothing was configured.
            const configured_targets = dynamic_configs.targets;
            if (configured_targets)
                latest_console_username = null;
            else if (!latest_console_username)
                latest_console_username = readline.question("Type some Skype username to be monitored: ")
            const targets = configured_targets 
                          ? configured_targets 
                          : [ latest_console_username ];
            
            // Iterating through all targets to fetch statuses of each one.
            for (const target of targets) {
                try {
                    const status = await skype_scrapper.checkUserStatus(target);
                    const result = new FilesHelper().appendFileSync(
                        `${target},${status},${new Date().getTime()}\n`, 
                        dynamic_configs.outDirectory,
                        dynamic_configs.statusesFilename
                    );
                    if (!result)
                        throw new Error("Could not append a fetched status to the file");
                }
                
                // Status fetching has failed.
                catch (error) {
                    console.error(`Processing of ${target}'s status has failed:`, error);
                    await skype_scrapper.saveScreenshot(dynamic_configs.outDirectory, "check_status_failure.png");
                }
            }

            // Logging successful statuses fetching.
            console.log("All statuses have been fetched:", new Date().toString());
            await skype_scrapper.saveScreenshot(dynamic_configs.outDirectory, "check_statuses_success.png");
        },
        () => dynamic_configs.checkIntervalMs
    );
}



// Closing connection finally.
await skype_scrapper.disconnect();
