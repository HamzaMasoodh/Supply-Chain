const logger = require('../utility/logger');
const { findLogoutLink } = require('./findLogoutLink')
require('dotenv').config();

// Function to log in to a website using Puppeteer
async function loginProcess(page) {
    try {

        try {
            //Type Email
            await page.waitForSelector('input[type=text]')
            await page.type('input[type=text]', process.env.LOGIN_EMAIL);
        } catch (error) {
            logger.error(`Input for Login not found ${error.message}`);
            throw new Error(`Input for Login not found ${error.message}`)
        }

        try {
            //Type Password
            await page.waitForSelector('input[type=password]')
            await page.type('input[type=password]', process.env.LOGIN_PASSWORD);

        } catch (error) {
            logger.error(`Input for Password not found ${error.message}`);
            throw new Error(`Input for Password not found ${error.message}`)
        }


        try {
            //Submit Button
            await page.waitForSelector('a[title=Submit]')
            await page.click('a[title=Submit]');

        } catch (error) {
            logger.error(`Unable to click on submit button ${error.message}`);

            try {
                await page.click('a.btn--login');
            } catch (error) {
                logger.error(`Unable to click on submit button ${error.message}`);
                throw new Error(`Input for Password not found ${error.message}`)
            }
        }
        await page.waitForNavigation({ waitUntil: 'networkidle0' });


        const result = await waitForLogoutLink(page, 180);

        return { status: result, page:page };
    } catch (error) {
        logger.error(`Error occurred in Login Process ${error.message}`);
        throw new Error(`Error occurred in Login Process ${error.message}`)
    }
}


async function waitForLogoutLink(page, maxSeconds) {
    let attempts = 0;
    const maxAttempts = maxSeconds / 10;

    return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
            try {
                const logout = await findLogoutLink(page);
                if (logout) {
                    clearInterval(intervalId);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    resolve(false);
                }
                attempts++;
            } catch (error) {
                clearInterval(intervalId);
                reject(`Error checking for logout link: ${error.message}`);
            }
        }, 10000); 
    });
}
module.exports = { loginProcess };
