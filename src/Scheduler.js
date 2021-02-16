"use strict";

class Scheduler {

    async runForever(asyncTask, interval) {
        for (;;) {
            await asyncTask();
            await this.#delay(interval);
        }
    }

    async #delay(ms) {
        // await for better async stack trace support in case of errors.
        return await new Promise(resolve => setTimeout(resolve, ms));
    }

}

export default Scheduler;
