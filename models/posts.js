let mongoose = require('mongoose');
let Schema = mongoose.Schema;
var exports = module.exports = {};

// Schema for comments - exported to blog schema!
exports.commentSchema = new Schema({
    author: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// Schema for blog posts - comment schema is used here!
exports.blogSchema = new Schema({
    title:  String,
    author: String,
    body:   String,
    comments: [ exports.commentSchema ],
    date: {
        type: Date,
        default: Date.now
    }
});

exports.Blog = mongoose.model('Blog', exports.blogSchema);
