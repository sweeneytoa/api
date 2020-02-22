const express = require('express');
const router = express.Router();
const posts = require('../../posts');


router.get('/', (req, res) => res.json(posts));

router.get('/:id', (req, res) => {
    const found = posts.some(post => post.id === parseInt(req.params.id));

    if (found) {
        res.json(posts.filter(post => post.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
    }
});

router.post('/', (req, res) => {
    const newpost = {
        id: posts.length + 1,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        price: req.body.price,
        date: Date(Date.now()).toString(),
        delivery: req.body.delivery,
    }

    if (!newpost.title || !newpost.description || !newpost.category || !newpost.location || !newpost.price || !newpost.delivery) {
        return res.status(400).json({ msg: 'Please include all the informations for a post' });
    }
    
    posts.push(newpost);
    res.json(posts);
    // res.redirect('/');

});



router.put('/:id', (req, res) => {
    const found =posts.some(post => post.id === parseInt(req.params.id));

    if (found) {
        const updpost = req.body;
        posts.forEach(post => {
           if(post.id == parseInt(req.params.id)) {
               post.title = updpost.title ? updpost.title : post.title;
            
               res.json({ msg : 'post Updated', post });
            }
         });

    } else {
        res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
    }
});


router.delete('/:id', (req, res) => {
    const found = posts.some(post => post.id === parseInt(req.params.id));

    if (found) {
        res.json({ 
            msg: 'post Deleted', 
            posts: posts.filter(post => post.id !== parseInt(req.params.id))
        });
    } else {
        res.status(400).json({ msg: `No post with the id of ${req.params.id}` });
    }
});

module.exports = router;