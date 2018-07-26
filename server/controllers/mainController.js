const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const igdb = require('igdb-api-node').default;
const client = igdb('b7d86f33839547bbe3e03df91d0ea4f8');
const NewsApi = require('newsapi');
const newsapi = new NewsApi('e565a5235f6643608297fad059d2d3d3');

module.exports = (app) => {
    app.get('/messages', (req, res) =>{

    });

    app.post('/messages', (req, res) => {

    });
    
    app.get('/friends', (req, res) =>{
        var friends = [
            {
                name: 'Jeremy Carpenter',
                username: 'godofbore',
                status: 'In-Game',
                avatar: 'https://api.adorable.io/avatars/150/godofbore.png',
                game: 'God of War'
            },
            {
                name: 'Margaret Simmons',
                username: 'maggypoo',
                status: 'Online',
                avatar: 'https://api.adorable.io/avatars/150/maggypoo.png',
                game: ''
            },
            {
                name: 'Jeremy Carpenter',
                username: 'DragonKing99',
                status: 'Offline',
                avatar: 'https://api.adorable.io/avatars/150/xDragonKing99x.png',
                game: ''
            },
            {
                name: 'Mason Blue',
                username: 'XXfratfratbroXX',
                status: 'Offline',
                avatar: 'https://api.adorable.io/avatars/150/XXfratfratbroXX.png',
                game: ''
            },
            {
                name: 'Ping Jan',
                username: 'GOKUUUU',
                status: 'Online',
                avatar: 'https://api.adorable.io/avatars/150/GOKUUUU.png',
                game: ''
            },
        ];
        res.json(friends);
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

    app.post('/profile', (req, res) => {

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
