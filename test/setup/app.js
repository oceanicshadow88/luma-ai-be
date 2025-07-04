let application = null;

async function loadApp() {
    if (application) {
        return application;
    }
    const app = require('../../dist/loaders/app').default;
    application = app;
    return application;
}

async function closeApp() {
    if (!application) {
        return;
    }
    // Express apps don't have a close method, so set to null
    application = null;
}

module.exports = {
    loadApp,
    closeApp,
    get application() {
        if (!application) {
            throw new Error('Application not loaded. Call loadApp() first.');
        }
        return application;
    }
};