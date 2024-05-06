const { startAutomation } = require('../processess/puppeteerAutomation');
const logger = require('../utility/logger');

async function processURLsContinuously() {
  while (true) {
    if (global.sharedUrls.length > 0) {
      for (let i = 0; i < global.sharedUrls.length; i++) {
        const data = global.sharedUrls[i];
        try {
          logger.info(`Processing URL at index ${i}: ${data}`);
          await startAutomation(data);
          logger.info(`Completed processing URL at index ${i}`);
        } catch (error) {
          logger.error(`Failed to process URL at index ${i}: ${error}`);
        }
      }
    } else {
      logger.info('No URLs to process, waiting...');
      await new Promise(resolve => setTimeout(resolve, 5000)); 
    }
  }
}


module.exports = {processURLsContinuously}
