const dotenv = require("dotenv");
const express = require('express');
const multer = require("multer");
const automation = require("../processess/handleFileProcess")
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.post("/automation/upload", upload.single("file"), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send({ status: false, message: "No file was uploaded!", data: [] });
        }

        let returnObj = await automation(req.file)

        return res.status(200).send({ status: returnObj.status, message: returnObj.message });


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error.");
    }
}
);

module.exports = app