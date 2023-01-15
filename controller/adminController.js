
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const path = require('path')
const connection = require('../config/db')

const getinfo = asynchandler(async (req, res) => {
    const error = []
    
    const adminName = req.session.user.name

    const sql = `select p.pid, p.name, p.release_year, p.official_link, p.rating, p.description, c.category_name, p.img
                from category c, products p where p.category_id = c.category_id`
    connection.query(sql, async (err, results1, field) => {
        if (err) {
            error.push('Server Error')
            return res.status(500).render('login', {
                error: error
            })
        }

        for(let i = 0; i < results1.length; i++){
            if(results1[i].rating == 0 || results1[i].rating == null){
                results1[i].rating = 'Not Rated'
            }
        }

        return res.status(200).render('adminControl', { admin: {name: adminName, o_uid: req.session.user.o_uid}, products: results1})
    })

})

const addProduct = asynchandler(async (req, res) => {

    const error = []
    const o_uid = req.session.user.o_uid
    const { image } = req.files

    if (!image){
        error.push('Image is required')
        return res.status(400).render('productCreate', { o_uid: o_uid, error: error })
    }

    // var magic = {
    //     jpg: 'ffd8ffe0',
    //     png: '89504e47'
    // }

    // var magigNumberInBody = image.data.toString('hex',0,4);
    // if (!magigNumberInBody == magic.jpg || 
    //     !magigNumberInBody == magic.png ) {
    //     error.push('Improper image type..It should be (jpg / png)')
    //     return res.status(400).render('productCreate', { o_uid: o_uid, error: error })
    // }

    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results, field) => {
        if (err) {
            error.push('Server Error... Try again')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
        if (results.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            req.session.destroy(() => {
                return res.status(401).render('login', {
                    error: error
                })
            })
        }

        const imgext = image.name.split(".")
        const imgnamearr = req.body.name.split(" ")
        const imgname = imgnamearr.join('_')
        image.name = imgname + '.' + imgext[imgext.length - 1]

        connection.query(`insert into products (name, release_year, official_link, description, category_id, org_uid, img) values 
        ("${req.body.name}", ${req.body.release_year}, "${req.body.official_link}", "${req.body.description}", ${req.body.category_id}, ${o_uid}, "${image.name}")`,
        (err, results, field) => {
            if (err) {
                error.push('Server Error... Try again')
                return res.status(500).render('productOperationInfo', {
                    error: error
                })
            }
            else{
                image.mv(path.dirname(__dirname) + '/public/images/' + image.name)
                error.push('Product Creation Successful.. You can create another product or Press cancel to go back')
                return res.status(200).render('productCreate', { o_uid: o_uid, error: error })
            }
        })
    })

})

const updateProduct = asynchandler(async (req, res) => {

    const error = []

    const pid = req.params.pid
    const o_uid = req.session.user.o_uid

    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results1, field) => {
        if (err) {
            error.push('Server Error... Try again')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
        if (results1.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            req.session.destroy(() => {
                return res.status(400).render('login', {
                    error: error
                })
            })
        }
        
        connection.query(`update products set name = ?, release_year = ?, official_link = ?, description = ?, category_id = ? where pid = ${pid}`, 
        [req.body.name, req.body.release_year, req.body.official_link, req.body.description, req.body.category_id],
            async (err, results2, field) => {
                if (err) {
                    error.push('Server Error.. Try again.. You can go Back')
                    return res.status(500).render('productOperationInfo', { o_uid: o_uid, error: error})
                } else {
                    connection.query(`select * from products where pid = ${pid}`,
                    async (err, results3, field) => {
                            if(err){
                                error.push('Server Error while retrieving.. But the product Updated... You can go Back')
                                return res.status(500).render('productOperationInfo', { o_uid: o_uid, error: error})
                            }
                            const product = results3[0]
                            error.push('Product Updated Successfully, You can Update Once again or Press Cancel to go back')
                            return res.status(200).render('productUpdate', { o_uid: o_uid, pid: pid, error: error, product: product})
                    })
                }
            })
        })
})

const deleteProduct = asynchandler(async (req, res) => {

    const error = []
    const pid = req.params.pid
    const o_uid = req.session.user.o_uid

    if(pid === null){
        error.push('pid required in the request to delete the product')
        return res.render('productOperationInfo', {o_uid: o_uid, error: error})
    }

    connection.query(`select * from products where pid = ${pid}`, 
        async (err, results, field) => {
        if (err) {  
            error.push('Server Error... Try again')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        }
        if (results.length == 0) {
            error.push('Product not found')
            req.session.destroy(() => {
                return res.status(400).render('login', {
                    error: error
                })
            })
        }
        connection.query(`delete from products where pid = ${pid}`,
            async (err, results, field) => {
            if (err) {
                error.push('Product Deletion failed..')
                return res.status(500).render('productOperationInfo', { o_uid: o_uid, error: error })
            } else {
                error.push('Product deleted successfully')
                return res.status(200).render('productOperationInfo', { o_uid: o_uid, error: error })
            }
        })
    })
})

const getUpdateForm = asynchandler(async (req, res) => {

    const error = []
    const pid = req.params.pid
    const o_uid = req.session.user.o_uid
    connection.query(`select * from products where pid = ${pid}`,
        async (err, results, field) => {
        if (err) {  
            error.push(err.message)
            return res.status(500).render('productOperationInfo', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Product Not Found')
            return res.status(400).render('productOperationInfo', { o_uid: o_uid, error: error })
        }
        const product = { 
            name: results[0].name,
            release_year: results[0].release_year,
            official_link: results[0].official_link,
            description: results[0].description
        }
        
        res.status(200).render('productUpdate', { o_uid: o_uid, pid: pid, error: [], product: product})
    })
})

const getCreateForm = asynchandler(async (req, res) => {

    const error = []
    const o_uid = req.session.user.o_uid
    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results, field) => {
        
        if (err) {
            error.push('Server Error... Try again')
            return res.status(500).render('productOperationInfo', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            req.session.destroy(() => {
                return res.status(400).render('login', {
                    error: error
                })
            })
        }

        res.status(200).render('productCreate', { o_uid: o_uid, error : [] })
    })

})

module.exports = {
    getinfo,
    addProduct,
    updateProduct,
    deleteProduct,
    getUpdateForm,
    getCreateForm
}