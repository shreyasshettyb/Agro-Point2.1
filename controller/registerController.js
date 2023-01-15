
const asynchandler = require('express-async-handler')
const { encrypt } = require('../config/crypto')
const connection = require('../config/db')

const createProfile = asynchandler(async (req, res) => {
      let error = []
      if (req.body.password != req.body.password2) {
        error.push('Passwords do not match')
        return res.status(400).render('register', { error: error})
      }
      if (req.body.password.length < 6) {
        error.push('Password must be atleat 6 characters')
        return res.status(400).render('register', { error: error })
      }

    try{
        const pwd = encrypt( req.body.password )

        connection.query(`select * from user where email = "${req.body.email}"`, async (err, results, field) => {
            if (err) {
                error.push('Server error')
                return res.status(500).render('register', { error: error })
            } else {
                if (results.length != 0) {
                    error.push('Email already registered')
                    return res.status(400).render('register', { error: error })
                }
                connection.query(`insert into user (name, email, password) values ("${req.body.name}", "${req.body.email}", "${pwd}")`, (err, results, field) => {
                    if (err) {
                        error.push('Server error')
                        return res.status(500).render('register', { error: error })
                    } 
                    connection.query(`select uid, name from user where email = "${req.body.email}"`, (err, results, fields) =>{
                        if((err) || (results.length == 0)){
                            error.push('Server error, Try LogIn')
                            return res.status(500).render('login', { error: error })
                        }
                        req.session.user = {type: "user", uid: results[0].uid, name: results[0].name }
                        res.status(200).redirect(`/api/user`)
                    })
                })
            }
        })
    }

    catch(err){
        console.log(err.message)
    }

})

module.exports = {
    createProfile
}