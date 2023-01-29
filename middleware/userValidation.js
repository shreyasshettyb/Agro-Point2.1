
const asynchandler = require('express-async-handler')
const connection = require('../config/db')

const checkAuthUser = async (req, res, next) => {

    const error = []

    if(!req.session.user){
        error.push('Session expired')
        return res.status(401).render('login', { error: error })
    }
    
    if(req.session.user.type !== 'user'){
        error.push('Bad request.. Try LogIn Again')
        await req.session.destroy(() => {
            return res.status(400).render('login', {
                error: error
            })
        })
    }
    else{
        const sql = `select name from user where uid = ${req.session.user.uid}`
        const error1 = []
        connection.query(sql, 
            async (err, results, field) => {
            if (err) {
                error1.push('Server Error')
                await req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error1
                    })
                })
            }
            if (results.length == 0) {
                error1.push('You have no privileges... Try LogIn')
                await req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error1
                    })
                })
            }
        
            next()

        })
    }
}

module.exports = { checkAuthUser }