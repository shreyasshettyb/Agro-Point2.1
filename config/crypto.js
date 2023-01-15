const crypto = require('crypto')
require('dotenv').config()

const algorithm = process.env.cryptoAlgo
const secretKey = process.env.cryptoSecret

const encrypt = text => {
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  const hash =  {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
  return (hash.iv + "+" + hash.content)
}

const decrypt = pwd => {
  const a = pwd.split("+")
  const hash = {'iv': a[0], 'content': a[1]}
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

  return decrpyted.toString()
}

module.exports = {
  encrypt,
  decrypt
}