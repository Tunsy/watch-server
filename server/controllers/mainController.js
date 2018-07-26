const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const igdb = require('igdb-api-node').default;
const client = igdb('b7d86f33839547bbe3e03df91d0ea4f8');
const NewsApi = require('newsapi');
const newsapi = new NewsApi('e565a5235f6643608297fad059d2d3d3');

mongoose.connect('mongodb://dragonking99:7!28CcsZRZpy@ds253871.mlab.com:53871/psn-watch')

// Create schemas
const userSchema = new mongoose.Schema({
    userId: Number,
	name: String,
	username: String,
	online: Boolean,
	game: String,
	avatar: String,
	level: Number,
	levelupPercent: Number,
    language: String,
    followers: Number,
	trophies: [{
		game: {
			title: String,
			image: String
		},
		bronze: Number,
		silver: Number,
		gold: Number,
		completion: Number
	}]
});

const messageSchema = new mongoose.Schema({
    from: Number,
    to: Number,
    message: String,
    timestamp: Date
});

const postSchema = new mongoose.Schema({
    title: String,
    timestamp: Number,
    user: {
        userId: Number,
        name: String,
        username: String,
        online: Boolean,
        game: String,
        avatar: String,
        level: Number,
        levelupPercent: Number,
        language: String,
        followers: Number,
        trophies: [{
            game: {
                title: String,
                image: String
            },
            bronze: Number,
            silver: Number,
            gold: Number,
            completion: Number
        }]
    },
    likes: Number,
    images: [String]
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = (app) => {
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    })); 

    app.get('/messages/:to/:from', (req, res) => {
        Message.find({$or:[{to: req.params.to, from: req.params.from}, {to: req.params.from, from: req.params.to}]}).sort('-date').exec((err, messages) => {
            res.json(messages);
        })
    });

    app.post('/messages', (req, res) => {
        var message = new Message({to: req.body.to, from:req.body.from, message: req.body.message, date: Date.now()})
        message.save((err, message) => {
            if(err) {
                throw err;
            }
            res.status(200).json({messageId: message._id})
        })
    });
    
    app.get('/friends', (req, res) => {
        User.find({}).where('userId').ne(1).exec((err, user) => {
            if(err) {
                throw err;
            }
            res.json(user);
        })
    });

    app.get('/games', (req, res) => {
        var filter = req.query.filter;
        if (!filter) {
            filter = 'popularity';
        }
        filter = filter.concat(':desc');

        client.games({
            limit: 10,
            filters: {
                platforms: '48',
                'rating-gt': '50'
            },
            order: filter
        }, [
            'name',
            'summary',
            'storyline',
            'rating',
            'popularity',
            'cover',
        ]).then(data => {
            res.json(data);
        })
    });

    app.get('/search', (req, res) => {
        var title = req.query.title_query;
        client.games({
            search: title,
            limit: 5,
            filters: {
                platforms: '48',
            },
            order: 'popularity:desc'
        }, [
            'name',
            'summary',
            'storyline',
            'rating',
            'cover',
        ]).then(data => {
            res.json(data);
        })
    });

    app.get('/posts', (req, res) => {
        Post.find({}, (err, posts) => {
            if(err) {
                throw err;
            }
            res.json(posts)
        })
    });

    app.post('/posts', (req, res) => {
        User.findOne({userId: req.body.userId}, (err, currentUser) => {
            if (err) {
                throw err;
            }
            console.log(currentUser);
            var post = new Post({title: req.body.title, timestamp: Date.now(), user: currentUser, likes: 0, images: req.body.images})
            post.save((err, post) => {
                if(err) {
                    throw err;
                }
                res.status(200).json({postId: post._id})
            })
        });
    });

    app.get('/profile', (req, res) => {;   
        User.find({userId: req.query.userId}, (err, user) =>{
            if(err) {
                throw err;
            }
            res.json(user);
        })
    });

    app.get('/news', (req, res) => {
        newsapi.v2.topHeadlines({
            sources: 'ign',
            language: 'en',
        }).then(data => {
            var articles = data.articles;
            res.json(articles)
        });
    });
}
