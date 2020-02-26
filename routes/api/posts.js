const express = require('express');
const router = express.Router();
const posts = require('../../posts');
const jwt = require('jsonwebtoken');



router.get('/', (req, res) => res.json(posts));

router.get('/:id', (req, res) => {
    const found = posts.some(post => post.id === parseInt(req.params.id));

    if (found) {
        res.json(posts.filter(post => post.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
    }
});

router.post('/', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            return res.sendStatus(403);
        } else {
            const newpost = {
                id: posts.length + 1,
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                location: req.body.location,
                price: req.body.price,
                date: new Date().toISOString().slice(0,10),
                delivery: req.body.delivery,
                email: authData.users.email,
                username: authData.users.username
            }

            if (!newpost.title || !newpost.description || !newpost.category || !newpost.location || !newpost.price || !newpost.delivery) {
                return res.status(400).json({ msg: 'Please include all the informations for a post' });
            }
            
            posts.push(newpost);
            res.json(posts);
            // res.redirect('/');

        }
    });
});



router.put('/:id', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {

            const found =posts.some(post => post.id === parseInt(req.params.id));

            if (found) {
                const updpost = req.body;
                posts.forEach(post => {
                    if(post.id == parseInt(req.params.id)) {

                        if (post.username !== authData.users.username) {
                            return res.sendStatus(400);
                        } 

                        post.title = updpost.title ? updpost.title : post.title;
                        
                        res.json({ msg : 'post Updated', post });
                    }
                });

            } else {
                res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
            }
        }
    });
});


router.delete('/:id', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {

            const found = posts.find(post => post.id === parseInt(req.params.id));

            if (found) {

                posts.forEach(post => {
                    if(post.id == parseInt(req.params.id)) {

                        if (post.username !== authData.users.username) {
                            return res.sendStatus(400);
                        } 
                    
                        const index = posts.indexOf(found);
                        posts.splice(index, 1);
                        res.status(400).json({ msg: `Deleted post with the id of ${req.params.id}` });
                        }
                    });
                    
            } else {
                res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
            }
        }
    });
});



// Search for gigs
router.get('/category/:search', (req, res) => {
   
    const found = posts.some(post => post.category === req.params.search);
    if (found) {
        res.json(posts.filter(post => post.category === req.params.search));
    } else {
        res.status(400).json({ msg: `No category with the name of ${req.params.search}` });
    }  
});

router.get('/location/:search', (req, res) => {
   
    const found = posts.some(post => post.location === req.params.search);
    if (found) {
        res.json(posts.filter(post => post.location === req.params.search));
    } else {
        res.status(400).json({ msg: `No location with the name of ${req.params.search}` });
    }  
});

router.get('/date/:search', (req, res) => {
   
    const found = posts.some(post => post.date === req.params.search);
    if (found) {
        res.json(posts.filter(post => post.date === req.params.search));
    } else {
        res.status(400).json({ msg: `No posts in  ${req.params.search}` });
    }  
});



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