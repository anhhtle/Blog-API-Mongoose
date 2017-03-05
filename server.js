// requires

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const {PORT, DATABASE_URL} = require('./models');
const {BlogPosts} = require('./models');

const app = express();
app.use(bodyParser.json());
mongoose.Promise = global.Promise;

// API

app.get('/blog-posts', (req, res) => {
    BlogPosts
    .find()
    .exec()
    .then((posts) => {
        res.json({
            posts: posts.map(
                (posts) => posts.apiRepr())
        }); // end res
    }) // end then
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: `internal server error`});
    });
}) // end GET


// server
let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if(err){
                console.log('error at moongose.connect');
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`your app is listening on ${port}`);
                resolve();
            })
            .on('error', err => {
                console.log('error at runServer... app.listen');
                mongoose.disconnect();
                reject(err);
            });
        }); // end connect
    }); // end Promise
}; // end runServer

function closeServer(){
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('closing server');
            server.close(err => {
                if(err){
                    console.log('error at server.close');
                    return reject(err);
                }
                resolve();
            });
        }) // end Promise
    }); // end disconnect
}; // end closeServer

if(require.main === module){
    runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};