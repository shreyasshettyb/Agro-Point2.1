
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const addComment = asynchandler(async (req, res) => {
    
    const error = []
    const pid = req.params.pid

    connection.query(`select * from comments where user_id = ${req.session.user.uid} and p_id = ${pid}`, 
    async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        } else {
            if (results.length != 0) {
                error.push('You are trying to do UNAUTHORIZED ACCESS')
                req.session.destroy(() => {
                    return res.status(401).render('login', {
                        error: error
                    })
                })
            }
            connection.query(`insert into comments (comment, rating, user_id, p_id) values ("${req.body.comment}", ${req.body.rating}, ${req.session.user.uid}, ${pid} )`,
            async (err, results, field) => {
                if (err) {
                    error.push('Server Error')
                    req.session.destroy(() => {
                        return res.status(500).render('login', {
                            error: error
                        })
                    })
                } 
                else{
                    updateRating(req, res)
                }
            })
        }
    })

})

const deleteComment = asynchandler(async (req, res) => {

    const error = []
    connection.query(`select cid from comments where p_id = ${req.params.pid} and user_id = ${req.session.user.uid}`, 
        async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
        if (results.length == 0) {
            error.push('You are trying to do UNAUTHORIZED ACCESS')
            req.session.destroy(() => {
                return res.status(401).render('login', {
                    error: error
                })
            })
        }

        const cid = results[0].cid

        connection.query(`delete from comments where cid = ${cid}`,
        async (err, results, field) => {
            if (err) {
                error.push('Server Error')
                req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error
                    })
                })
            } else {
                updateRating(req, res)
            }
        })
    })

})

function updateRating(req, res){
    const error = []
    connection.query(`update products set rating = (select avg(rating) from comments) where pid = ${req.params.pid}`,
    async (err, results, field) => {
        if (err) {
            error.push('Server Error while reloading.. Try LogIn')
                    req.session.destroy(() => {
                        return res.status(500).render('login', {
                            error: error
                        })
                    })
        } else {
            res.status(200).redirect(`/api/product/${req.params.pid}`)
        }
    })
}

const updateComment = asynchandler(async (req, res) => {

    const error = []
        
    if(req.params.pid == null){
        error.push('Product id is required to update comment.. Try LogIn')
        req.session.destroy(() => {
            return res.status(400).render('login', {
                error: error
            })
        })
    }
    
    const pid = req.params.pid

    if(req.session.user.type !== 'user'){
        error.push('No Access')
        req.session.destroy(() => {
            return res.status(401).render('login', {
                error: error
            })
        })
    }

    connection.query(`select cid from comments where p_id = ${pid} and user_id = ${req.session.user.uid}`, 
        async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })  
        } else {
            if(results.length == 0) {
                error.push("User has no privileges to update a comment")
                req.session.destroy(() => {
                    return res.status(500).render('login', {
                        error: error
                    })
                })
            }
            else{
                connection.query(`update comments set comment = "${req.body.comment}", rating = ${req.body.rating} where cid = ${results[0].cid}`,
                async (err, results1, field) => {
                    if (err) {
                        error.push('Server Error')
                        req.session.destroy(() => {
                            return res.status(500).render('login', {
                                error: error
                            })
                        })
                        } else {
                            updateRating(req, res)
                        }
                    })
                }
            }
        })
})


const getUpdateForm = asynchandler(async (req, res) => {

    const error = []
    const pid = req.params.pid
    const uid = req.session.user.uid

    connection.query(`select comment, rating from comments where p_id = ${pid} and user_id = ${uid}`,
        async (err, results, field) => {
        if (err) {  
            error.push(err.message)
            return res.status(500).render('login', { error: error })
        }
        if (results.length == 0) {
            error.push('Unauthorized access... Try LogIn')
            return res.status(400).render('login', { error: error })
        }
        const comment = {
            comment: results[0].comment,
            rating: results[0].rating
        }
        
        res.status(200).render('updateComment', { pid: pid, error: [], comment: comment})
    })
})

module.exports = {
    addComment,
    deleteComment,
    updateComment,
    getUpdateForm
}