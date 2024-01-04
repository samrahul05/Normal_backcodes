const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User_Details',
    },
    reg_no:String,
    department:String,
    // class:String,
    semester_number:String,
    year:String,

  });
  
  module.exports = mongoose.model('Message', messageSchema);