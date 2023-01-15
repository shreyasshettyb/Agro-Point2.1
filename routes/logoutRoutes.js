const express = require('express')
const router = express.Router()

const { logout } = require('../controller/loginController')

router.route('/').get(logout)

module.exports = router