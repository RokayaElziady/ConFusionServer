const express = require('express')
const bodyParser = require('body-parser')

const mongoose = require('mongoose');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router()

var authenticate = require('../authenticate')


favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next)=> {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favoriteDishes) => {
        if(favoriteDishes != null){
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favoriteDishes)
        }
        else{
            err = new Error('You Dont have a favourite list');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favoriteDishes) => {
        if( favoriteDishes != null) {
            req.body.forEach(element => {
                if(favoriteDishes.dishes.indexOf(element._id) == -1){
                    favoriteDishes.dishes.push(element);
                }
            });
            favoriteDishes.save()
            .then((favorites) => {
                Favorites.find({user: req.user._id})
                .populate('user')
                .populate('dishes')
                .then((favourites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })                 
            }, (err) => next(err));
        }
        else{
            Favorites.create( {user: req.user._id, dishes: req.body})
            .then((favorites) => {
                console.log('favorite dishes created')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            }, (err) => next(err))
            .catch((err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndUpdate({user: req.user._id}, {
        $set : {dishes: [] }
    }, { new: true }) 
    .then((fav) => {
        if(fav != null){
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(fav)
        }
        else{
            err = new Error('List not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err)) 
})



favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favoriteDishes) => {
        if( favoriteDishes != null) {
            if(!favoriteDishes.dishes.includes(req.params.dishId)){
                favoriteDishes.dishes.push(req.params.dishId);
            }
            favoriteDishes.save()
            .then((fav) => {
                Favorites.findOne({user: req.user._id})
                .populate('user')
                .populate('dishes')
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })                 
            }, (err) => next(err));
        }
        else{
            Favorites.create( {user: req.user._id, dishes: [req.params.dishId]})
            .then((fav) => {
                console.log('favorite dishes created')
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(fav)
            }, (err) => next(err))
            .catch((err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav != null && dish.dishes.includes(req.params.dishId)) {
            if(fav.user.equals(req.user._id)){
                Favorites.updateOne({user: req.user._id}, { $pullAll: {dishes: [req.params.dishId]}})
                .then((fav) => {
                    Favorites.findOne({user: req.user._id})
                    .populate('user')
                    .populate('dishes')
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);  
                    })                 
                }, (err) => next(err));
            }
            else{
                var err = new Error('You are not authorized to perform this operation!')
                err.status = 403
                next(err)
            }
        }
        else if (dish == null) {
            err = new Error('List of favorites not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error(' dish not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = favoriteRouter