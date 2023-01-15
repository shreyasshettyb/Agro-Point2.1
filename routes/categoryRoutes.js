const express = require('express')
const router = express.Router()

const { getCategories, getProducts } = require('../controller/categoryController')

router.route('/').get(getCategories)
router.route('/:category_id').get(getProducts)

module.exports = router