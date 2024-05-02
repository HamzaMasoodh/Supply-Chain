const logger = require('../utility/logger');
const { findLogoutLink } = require('./findLogoutLink')
require('dotenv').config();

// Function to log in to a website using Puppeteer
async function downloadAttachment(page) {
    try {

        try {
            //Type Email
            await page.waitForSelector('.download')
            await page.click('.download');

        } catch (error) {
            logger.error(`Error Occurred While Downloading the File ${error.message}`);
            throw new Error(`Error Occurred While Downloading the File ${error.message}`)
        }

        return page
    } catch (error) {
        logger.error(`Error occurred in Downloading Process ${error.message}`);
        throw new Error(`Error occurred in Downloading Process ${error.message}`)
    }
}

module.exports = { downloadAttachment };