const { db, dbQuery } = require('../config/database')

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
    }
}