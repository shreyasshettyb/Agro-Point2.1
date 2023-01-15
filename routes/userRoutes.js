const express = require('express')
const router = express.Router()

const { getHome } = require('../controller/homeController')

router.route('/').get(getHome)

module.exports = router