    // normal codes for backend 

// requiring packages 
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();


//mongoose connection
mongoose.connect(process.env.DBURL)
.then(()=>{
  console.log("Db connection SUCCESS");
})
.catch(()=>{
    console.log("Db not connected");
  });


//   module 

const schema = require('./Modules/User')
const verifyToken = require('./middelware')
const Messageschema =require('./Modules/message')


// middleware 
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors());
app.use(CookieParser());



// server 
// signup portion 
app.post('/signup', async(req,res)=>{
    const data = new schema({
        ...req.body,
    })
    const {emailOrphone} =req.body
    const existingUser =await schema.findOne({emailOrphone})
    if(existingUser)
    {
        res.json("Email is Already Existing")
    }
    else
    {
        await data.save()
        .then(()=>{
            // console.log(data);
            res.json('Signup successfull')
        })
        .catch(()=>{
            res.json("Something Worng");
        })
    }
})
// login portion 
app.post('/login', async(req,res)=>{
    const {emailOrphone,password} = req.body
    const User = await schema.findOne({emailOrphone})
    if(!User)
    {
       return   res.json("Invalid Email")
    }
    if(password !== User.password)
    {
        res.json("Invalid Password")
    }
        
    const token = jwt.sign({id: User._id, emailOrphone: User.emailOrphone}, process.env.SECRETKEY, // SECRETKEY is come from .env file 
       {
          expiresIn:'1h' // it tells when then code is expires
       
       });
       res.cookie('jwt', token, { httpOnly: true });
        
          res.json({ success: 'Login successful', token });
    
})




// post portion 
app.post('/postdata',verifyToken, async(req,res)=>{
    const{ reg_no , department , semester_number , year  } = req.body;
    // if(!(reg_no , department , semester_number , year ))
    // {
    //     return res.status(400).json({ message: 'Message is required' });
    // }
    const userId =req.User.id;
    const newMessage = new Messageschema({ userId, reg_no , department , semester_number , year  });

    await newMessage.save();
    res.json({
        message:'Data Posted Successfully', data:newMessage
    })
})

// get portion 
app.get('/getdata', verifyToken, async(req,res)=>{
    const userId =req.User.id;
    const message = await Messageschema.find({userId})
    res.json({ message:'Data retrieved successfully', data: message });
})

// app.get('/get',async(req,res)=>{
//     const data =await schema.find({})
//     res.json(data)
// })


// put portion 
// Update data endpoint
app.put('/putdata/:id', verifyToken, async (req, res) => {
    const userId = req.User.id;
    const { reg_no, department, semester_number, year } = req.body;

    try {
        const updatedMessage = await Messageschema.findOneAndUpdate(
            { _id: req.params.id, userId }, // Match both message ID and user ID
            { reg_no, department, semester_number, year }, // New data to update
            { new: true } // To return the updated record
            
        );
        

        if (!updatedMessage) {
            return res.status(404).json({ message: 'Data not found or unauthorized' });
        }

        res.json({ message: 'Data updated successfully', data: updatedMessage });
    } catch (error) {
        res.status(500).json({ message: 'Error updating data' });
    }
});

// delete portion  
// Delete data endpoint
app.delete('/deletedata/:id', verifyToken, async (req, res) => {
    const userId = req.User.id;

    try {
        const deletedMessage = await Messageschema.findOneAndDelete({
            _id: req.params.id,
            userId // Match both message ID and user ID
        });

        if (!deletedMessage) {
            return res.status(404).json({ message: 'Data not found or unauthorized' });
        }

        res.json({ message: 'Data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting data' });
    }
});








// port server 
app.listen(process.env.PORT,()=>{
    console.log(`Server listening on port:${process.env.PORT}`);
})