const logger = require('../utility/logger');
const { findLogoutLink } = require('./findLogoutLink')
require('dotenv').config();

async function downloadAttachment(page) {
    try {
        // Wait for the download link to appear on the page
        await page.waitForSelector('.download');

        // Find all elements with the class 'download' which are assumed to be download links
        const downloadElements = await page.$$('.download'); // `$$` is a shorthand for `querySelectorAll`

        if (downloadElements.length === 0) {
            logger.error('No download links found.');
            throw new Error('No download links found.');
        }

        // Click on each download link to initiate download
        for (const downloadElement of downloadElements) {
            await downloadElement.click();
            await page.waitForTimeout(5000); 
        }

        logger.info(`Initiated download for ${downloadElements.length} files.`);

        return page;
    } catch (error) {
        logger.error(`Error occurred while downloading the files: ${error.message}`);
        throw new Error(`Error occurred while downloading the files: ${error.message}`);
    }
}

module.exports = { downloadAttachment };