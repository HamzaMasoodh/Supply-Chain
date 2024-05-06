const puppeteer = require('puppeteer');
const logger = require('../utility/logger');
const puppeteerConfig = require("../config/puppeteerConfig");
const { findLogoutLink } = require('./findLogoutLink');
const { loginProcess } = require('./loginProcess');
require('dotenv').config();
const path = require('path');
const { downloadAttachment } = require('./downloadAttachment');
const { scanDirectoryForWatermarks } = require('./identifyFiles');
const fs = require('fs');

// Function to log in to a website using Puppeteer
async function startAutomation(url) {
  let browser = null;
  let page = null
  try {

    try {
      // Launch the browser
      browser = await puppeteer.launch(puppeteerConfig);
      page = await browser.newPage();
    } catch (error) {
      logger.error("Error Occured in Launching the Browser")
      throw new Error("Error Occured in Launching the Browser")
    }

    // Create a directory path for saving downloads within the project folder
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');

    // Assuming __dirname is the current directory of the script
    const downloadsBaseDir = path.resolve(__dirname, '..', '..', 'downloads');
    const downloadDirectory = path.join(downloadsBaseDir, timestamp);

    // Check if the base downloads directory exists, and if not, create it
    if (!fs.existsSync(downloadsBaseDir)) {
      fs.mkdirSync(downloadsBaseDir, { recursive: true });
    }
    
    // Set up download options
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDirectory,
    })

    await page.setRequestInterception(true);

    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font","media"].indexOf(
          request.resourceType()
        ) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    try {
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle0' });
    } catch (error) {
      logger.error(`Error Occured while navigating to ${url}`)
      throw new Error(`Error Occured while navigating to ${url}`)
    }

    const logout = await findLogoutLink(page)

    if (!logout) {
      page = await loginProcess(page)
    }
    page = await downloadAttachment(page)

    // Wait for downloads to complete - simplistic approach
    await new Promise(resolve => setTimeout(resolve, 10000)); 

    await recordFilesInDatabase(downloadDirectory);

    return 

  } catch (error) {
    logger.error(`Puppeteer automation failed: ${error.message}`);
    if (browser) {
      await browser.close();
    }
    throw error;
  }finally{
    // Close the browser
    await browser.close();
    browser = null;
  }
}

// Exporting the loginToWebsite function to be used in the main script
module.exports = { startAutomation };
