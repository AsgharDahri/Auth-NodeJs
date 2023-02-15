require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const path=require('path')
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt=require('bcryptjs')
const bodyParser = require('body-parser')
const auth = require("./middleware/auth");
const formSchema= require('./model/form')

// JWT_KEY=secret
// app.listen(3000,(req,res)=>{
//     console.log('app is listening at 3000');
// })
app.use(express.json());
const viewsPath=path.join(__dirname,'/templates/views')
app.set('view engine','hbs')
// app.use(express.static(partialPath))
app.set('views',viewsPath)
app.use(bodyParser.urlencoded({extended:true}))
// Logic goes here
const User = require("./model/user");
const form = require("./model/form");

// Register
app.get('/',(req,res)=>{
    res.render('index.hbs')
})
app.get('/login',(req,res)=>{
    res.render('login.hbs')
})

app.get('/home',(req,res)=>{
  res.render('home.hbs')
})
app.post("/register", async (req, res) => {
    console.log(req.body);

    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, email, password } = req.body;
      // Validate user input
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
      console.log(req.body);
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
      console.log(user);
      console.log((await bcrypt.compare(password, user.password)));
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          "" + process.env.JWT_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.header('auth-token',token);
  
        // save user token
        user.token = token;
          
        // user
        // res.status(200).json(user);
       res.render('home')
      }
      else{
      res.status(400).send("Invalid Credentials");

      }
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
app.post('/formSubmit',(req,res)=>{
  // console.log(req.body);
  // jwt.verify(user.token,process.env.JWT_KEY)

  const {title,text}=req.body
  console.log(title);
    formSchema.insertMany({title,text})
})

app.post("/welcome",auth, (req, res) => {
  
  res.status(200).send("Welcome 🙌 ");
  
});
module.exports = app;