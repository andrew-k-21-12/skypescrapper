"use strict";

import readline from "readline-sync";

import DynamicConfigs from "./src/DynamicConfigs.js";

const configured_interactive = new DynamicConfigs().interactive;
const interactive = configured_interactive === null
                  ? readline.keyInYN("Do you want to use the interactive mode?")
                  : configured_interactive;

await import(interactive ? "./src/workflows/interactive.js" : "./src/workflows/automatic.js");
