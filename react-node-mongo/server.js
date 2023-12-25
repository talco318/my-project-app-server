const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors")

const app = express();
const port = 3001;
app.use(cors())

// Replace 'your_mongo_db_connection_string' with your actual MongoDB connection string
mongoose.connect('mongodb://localhost:27017/login-project', {useNewUrlParser: true, useUnifiedTopology: true});

// Define a mongoose schema for the User model
const userSchema = new mongoose.Schema({
    token: String, personalDetails: {
        name: String, Team: String, joinedAt: Date, avatar: String,
    }
});

const projectSchema = new mongoose.Schema({
    id: String, name: String, score: Number, durationInDays: Number, bugsCount: Number, madeDadeline: Boolean
});

const User = mongoose.model('User', userSchema);
const Projects = mongoose.model('Projects', projectSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());

async function saveToDB(token, personalDetails, project) {
    const newUser = new User({token, personalDetails});
    const newProject = new Projects(project)
    // Save the user to the database
    await newUser.save();
    await newProject.save();

}

const USER_DATA = {
    "token": "9999-2222-3333-4444",
    "personalDetails": {
        "name": "Test Test",
        "Team": "Developers",
        "joinedAt": "2018-10-01",
        "avatar": "https://avatarfiles.alphacoders.com/164/thumb-164632.jpg"

    }
}


const PROJECTS_DATA = {
    "id": "5fb9953bd98214b6df37174d",
    "name": "Backend Project",
    "score": 88,
    "durationInDays": 35,
    "bugsCount": 74,
    "madeDadeline": false
};

const initData = () => {
    return saveToDB(USER_DATA.token, USER_DATA.personalDetails, PROJECTS_DATA);
}
initData();


// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const {token, personalDetails} = req.body;

        // Create a new user
        await saveToDB(token, personalDetails);

        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});



app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({});
        const token = user['token'];
        // const token = req.headers['token'];
        // console.log(req.headers['token']);
        // res.status(201).json({message: 'User login successfully'});
        res.status(201).json([user]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// Get user data by token endpoint
app.get('/user', async (req, res) => {
    try {

        const token = req.headers['token'];
        console.log(req.headers['token']);
        const user = await User.findOne({token: token});

        console.log(user);
        if (!user) {
            res.status(401).json({error: 'User not found'});
        } else {
            res.status(200).json(user);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// Get user projects by token endpoint
app.get('/projects', async (req, res) => {
    try {
        const tokenString =req.headers['authorization']

        const project = await Projects.find();

        if (!project) {
            res.status(401).json({error: 'Project not found'});
        } else {
            res.status(200).json(project);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
