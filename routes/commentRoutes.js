
const express = require('express')
const router = express.Router()

const { addComment, deleteComment, updateComment, getUpdateForm } = require('../controller/commentController')

router.route('/addComment/:pid').post(addComment)
router.route('/updateComment/:pid').post(updateComment).get(getUpdateForm)
router.route('/deleteComment/:pid').get(deleteComment)

module.exports = router