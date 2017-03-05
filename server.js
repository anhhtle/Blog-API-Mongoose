// requires

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {PORT, DATABASE_URL} = require('./config');
const {BlogPosts} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

// API
// GET
app.get('/blog-posts', (req, res) => {
    BlogPosts
    .find()
    .exec()
    .then(posts => {
        res.status(200).json({posts: posts.map(post => post.apiRepr())}); // end res
    }) // end then
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: `internal server error`});
    });
}) // end GET

// GET ID
app.get('/blog-posts/:id', (req, res) => {
    BlogPosts
    .findById(req.params.id)
    .exec()
    .then((post) => {
        res.status(200).json(post.apiRepr());
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: `internal server error`});
    });
});

// POST
app.post('/blog-posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for(let i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPosts
    .create({
        author: req.body.author,
        title: req.body.title,
        content: req.body.content
    })
    .then(post => res.status(201).json(post.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: `something went wrong`});
    });

}); // end POST

// DELETE
app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() =>{
        res.status(204).json({message: `success`});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: `something went wrong`});
    })
}); // end DELETE

app.put('/blog-posts/:id', (req, res) => {
    const updateFields = ['author', 'title', 'content'];
    const updateItem = {};
    updateFields.forEach(field => {
        if(field in req.body){
            updateItem[field] = req.body[field];
        }
    });
    
    BlogPosts
    .findByIdAndUpdate(req.params.id, {$set: updateItem}, {new: true})
    .exec()
    .then(updatedPost => {
        res.status(200).json(updatedPost.apiRepr());
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: `something went wrong`});
    });
    
});

// catch all
app.use('*', function(req, res) {
    res.status(404).json({message: 'Not found'});
});


// server
let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};