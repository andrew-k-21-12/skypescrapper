"use strict";

/**
 * Helper to run tasks in various modes. 
 */
class Scheduler {

    /**
     * Asynchronously executes an async task with some dynamic time interval.
     * 
     * @param asyncTask     Async function without args to be executed initially 
     *                      and then repeatedly with a dynamic time interval.
     * @param getIntervalMs Function returning an interval in milliseconds
     *                      to schedule the next execution of the async task.
     *                      Can return null to finish all executions.
     * 
     * @throws Throws exceptions if something went wrong with argument functions.
     */
    async runWithDynamicInterval(asyncTask, getIntervalMs) {
        for (;;) {
            await asyncTask();
            const intervalMs = getIntervalMs();
            if (!intervalMs)
                break;
            await this.#delay(intervalMs);
        }
    }

    /**
     * Waits for some delay.
     * 
     * @param {number} ms Milliseconds to wait for.
     */
    async #delay(ms) {
        // await for better async stack trace support in case of errors.
        return await new Promise(resolve => setTimeout(resolve, ms));
    }

}

export default Scheduler;
