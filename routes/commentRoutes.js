
const express = require('express')
const router = express.Router()

const { addComment, deleteComment } = require('../controller/commentController')

router.route('/addComment/:pid').post(addComment)
router.route('/deleteComment/:pid').get(deleteComment)

module.exports = router