const { Error } = require("mongoose");
const xlsx = require("xlsx");
const logger = require('../utility/logger')
const XLSX = require("xlsx");
const { PrismaClient } = require('@prisma/client');
const {sendEmail} = require('../utility/sendEmail')
const prisma = new PrismaClient();

const automation = async (file) => {
  try {

    let fileName = file.originalname;
    fileName = fileName.split(".")[0].toString();

    logger.info(`File uploaded for Automation Tool: ${fileName}`)

    // Read the uploaded file   
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]; 

    const records = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    records.shift();  // Assuming first row is headers
    const structuredRecords = records.map(([URL, Reviewed, Moved, Notes]) => ({
      URL, Reviewed, Moved, Notes
    }));

    // Synchronize MS SQL database and memory
    const existingRecords = await prisma.url.findMany({
      select: { id: true, URL: true }
    });
    const existingRecordMap = new Map(existingRecords.map(rec => [rec.URL, rec.id]));

    // Determine new and deleted records
    const newRecords = structuredRecords.filter(record => !existingRecordMap.has(record.URL));
    const existingURLs = new Set(structuredRecords.map(rec => rec.URL));
    const deletedRecordIds = existingRecords.filter(rec => !existingURLs.has(rec.URL)).map(rec => rec.id);

    // Execute database updates in a transaction
    let body = '';
    await prisma.$transaction(async (prisma) => {
      if (newRecords.length > 0) {
        await prisma.url.createMany({
          data: newRecords,
          skipDuplicates: true
        });
        logger.info(`${newRecords.length} new record(s) inserted`);
      }

      if (deletedRecordIds.length > 0) {
        await prisma.url.deleteMany({
          where: {
            id: { in: deletedRecordIds }
          }
        });
        logger.info(`${deletedRecordIds.length} record(s) deleted`);
      }
    });

    // Update global.sharedUrls array
    global.sharedUrls = existingRecords.map(record => record.URL).concat(newRecords.map(record => record.URL));
    global.sharedUrls = global.sharedUrls.filter(url => existingURLs.has(url)); // Remove deleted URLs

    if (newRecords.length > 0 || deletedRecordIds.length > 0) {
      body = `Data Updated in Excel File. New Records: ${newRecords.length}, Deleted Records: ${deletedRecordIds.length}`;
      await sendEmail('CRUD', process.env.RECIPIENT_EMAIL, body);
    }

    return { status: true, message: body };
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}
module.exports = automation