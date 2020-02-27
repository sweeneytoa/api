const express = require('express')
const app = express()
const port = 3000


app.use(express.json());
app.use('/uploads', express.static('uploads'));


const logger = (req, res, next) => {
    console.log('Hello');
    next();
}

app.use(logger);

//paths for routes
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api', require('./routes/api/users'));

//body parses
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));