const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const igdb = require('igdb-api-node').default;
const client = igdb('b7d86f33839547bbe3e03df91d0ea4f8');
const NewsApi = require('newsapi');
const newsapi = new NewsApi('e565a5235f6643608297fad059d2d3d3');

mongoose.connect('mongodb://dragonking99:7!28CcsZRZpy@ds253871.mlab.com:53871/psn-watch')

// Create a schema
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

const User = mongoose.model('User', userSchema)

module.exports = (app) => {
    app.get('/messages', (req, res) =>{

    });

    app.post('/messages', (req, res) => {

    });
    
    app.get('/friends', (req, res) => {
        console.log('hit');
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
        var posts = {

        }
    });

    app.post('/posts', (req, res) => {

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
