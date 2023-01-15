
const express = require('express')
require('dotenv').config()
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const { checkAuth } = require('./middleware/userValidation')

const viewsPath = path.join(__dirname, './views')

const app = express()

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', viewsPath)

app.use(express.static('public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(fileUpload({
  limits: {
      fileSize: 10000000,
  },
  abortOnLimit: true,
}))

app.use(session({
  secret: 'seCReT',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000
  }
}))

app.use('/', require('./routes/defaultRoutes'))

app.use('/api/register', require('./routes/registerRoutes'))
app.use('/api/login', require('./routes/loginRoutes'))
app.use('/api/forgotPassword', require('./routes/forgotPasswordRoutes'))
app.use('/api/logout', require('./routes/logoutRoutes'))

app.use('/api/adminControl', checkAuth, require('./routes/adminRoutes'))

app.use('/api/user', checkAuth, require('./routes/userRoutes'))
app.use('/api/profile', checkAuth, require('./routes/profileRoutes'))

app.use('/api/category', checkAuth, require('./routes/categoryRoutes'))

app.use('/api/product', checkAuth, require('./routes/productRoutes'))

app.use('/api/comment', checkAuth, require('./routes/commentRoutes'))


app.get('*', (req, res) => {
    res.status(404)
    res.render('404')
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server started at port ${port}`))
