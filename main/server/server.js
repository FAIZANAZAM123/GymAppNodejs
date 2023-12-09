const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const { appendFileSync } = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine","hbs");


const path1 = path.join(__dirname, '..', 'views');

console.log(path1);


app.use(express.static(path1));

app.set("views",path1)


app.get("", (req, res) => {
    res.render("index");
});



const DB = 'mongodb+srv://faizanazam6980:boWXlunG6Iyiw3v8@cluster0.kikagqj.mongodb.net/NodeGymApp?retryWrites=true&w=majority';

mongoose.connect(DB).then(() => {
    console.log('Connection successful');
}).catch((err) => {
    console.log(err);
});

// Set up express-session middleware
app.use(session({
    secret: 'helonodemonnodemonnodem',
    resave: false,
    saveUninitialized: true,
}));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User1', userSchema);

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        if (req.session.loggedInUser) {
            console.log('hre')
            return res.send('Already loggined ');
            
        }

        else{
            const user = await User.findOne({ email, password });

            if (user) {
                req.session.loggedInUser = user;



                console.log(user,"its hete");
    
                const signupSuccess = req.query.signupSuccess === 'true';
                const message = signupSuccess ? 'Signup successful! You are now logged in.' : 'Login successful!';
    
    
    
                res.render('index', { message,loggedInUser: user });
            } else {
                res.send('Invalid email or password');
            }
        }

       
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect to the login page after logout
            res.redirect('/login.html');
        }
    });
});



app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.send('Email already exists. Please choose another one.');
        } else {
            const newUser = new User({ name, email, password });
            await newUser.save();

            req.session.loggedInUser = newUser;

            res.redirect('/index.html?signupSuccess=true');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/redirect', (req, res) => {
    if (req.session.loggedInUser) {
        res.redirect('/payment.html');
    } else {
        res.redirect('/login.html');
    }
});



app.get('/profile', (req, res) => {
    const loggedInUser = req.session.loggedInUser;

    if (!loggedInUser) {
        // Redirect to the login page if the user is not logged in
        return res.redirect('/login.html');
    }
    console.log(loggedInUser,"here");

    // Render the profile page with user data
    res.render('profile', { loggedInUser });
});



app.post('/updateProfile', async (req, res) => {
    try {
        const loggedInUser = req.session.loggedInUser;

        if (!loggedInUser) {
            return res.status(401).send('Unauthorized');
        }

        // Assuming you have a User model with a method like findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(
            loggedInUser._id,
            { $set: req.body },
            { new: true }
        );

        req.session.loggedInUser = updatedUser;

        res.status(200).send('Profile updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
