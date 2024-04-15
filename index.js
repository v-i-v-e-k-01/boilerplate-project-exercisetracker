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
    type: Date
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
    console.error(err);
  };
  next();
});

app.get("/api/users", async function(req, res,next){
  const users = await User.find({});
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


app.post("/api/users/:_id/exercises",async function(req,res,next){
  try{
    // const userId = req.params._id;
    const description = req.body.description;
    const duration= req.body.duration;
    var date = req.body.date.substring(0,10);
    if(!date)
    {
      date = new Date().toDateString();
    }

    // date =date.substring(0,10);

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
        description: description,
        duration: duration,
        date: date
      });
    await newExercise.save();

    res.json({
      username: newExercise.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: newExercise.user_id
    });
    }
  }
  catch(err){
    console.error(err);
  }
  next();
});

app.get("/api/users/:_id/logs", async (req, res, next)=>{
  try{
    const user = await User.findById(req.params._id);
    if(!user)
    {
      res.json({
        error: "No User Found"
      })
    }
    else{
      const exerciseArray = await Exercise.find({user_id: req.params._id });
      const Log = {
        username: user.username,
        count: exerciseArray.length,
        _id: user._id,
        log:[]
      }

      for(let i=0; i<exerciseArray.length; i++)
      {
        Log.log.push({
          description: exerciseArray[i].description,
          duration: exerciseArray[i].duration,
          date: exerciseArray[i].date.toDateString()
        });
      }
      res.json(Log);
    }
  }
  catch(err){
    console.error(err);
  };
  next();
});




app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
  await User.syncIndexes();
  await Exercise.syncIndexes();
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
// const express = require('express')
// const app = express()
// const cors = require('cors')
// require('dotenv').config()

// app.use(cors())
// app.use(express.static('public'))
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html')
// });





// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })
