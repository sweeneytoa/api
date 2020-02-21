const express = require('express')
const app = express()
const port = 3000

app.use(express.json());


const logger = (req, res, next) => {
    console.log('Hello');
    next();
}

app.use(logger);


const posts = [
    { id: 1, name: 'post1' },
    { id: 2, name: 'post2' },
    { id: 3, name: 'post3' },
];


app.get('/', (req, res) => res.send('Hello Worlds!'))

app.get('/api/posts', (req, res) => {
    res.send(posts)
});

app.get('/api/posts/:id', (req, res) => {
    const post = posts.find(c => c.id === parseInt(req.params.id));
    if (!post)  res.status(404).send('The post with the given ID was not found.');  //404 error not found 
    res.send(post);
});

app.post('api/posts', (req, res) => {
    if (!req.body.name || req.body.name.length < 3) {
        // 400 Bad request
        res.status(400).send('Name is required and should be minimum of 3 characters.');
        return;
    }
});

app.post('/api/posts', (req, res) => {
    const post = {
        id: posts.length + 1,
        name: req.body.name
    };
    posts.push(post);
    res.send(post);
});

app.use('/api/members', require('./routes/api/members'));

//body parses
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));