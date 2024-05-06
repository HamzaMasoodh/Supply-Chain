const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('./sendEmail'); // Update path as needed
const logger = require('./logger'); // Update path as needed

const prisma = new PrismaClient();
const downloadsBaseDir = path.resolve(__dirname, '..', '..', 'downloads');

async function checkForNewFiles() {
    try {
        // Retrieve all records from the database
        const fileRecords = await prisma.fileRecord.findMany();
        const databaseFiles = new Map(fileRecords.map(record => [path.join(record.directoryName, record.fileName), true]));

        // Read all directories within the base downloads directory
        const directories = await fs.readdir(downloadsBaseDir);
        let newFilesFound = false;
        let emailBody = '';

        for (const directory of directories) {
            const fullDirPath = path.join(downloadsBaseDir, directory);
            const stat = await fs.stat(fullDirPath);
            if (stat.isDirectory()) {
                // Read all files in the directory
                const files = await fs.readdir(fullDirPath);
                for (const file of files) {
                    const fullPath = path.join(fullDirPath, file);
                    // Check if file is not in database
                    if (!databaseFiles.has(fullPath)) {
                        newFilesFound = true;
                        logger.info(`New file detected: ${fullPath}`);
                        emailBody += `<p>New file detected: ${fullPath}</p>`;
                    }
                }
            }
        }

        // If new files were found, send an email notification
        if (newFilesFound) {
            await sendEmail('CRUD', process.env.RECIPIENT_EMAIL, emailBody);
        } else {
            logger.info('No new files detected.');
        }
    } catch (error) {
        logger.error(`Error checking for new files: ${error}`);
        throw new Error(`Error checking for new files: ${error}`);
    }
}

module.exports = {checkForNewFiles};