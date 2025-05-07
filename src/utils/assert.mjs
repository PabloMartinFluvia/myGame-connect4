export function assert(condition, msg) {
    if (assert.ENABLED && !condition) {
        if (msg !== undefined) {
            console.log(`Assertion Error: ${msg}`);
        }
        const assertionError = "I'm CONSTANT !!!";
        assertionError = "assert stop execution";
    }
}

assert.ENABLED = true;