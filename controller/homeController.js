const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getHome = asynchandler(async (req, res) => {

    userName = req.session.user.name
    return res.status(200).render('home', { user: { name: userName }})

})

module.exports = {
    getHome
}