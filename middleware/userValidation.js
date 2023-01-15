
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const checkAuth = (req, res, next) => {

    const error = []
    if(!req.session.user){
        error.push('Session expired')
        return res.status(401).render('login', { error: error })
    }

    let sql
    if(req.session.user.type == 'user'){
        sql = `select name from user where uid = ${req.session.user.uid}`
    }
    else if(req.session.user.type == 'org_user'){
        sql = `select name from org_user where o_uid = ${req.session.user.o_uid}`
    }
    else{
        error.push('Bad request.. Try LogIn Again')
        req.session.destroy(() => {
            return res.status(400).render('login', {
                error: error
            })
        })
    }

    connection.query(sql, 
        async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
        if (results.length == 0) {
            error.push('You have no privileges... Try LogIn')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
      
        next()

  })
}

module.exports = { checkAuth }