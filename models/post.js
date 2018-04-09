var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var moment = require('moment');


var connection = mongoose.createConnection("mongodb://localhost/Blog");

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(connection);

var PostSchema =  new Schema({
    posttitle: {
        type: String,
        index: true
    },
    postcontent: {
        type: String
    },
    postauthor: {
        type: String
    },
    posttimestamp: {
        type : Date,
        default: Date.now
    },
    comments: {
        type: [],
        comment_id: {
            type: String,
            index: true
        },
        comment_user: {
            type: String
        },
        comment_content: {
            type: String
        },
        comment_timestamp: {
            type : Date,
            default: Date.now
        }
    }
});


PostSchema.plugin(autoIncrement.plugin, 'Blog');
//PostSchema.plugin(autoIncrement.plugin, 'comment');
//var Post = connection.model('Blog', PostSchema);

///////////////////////

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.addPost = function (newPost, callback) {
    newPost.save(callback);
};

module.exports.getPostById = function (id, callback) {
    Post.findById(id, callback);
};

module.exports.updatePost = function (updatedPost, callback) {
    updatedPost.update(callback);
};


