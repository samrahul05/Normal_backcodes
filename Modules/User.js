
// schema validation  file 

const mongoose = require('mongoose')

const validation = new mongoose.Schema({
    name:String,
    emailOrphone:String,
    password:String,
    
   
})


module.exports=mongoose.model("User_Details",validation)