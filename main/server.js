const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const { appendFileSync } = require('fs');
const hbs = require('hbs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine","hbs");


const path1 = path.join(__dirname, '..', 'views');

console.log(path1);


app.use(express.static(path1));

app.set("views",path1)


app.get("/", (req, res) => {
    if (req.session && req.session.loggedInUser) {
        const loggedInUser = req.session.loggedInUser;
        res.render("index", { loggedInUser });
    } else {
        res.render("index");
    }
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

hbs.registerHelper('isLoggedIn', function (value) {
    return value === 'false';
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user is already logged in
        if (req.session.loggedInUser) {
            const loggedInUser = req.session.loggedInUser;

            res.render('index', { loggedInUser });        }

        // Query the database to find the user by email and password (make sure to hash the password)
        const user = await User.findOne({ email, password });

        if (user) {
            req.session.loggedInUser = user;

            const signupSuccess = req.query.signupSuccess === 'true';
            const message = signupSuccess ? 'Signup successful! You are now logged in.' : 'Login successful!';
            const loggedInUser = req.session.loggedInUser;
            hbs.registerHelper('isLoggedIn', function (value) {
                return value === 'true';
            });
            const alert="You are Logginned successfully";


            res.render('index', { loggedInUser, message,alert });

        } else {
            // Incorrect email or password
            return res.redirect('/login.html?message=' + encodeURIComponent('Invalid email or password'));
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // Redirect to the login page after logout
            hbs.registerHelper('isLoggedIn', function (value) {
                return value === 'false';
            });
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

            res.redirect('/?signupSuccess=true');
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
