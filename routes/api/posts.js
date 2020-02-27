const express = require('express');
const router = express.Router();
const posts = require('../../posts');
const jwt = require('jsonwebtoken');
const multer = require('multer');

//images store path
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    //naming of the images
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
});

// cb == callbacks
const fileFilter = (req, file, cb) => {
    // accepting and rejected filetypes
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
  
//upload constant for images
const upload = multer({storage: storage, fileFilter: fileFilter});

router.get('/', (req, res) => res.json(posts));


router.get('/:id', (req, res) => {
    const found = posts.some(post => post.id === parseInt(req.params.id));

    if (found) {  //if true
        //show only posts where id is the same
        res.json(posts.filter(post => post.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
    }
});

//verify that token is entered and the number of images we want to upload in an array
router.post('/', verifyToken, upload.array('images',4), (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            //if token autherization failed sent error
            return res.sendStatus(401);
        } else {
            //show images upload in connsole
            console.log(req.files);
            const newpost = {
                id: posts.length + 1,
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                location: req.body.location,
                images: req.files.map(file => file.path),
                price: req.body.price,
                date: new Date().toISOString().slice(0,10),
                delivery: req.body.delivery,
                email: authData.users.email,
                username: authData.users.username
            }
            
            //check if there is data missing from the form
            if (!newpost.title || !newpost.description || !newpost.category || !newpost.location || !newpost.price || !newpost.delivery) {
                return res.status(400).json({ msg: 'Please include all the informations for a post' });
            }
            
            //sent the new post to the database
            posts.push(newpost);
            //show all posts with the newly added one
            res.json(posts);
            // res.redirect('/');

        }
    });
});



router.put('/:id', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.sendStatus(401);
        } else {

            const found =posts.some(post => post.id === parseInt(req.params.id));

            if (found) {
                const updpost = req.body;
                //go through each post
                posts.forEach(post => {
                    //check for the post with same id
                    if(post.id == parseInt(req.params.id)) {
                        
                        //verify if the authorized user has created the post
                        if (post.username !== authData.users.username) {
                            //if not error
                            return res.sendStatus(401);
                    
                        } 
                        //update the post information
                        post.title = updpost.title ? updpost.title : post.title;
                        post.category = updpost.category ? updpost.category : post.category;
                        post.location = updpost.location ? updpost.location : post.location;
                        post.price = updpost.price ? updpost.price : post.price;
                        post.delivery = updpost.delivery ? updpost.delivery: post.delivery;
                        
                        //show message that post is updated
                        res.json({ msg : 'post Updated', post });
                    }
                });

            } else {
                // if post with id doesnt exist sent error
                res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
            }
        }
    });
});


//delete route with token verification
// if the post was created by the same user we ca delete it otherwise it sents an error
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
                        //group post by index number
                        const index = posts.indexOf(found);
                        //delete it with the same id
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



// Search for category
router.get('/category/:search', (req, res) => {
   
    const found = posts.some(post => post.category === req.params.search);
    if (found) {
        res.json(posts.filter(post => post.category === req.params.search));
    } else {
        res.status(400).json({ msg: `No category with the name of ${req.params.search}` });
    }  
});

// Search for location
router.get('/location/:search', (req, res) => {
   
    const found = posts.some(post => post.location === req.params.search);
    if (found) {
        res.json(posts.filter(post => post.location === req.params.search));
    } else {
        res.status(400).json({ msg: `No posts location with the name of ${req.params.search}` });
    }  
});


// Search by date
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