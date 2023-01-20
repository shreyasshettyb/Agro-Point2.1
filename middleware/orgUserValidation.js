
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const checkAuthOrgUser = async (req, res, next) => {

    const error = []
    if(!req.session.user){
        error.push('Session expired')
        return res.status(401).render('login', { error: error })
    }

    const type = req.session.user.type
    if(type !== 'org_user'){
        error.push('Bad request.. Try LogIn Again')
        await req.session.destroy(() => {
            return res.status(400).render('login', {
                error: error
            })
        })
    }
    else{
        const sql = `select name from org_user where o_uid = ${req.session.user.o_uid}`
        connection.query(sql, 
            async (err, results, field) => {
            if (err) {
                error.push('Server Error')
                await req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error
                    })
                })
            }
            if (results.length == 0) {
                error.push('You have no privileges... Try LogIn')
                await req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error
                    })
                })
            }
        
            next()

        })
    }
}

module.exports = { checkAuthOrgUser }