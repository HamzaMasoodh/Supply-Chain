async function recordFilesInDatabase(downloadDirectory) {
    const fs = require('fs').promises;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
  
    try {
      const files = await fs.readdir(downloadDirectory);
      for (const fileName of files) {
        await prisma.fileRecord.create({
          data: {
            directoryName: downloadDirectory,
            fileName: fileName,
          }
        });
      }
      console.log(`Files recorded: ${files.length}`);
    } catch (error) {
      console.error(`Error recording files to database: ${error}`);
      throw new Error(`Failed to record files: ${error.message}`);
    }
  }
  

module.exports = {recordFilesInDatabase}