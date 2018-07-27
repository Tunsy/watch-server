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
        platinum: Number,
		completion: Number
	}]
});

const conversationSchema = new mongoose.Schema({
    participants: [String]
});

const messageSchema = new mongoose.Schema({
    from: String,
    message: String,
    timestamp: Date,
    conversation: String
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
            platinum: Number,
            completion: Number
        }]
    },
    likes: Number,
	comments: Number,
	shares: Number,
    images: [String]
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = (app) => {
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    })); 

    app.get('/conversations/:name', (req, res) => {
        Conversation.find({participants: req.params.name}, (err, conversations) => {
            Message.find({conversation: { $in: conversations.map(convo => convo._id) }}).sort('-date').exec((err, messagesInConversation) => {                             
                if (err) {
                    throw err;
                }
                let result = conversations.map(convo => ({
                    ...convo.toObject(),
                    messages: messagesInConversation.filter(msg => convo._id.toString() === msg.conversation)
                }))
                res.json(result)
            })
        });
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
            var post = new Post({title: req.body.title, 
                timestamp: Date.now(), 
                user: currentUser, 
                images: req.body.images, 
                likes: Math.floor(Math.random() * 10),
                comments: Math.floor(Math.random() * 10),
                shares: Math.floor(Math.random() * 10)
            })
            post.save((err, post) => {
                if(err) {
                    throw err;
                }
                res.status(200).json({postId: post._id})
            })
        });
    });

    app.get('/profile/:userId', (req, res) => {;   
        User.find({userId: req.params.userId}, (err, user) =>{
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
