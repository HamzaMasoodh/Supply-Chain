const mongoose = require("mongoose");
require('dotenv').config();

const schema = new mongoose.Schema(
  {
    URL:{
      type:String
    },
    Reviewed:{
        type:String
    },
    Moved:{
        type:String
    },
    Notes:{
        type:String
    }
  },
  { timestamps: true });

const Url = mongoose.model("Url", schema);

module.exports = Url;