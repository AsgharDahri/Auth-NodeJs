const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  title: { type: String, default: null },
  text: { type: String, default: null },
 
});

module.exports = mongoose.model("form", formSchema);