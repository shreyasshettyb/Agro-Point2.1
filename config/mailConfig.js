const nodemailer = require("nodemailer")

const auth = {
  type: "OAuth2",
  user: "agropointofficial@gmail.com",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: auth
})

module.exports = {
  transporter
}