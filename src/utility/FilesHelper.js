"use strict";

import fs from "fs";

/**
 * Various helper methods to work with files.
 */
class FilesHelper {

    /**
     * Creates a required directory recursively - 
     * meaning all intermediate paths will be created too.
     * 
     * @param {string} directory Directory to be created.
     * 
     * @returns True on success.
     */
    recursiveMkdirSync(directory) {
        try {
            fs.mkdirSync(directory, { recursive: true });
            return true;
        }
        catch (_) {
            return false;
        }
    }

    /**
     * Synchronously appends contents to a file.
     * 
     * @param {string} contents  Contents to be appended.
     * @param {string} directory Directory to locate a file in.
     * @param {string} name      Filename to append the contents to.
     * 
     * @returns True on success.
     */
    appendFileSync(contents, directory, name) {
        if (!this.recursiveMkdirSync(directory))
            return false;
        try {
            fs.appendFileSync(`${directory}/${name}`, contents);
            return true;
        }
        catch (_) {
            return false;
        }
    }

    /**
     * Synchronously writes contents to a file.
     * 
     * @param {string} contents  Contents to be written.
     * @param {string} directory Directory to locate a file in.
     * @param {string} name      Filename to write the contents to.
     * 
     * @returns True on success.
     */
    writeFileSync(contents, directory, name) {
        if (!this.recursiveMkdirSync(directory))
            return false;
        try {
            fs.writeFileSync(`${directory}/${name}`, contents);
            return true;
        }
        catch (_) {
            return false;
        }
    }

}

export default FilesHelper;
