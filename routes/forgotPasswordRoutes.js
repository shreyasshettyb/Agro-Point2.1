const express = require('express')
const router = express.Router()

const { mailPassword } = require('../controller/mailController')

router.route('/')
.get((req, res) => {
    if(req.session.user){
        req.session.destroy(() => {
            return res.status(500).render('forgotPassword', {
                error: []
            })
        })
    }
    return res.status(500).render('forgotPassword', {
        error: []
    })
})
.post(mailPassword)

module.exports = router