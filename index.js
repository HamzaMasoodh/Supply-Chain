require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const logger = require('./src/utility/logger')
const {initializeDatabase} = require('./src/utility/database')
const {processURLsContinuously} = require('./src/controller/processController')
const schedule = require('node-schedule');
global.sharedUrls = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var corsOptions = {
    origin: '*',
};

app.use(cors(corsOptions));

async function startApplication() {
  try {
    // await prisma.$connect();
    // // This logs every query made by Prisma Client to the console
    // prisma.$on('query', e => {
    //   console.log(e.query)
    // });

    // Execute your initialization function
    await initializeDatabase();

    processURLsContinuously();

    logger.info("Connected to the database and initialization is complete.");
  } catch (error) {
    logger.error(`Error connecting to the database: ${error.message}`);
  }
}

startApplication();

schedule.scheduleJob('*/20 * * * *', function() {
  console.log('Running scheduled database update...');
  initializeDatabase()
      .then(() => console.log('Database initialization completed.'))
      .catch(error => console.error('Failed to initialize database:', error));
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
});