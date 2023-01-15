const express = require('express')
const router = express.Router()

const { validateProfile } = require('../controller/loginController')

router.route('/').get( (req, res) => {
    if (!req.session.user) {
      res.statusCode = 200
      res.render("login", { error: [] })
    } else {
      res.status = 401
      if( req.session.user.type === 'org_user' )
        res.redirect(`/api/adminControl/${req.session.user.o_uid}`)
      if( req.session.user.type === 'user' )
        res.redirect(`/api/home/${req.session.user.uid}`)
    }
  })
  .post(validateProfile)

module.exports = router