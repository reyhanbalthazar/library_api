const { db, dbQuery } = require('../config/database')
const { uploader } = require('../config/uploader');

module.exports = {
    getData: async (req, res) => {
        try {
            let { _sort, _order, status } = req.query
            let filterQuery = [];
            for (let prop in req.query) {
                if (prop != '_sort' && prop != '_order') {
                    if (prop == 'minimum' || prop == 'maximum') {
                        if (req.query[prop]) {
                            filterQuery.push(`year ${prop == 'minimum' ? '>' : '<'} ${db.escape(req.query[prop])}`)
                        }
                    } else {
                        filterQuery.push(`${prop == "title" ? `books.${prop}` : prop} LIKE "${req.query[prop]}%"`)
                    }
                }
            }
            let getSQL = `SELECT books.*,
            category.category
            FROM books 
            INNER JOIN category
            ON books.idcategory = category.idcategory
            WHERE books.status = ${status ? `${db.escape(status)}` : `"Active"`}
            ${filterQuery.length > 0 ? `AND ${filterQuery.join(" AND ")}` : ""}
            ${_sort && _order ? `ORDER BY ${_sort} ${_order}` : ""}
            ;`
            let resultsBooks = await dbQuery(getSQL)
            res.status(200).send({
                success: true,
                message: "Get Product success ✔",
                dataBooks: resultsBooks,
                error: ""
            });
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    getCategory: async (req, res) => {
        try {
            let category = await dbQuery(`SELECT * FROM library.category;`)
            res.status(200).send({
                success: true,
                message: "get category success",
                error: '',
                categoryList: category
            })
        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    editProducts: async (req, res) => {
        try {
            let editProducts = await dbQuery(`UPDATE books SET 
                title = "${req.body.title}", 
                author = "${req.body.author}", 
                description = "${req.body.description}", 
                year = ${req.body.year}, 
                idcategory = ${req.body.idcategory}
                WHERE id = ${req.params.id};`)

            res.status(200).send(editProducts)

        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    addProducts: async (req, res) => {
        try {
            const uploadFile = uploader("/imgProducts", "IMGUSER").array("images", 1)
            uploadFile(req, res, async (error) => {
                try {
                    console.log("file", req.files)
                    console.log("req.body", req.body.data)
                    let { title, author, idcategory, year, desc, status } = JSON.parse(req.body.data)
                    let insertSQL = await dbQuery(`INSERT INTO books (id, idcategory, title, author, image, description, year, status) VALUES
                    (null,
                        ${idcategory},
                        ${db.escape(title)},
                        ${db.escape(author)},
                        ${db.escape(`http://localhost:2400/imgProducts/${req.files[0].filename}`)},
                        ${db.escape(desc)},
                        ${year},
                        'Active');`)
                    res.status(200).send({
                        success: true,
                        message: "add book success"
                    })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        success: true,
                        message: "Failed ❌",
                        error: ""
                    });
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: true,
                message: "Failed ❌",
                error: ""
            });
        }
    },
    deleteProducts: async (req, res) => {
        try {
            let deleteProducts = await dbQuery(`UPDATE library.books SET status = "Deactive" WHERE id = ${req.params.id};`)
            res.status(200).send({
                success: true,
                message: "Delete products success",
                error: '',
                deleteProducts: deleteProducts
            })
            console.log("deleteProducts", deleteProducts)
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    }
}