require('dotenv').config()
require('./config/database').connect();
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const User = require("./model/user");
const auth=require('./middleware/auth')
const { json } = require('express/lib/response');

const app = express();

app.use(express.json())
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).send("hello world");
});

app.post("/register", async(req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      console.log("req.body:", req.body);
      if (!(firstName && lastName && email && password)) {
        return res.status(400).send("All fields are required");
      }
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(401).send("User already exist");
      }
      const myEncrpytedPass = await bcryptjs.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: myEncrpytedPass,
      });
      const token = await jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "4h",
        }
      );

      user.token = token; // Added token in db and send it to user
      user.password= undefined // Set undefined so that it doesn't send back to user but didn't save it db so password will remain in it
      return res.status(201).json(user);
    } catch (error) {
        console.log("Error in register:",error)
   }
})

app.post('/login',async(req,res) => {
  try { 
    const { email, password } = req.body
    if (!(email && password)) {
      return res.status(400).send("field is missing ");
    }
    const user = await User.findOne({ email })
    if (!user) {
     return res.status(400).send("you are not regsitered");
    }
    if (user && (await bcryptjs.compare(password, user.password))) {
      const token = jwt.sign({
        user_id:user._id,email
      },
        process.env.SECRET_KEY,
        {
        expiresIn:"2h"
      }
      )
      user.token = token
      user.password = undefined
      // return res.status(200).json(user.token) 

      // If you want to use cookies authentication

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true
      }
      return res.status(200).cookie("authCookie", token, options).json({
        success: true,
        token,
        user,
      });
    }
    return res.status(400).send("email or password is incorrect");
  } catch(error){
    console.log(error)
  }
})

app.get('/dashboard', auth , (req,res) => {
  res.status(200).send('Welcome to secret info')
})

app.get("/logout", (req, res) => {
  user.token = undefined; // if token is in the header
  res.status(200).clearCookie("authCookie").send('You are logged out'); //if token is in cookie
});

module.exports = app;