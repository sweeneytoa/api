const express = require('express');
const router = express.Router();
const users = require('../../Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltRounds = 10;


//adding a new user
//using bcrypt to hash the passwords
router.post('/registration', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err,hash) {
    const newuser = {
        id: users.length + 1,
        username: req.body.username,
        email: req.body.email,
        password: hash
        
    }
    //verify if all fields are fullfilled

    if (!newuser.username || !newuser.email || !newuser.password) {
        return res.status(400).json({ msg: 'Please include a username and email and a password' });
    }
    //sent user to database
    users.push(newuser);
    res.json(users);
    // res.redirect('/');
    });
});

//login user
//async function because bcrypt is a async library
router.post('/login', async (req, res) => {
    const user = users.find(users => users.username === req.body.username)
    //verify if user exist
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
        //create a token for the user 
        jwt.sign({users : user}, 'secretkey', (err, token) => {
            res.json({
                token
            });
            });
        } else {
        res.send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})
  
  // FORMAT OF TOKEN
  // Authorization: Bearer <access_token>
  
  // Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
}

module.exports = router;