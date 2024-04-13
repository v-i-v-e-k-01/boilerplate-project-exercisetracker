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
    required: true
  }
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  user_id:{
    type: String,
    required: true
  },
  description:{
    type: String,
    // required: true
  },
  duration:{
    type: Number,
    // required: true
  },
  date:{
    type: Date,
    default: Date.now
  }
});

const Exercise= mongoose.model("Exercise", exerciseSchema);


const createNewUser= async (username) =>{
  try{
  const newUser = new User({
    username: username
  });
  await newUser.save( 
    // function(err, data){
    // if(err) return console.error(err);
    // done(null, data);
    // }
  );
  return newUser;
  }
  catch(err){
    console.error(err);
  };
}

const addExercises =async (_id, description, duration, date) =>{
  try{
    const user= await User.findById(_id);
    if(!user)
    {
      console.log("Could Not Find User");
    }
    else
    {
      const newExercise = new Exercise({
        user_id: user._id,
        description: description,
        duration: duration,
        date: new Date(date).toDateString()
      });
    
      const exercise= await newExercise.save( 
        // function(err, data){
        // if(err) return console.error(err);
        // done(null, data);
        // }
      );
      return exercise;
    }
  }
  catch(err){
    console.error(err);
  }


};

app.post("/api/users", async function(req, res, next){
  const newUser = await createNewUser(req.body.username);
  res.json(newUser);
  next();
});

app.post("/api/users/:_id/exercises",async function(req,res,next){
  const newExercise =await addExercises(req.params._id, req.body.description, req.body.duration, req.body.date);
  res.json(newExercise);
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


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
