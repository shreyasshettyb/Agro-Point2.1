
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')
const { encrypt, decrypt } = require('../config/crypto')

const getProfile = asynchandler(async (req, res) => {

    const error = []
    connection.query(`select email, name, uid from user where uid = ${req.session.user.uid}`, 
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
            error.push('Profile not found.. Try LogIn')
            req.session.destroy(() => {
                return res.status(401).render('login', {
                    error: error
                })
            })
        }

        res.status(200).render('profile', { error: [], profile: results[0] })

    })

})

const updateProfile = asynchandler(async (req, res) => {

    const error = []

    connection.query(`select name, email, password from user where uid = ${req.session.user.uid}`, 
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
            error.push('Profile not found.. Try LogIn')
            req.session.destroy(() => {
                return res.status(401).render('login', {
                    error: error
                })
            })
        }

        if(req.body.oldPassword !== decrypt(results[0].password)){
            error.push('Old password Entered is wrong')
            return res.status(400).render('profile', {
                error: error, profile: { name: results[0].name, email: results[0].email }
            })
        }
        else if (req.body.newPassword1.length < 6) {
            error.push('Password must be atleat 6 characters')
            return res.status(400).render('profile', { error: error , profile: { name: results[0].name, email: results[0].email } })
          }
        else if( req.body.newPassword1 !== req.body.newPassword2){
            error.push('ReConfirm new Passwords')
            return res.status(400).render('profile', {
                error: error, profile: { name: results[0].name, email: results[0].email }
            })
        }
        else{
            connection.query(`update user set name = "${req.body.name}", password = "${encrypt(req.body.newPassword1)}" where uid = ${req.session.user.uid}`,
            async (err, results1, field) => {
                if (err) {
                    error.push('Server Error')
                    req.session.destroy(() => {
                        return res.status(500).render('login', {
                            error: error
                        })
                    })
                }
                return res.status(200).render('profile', {
                    error: ['Sucessfully Updated..'], profile: { name: results[0].name, email: results[0].email }
                })
            })
        }
    })
})

module.exports = {
    getProfile,
    updateProfile
}