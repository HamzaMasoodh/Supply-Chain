const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

// Function to check for watermarks in a PDF file
async function checkWatermark(filePath, watermarks) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        const text = data.text.toLowerCase();
        return watermarks.some(watermark => text.includes(watermark.toLowerCase()));
    } catch (error) {
        console.error(`Error processing PDF file ${filePath}: ${error}`);
        return false;
    }
}

// Function to read all PDFs in a directory and check for watermarks
async function scanDirectoryForWatermarks(dirPath) {
    const watermarkTerms = ['confidential', 'internal only']; // Add more terms as needed
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(`Unable to scan directory: ${err}`);
            return;
        }
        files.forEach(async (file) => {
            if (path.extname(file).toLowerCase() === '.pdf') {
                const fullPath = path.join(dirPath, file);
                const hasWatermark = await checkWatermark(fullPath, watermarkTerms);
                if (hasWatermark) {
                    console.log(`Watermark found in: ${fullPath}`);
                } else {
                    console.log(`No watermark found in: ${fullPath}`);
                }
            }
        });
    });
}

module.exports = {scanDirectoryForWatermarks}