const express = require('express')
const router = express.Router()

const { createProfile} = require('../controller/registerController')

router.route('/')
.get((req, res) => {
    if (!req.session.user) {
    res.statusCode = 200
    res.render("register", { error: [] })
    } else {
    res.status = 401
    res.redirect("/api/logout")
    }
})
.post(createProfile)

module.exports = router