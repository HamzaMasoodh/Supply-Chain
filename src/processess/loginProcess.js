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


        const logout = await findLogoutLink(page)

        if (!logout) {
            try {
                //Submit Button
                await page.waitForSelector('a[title=Submit]')
                await page.click('a[title=Submit]');
    
            } catch (error) {
    
                logger.error(`Unable to click on submit button ${error.message}`);
                throw new Error(`Input for Password not found ${error.message}`)
            }
        }else{
            return page
        }
       

        // Wait for OTP input manually by the user
        // This is a placeholder - you will need to implement the logic to wait for OTP input
        await page.waitForSelector('selector-for-otp-input', { visible: true });
        // ...

        // Check if login was successful
        // This is a placeholder - you will need to implement the logic to check for successful login
        // You can wait for a selector that appears only upon successful login
        // or check the URL to be redirected to the logged-in page
        const loginSuccess = await page.waitForSelector('selector-for-logged-in-state', { visible: true });
        // ...

        // Perform post-login actions if login is successful
        if (loginSuccess) {
            // Wait for 10 seconds on the page
            await page.waitForTimeout(10000);

            // Perform additional tasks
            // ...

            logger.info('Login successful and post-login actions performed');
        }
        return page
    } catch (error) {
        logger.error(`Error occurred in Login Process ${error.message}`);
        throw new Error(`Error occurred in Login Process ${error.message}`)
    }
}

module.exports = { loginProcess };
