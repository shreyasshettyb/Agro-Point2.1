const express = require('express')
const router = express.Router()

const { getinfo ,addProduct, updateProduct, deleteProduct, getUpdateForm, getCreateForm } = require('../controller/adminController')


router.route('/update/:pid').post(updateProduct).get(getUpdateForm)
router.route('/delete/:pid').post(deleteProduct)
router.route('/add').get(getCreateForm).post(addProduct)

router.route('/:category_id').get(getinfo)

module.exports = router