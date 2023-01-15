
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getProduct = asynchandler(async (req, res) => {

    const error = []

    connection.query(`select name, release_year, official_link, rating, description, category_id, pid, img from products where pid = ${req.params.pid}`, 
    async (err, results1, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        } 
        if (results1.length == 0){
            error.push('You are trying to access UNAUTHORIZED CONTENT')
            req.session.destroy(() => {
                return res.status(401).render('login', {
                    error: error
                })
            })
        }
        if(results1[0].rating == 0 || results1[0].rating == null)
            results1[0].rating = "Not Rated"
        else
            results1[0].rating = `${results1[0].rating}/5`
        const product = results1[0]
        product.userName = req.session.user.name

        const sql = `select c.comment, c.rating, c.createdAt, u.name from comments c, user u  
            where c.p_id = ${req.params.pid} and c.user_id = u.uid and c.user_id != ${req.session.user.uid}`

        connection.query(sql, async (err, results2, field) => {
            if (err) {
                error.push('Server Error')
                req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error
                    })
                })
            }

            if(results2.length == 0)
                product.commentStatus = 'No Reviews Yet'
            else
                product.commentStatus = 'Other\'s Reviews:'
            product.comments = results2

            const sql = `select comment, rating, createdAt from comments 
            where p_id = ${req.params.pid} and user_id = ${req.session.user.uid}`
            connection.query(sql, async (err, results3, field) => {
                if (err) {
                    error.push('Server Error')
                    req.session.destroy(() => {
                        return res.status(500).render('login', {
                            error: error
                        })
                    })
                }
                if(results3.length == 0){
                    product.newComment = [1]
                    product.oldComment = []
                    return res.status(200).render('product', product)
                }
                product.newComment = []
                product.oldComment = results3
                res.status(200).render('product', product)
            })
        })
    })

})

module.exports = {
    getProduct
}