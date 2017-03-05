const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    author: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
    },
    title: {type: String, required: true},
    content: {type: String, required: true},
    created: {type: String},
});

blogSchema.virtual('authorString').get(function(){
    return `${this.author.firstName} ${this.author.lastName}`;
});

blogSchema.methods.apiRepr = function(){
    return {
        id: this._id,
        author: this.authorString,
        title: this.title,
        content: this.content,
        created: this.created
    };
};

const BlogPosts = mongoose.model('BlogPosts', blogSchema);
module.exports = {BlogPosts};