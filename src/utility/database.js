const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const XLSX = require("xlsx");
const logger = require('./logger');
const { sendEmail } = require('./sendEmail');


// async function initializeDatabase() {
//   try {
//     // Load and parse the Excel file
//     const filePath = path.resolve(__dirname, '..', 'data', process.env.FILE_NAME);
//     if (!fs.existsSync(filePath)) {
//       logger.error(`No file found at ${filePath}`);
//       return;
//     }
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const records = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//     records.shift();  // Assuming first row is headers
//     const structuredRecords = records.map(([URL, Reviewed, Moved, Notes]) => ({
//       URL, Reviewed, Moved, Notes
//     }));

//     // Synchronize MS SQL database and memory
//     const existingRecords = await prisma.url.findMany({
//       select: { id: true, URL: true }
//     });
//     const existingRecordMap = new Map(existingRecords.map(rec => [rec.URL, rec.id]));

//     // Determine new and deleted records
//     const newRecords = structuredRecords.filter(record => !existingRecordMap.has(record.URL));
//     const existingURLs = new Set(structuredRecords.map(rec => rec.URL));
//     const deletedRecordIds = existingRecords.filter(rec => !existingURLs.has(rec.URL)).map(rec => rec.id);

//     // Execute database updates in a transaction
//     await prisma.$transaction(async (prisma) => {
//       if (newRecords.length > 0) {
//         await prisma.url.createMany({
//           data: newRecords,
//           skipDuplicates: true  // Assuming you want to skip duplicates
//         });
//         logger.info(`${newRecords.length} new record(s) inserted`);
//       }

//       if (deletedRecordIds.length > 0) {
//         await prisma.url.deleteMany({
//           where: {
//             id: { in: deletedRecordIds }
//           }
//         });
//         logger.info(`${deletedRecordIds.length} record(s) deleted`);
//       }
//     });

//     if (newRecords.length > 0 || deletedRecordIds.length > 0) {
//       let body = `Data Updated in Excel File. New Records: ${newRecords.length}, Deleted Records: ${deletedRecordIds.length}`;
//       await sendEmail('CRUD', process.env.RECIPIENT_EMAIL, body);
//     }

//   } catch (error) {
//     logger.error(`Database initialization failed: ${error}`);
//     throw error;
//   }
// }

async function initializeDatabase() {
  try {
    // Load and parse the Excel file
    const filePath = path.resolve(__dirname, '..', 'data', process.env.FILE_NAME);
    if (!fs.existsSync(filePath)) {
      logger.error(`No file found at ${filePath}`);
      return;
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    records.shift();  // Assuming first row is headers
    const structuredRecords = records.map(([URL, Reviewed, Moved, Notes]) => ({
      URL, Reviewed, Moved, Notes
    }));

    // Map URLs to their corresponding record for quick lookup
    const newRecordMap = new Map(structuredRecords.map(rec => [rec.URL, rec]));

    // Determine new, updated, and deleted records
    const newRecords = structuredRecords.filter(record => !global.sharedUrls.some(g => g.URL === record.URL));
    const deletedRecords = global.sharedUrls.filter(g => !newRecordMap.has(g.URL));

    // Update the global array: Add new records and remove deleted records
    global.sharedUrls = global.sharedUrls.filter(g => !deletedRecords.includes(g)); // Remove deleted records
    global.sharedUrls.push(...newRecords); // Add new records

    logger.info(`${newRecords.length} new record(s) added and ${deletedRecords.length} record(s) deleted from the global array.`);

    // Optional: Send an email notification about the update
    if (newRecords.length > 0 || deletedRecords.length > 0) {
      let body = `Data Updated in Excel File. New Records: ${newRecords.length}, Deleted Records: ${deletedRecords.length}`;
      // await sendEmail('CRUD', process.env.RECIPIENT_EMAIL, body);
    }
  } catch (error) {
    logger.error(`Initialization failed: ${error}`);
    throw error;
  }
}

module.exports = { initializeDatabase };
