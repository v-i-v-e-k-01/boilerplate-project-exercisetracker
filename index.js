const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose"); //
const bodyParser = require("body-parser");//
const { type } = require('express/lib/response');

app.use(bodyParser.urlencoded({extended: false}));//

app.use(cors())
app.use(express.static('public'))


mongoose.connect(process.env.DB_URL,{useNewUrlParser: true, useUnifiedTopology:true});//

const userSchema = new mongoose.Schema({
  username:{
    type: String, 
    // required: true
  }
});

let User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  user_id:{
    type: String,
    required: true
  },
  username:{
    type: String
  },
  description:{
    type: String,
    required: true
  },
  duration:{
    type: Number,
    required: true
  },
  date:{
    type: Date,
    default: Date.now
  }
});

let Exercise= mongoose.model("Exercise", exerciseSchema);


app.post("/api/users", async function(req, res, next){
  try{
    const userObj = new User({
      username: req.body.username
    });
    const user = await userObj.save();
    res.json(user);
  }
  catch(err){
    console.error(err);33
  };
  next();
});

app.post("/api/users/:_id/exercises",async function(req,res,next){
  try{
    const user= await User.findById(req.params._id);
    if(!user)
    {
      console.log("Could Not Find User");
    }
    else
    {
      const newExercise = new Exercise({
        user_id:user._id ,
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date? new Date(req.body.date).toDateString() : new Date().toDateString()
      });
    
      const exercise= await newExercise.save();
      res.json(exercise);
    }
  }
  catch(err){
    console.error(err);
  }
  next();
})

app.get("/api/users", async function(req, res,next){
  const users = await User.find({}.select("_id username"));
  if(!users)
  {
    res.send("No Users");
  }
  else
  {
    res.json(users);
  }
  next();
})


app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
  await User.syncIndexes();
  await Exercise.syncIndexes();
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
