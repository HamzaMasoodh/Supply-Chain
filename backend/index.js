require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const fs = require('fs');
const path = require('path');
const logger = require('./src/utility/logger')
const { checkForNewFiles } = require('./src/utility/database')
const { processURLsContinuously } = require('./src/controller/processController')
const schedule = require('node-schedule');
global.sharedUrls = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));

app.use('/', require('./src/routes/uploadFile'))
const downloadsBaseDir = path.resolve(__dirname, 'downloads');

if (!fs.existsSync(downloadsBaseDir)) {
  fs.mkdirSync(downloadsBaseDir, { recursive: true });
}
    
async function startApplication() {
  try {

    await populateGlobalURLs();
    processURLsContinuously();
    checkForNewFiles()
    logger.info("Connected to the database and initialization is complete.");
  } catch (error) {
    logger.error(`Error connecting to the database: ${error.message}`);
  }
}

startApplication();

schedule.scheduleJob('*/20 * * * *', function () {
  console.log('Running scheduled database update...');
  checkForNewFiles()
    .then(() => console.log('Database initialization completed.'))
    .catch(error => console.error('Failed to initialize database:', error));
});

async function populateGlobalURLs() {
  try {
    const fileRecords = await prisma.url.findMany({
      select: { URL: true }  
    });

    global.sharedUrls = fileRecords.map(record => record.URL);
    logger.info("Global URL array has been populated.");
  } catch (error) {
    logger.error(`Failed to fetch URLs from the database: ${error.message}`);
    throw new Error(`Failed to fetch URLs: ${error.message}`);
  }
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
});