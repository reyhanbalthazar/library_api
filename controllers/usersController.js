const { db, dbQuery } = require('../config/database');
const Crypto = require('crypto');
const { hashPassword, createToken } = require('../config/encrip');
const { transporter } = require('../config/nodemailer');


module.exports = {
    getData: (req, res, next) => {
        db.query(
            `SELECT username, email, role, status FROM datauser;`,
            (err, results) => {
                if (err) {
                    console.log(err)
                    res.status(400).send(err)
                };
                res.status(200).send(results);
            })
    },
    register: async (req, res) => {
        try {
            let { username, password, email } = req.body
            // let hashPassword = Crypto.createHmac("sha256", "budi").update(password).digest("hex");
            console.table({
                before: password,
                after: hashPassword(password)
            })
            let insertSQL = `INSERT INTO datauser (username, email, password) VALUES
            (${db.escape(username)}, ${db.escape(email)}, ${db.escape(hashPassword(password))})`
            let getSQL = `SELECT * FROM datauser WHERE email=${db.escape(email)};`
            let checkEmail = await dbQuery(getSQL);
            if (checkEmail.length > 0) {
                res.status(400).send({
                    success: true,
                    message: "Email Exist ⚠",
                    error: ""
                });
            } else {
                let insertUser = await dbQuery(insertSQL);
                if (insertUser.insertId) {
                    let getUser = await dbQuery(`SELECT * FROM datauser WHERE id=${insertUser.insertId};`)
                    let { id, username, email, role, status } = getUser[0];
                    let token = createToken({ id, username, email, role, status })
                    await transporter.sendMail({
                        from: "Admin Commerce",
                        to: "reyhanbshp@gmail.com",
                        subject: "Confirm Registration",
                        html: `<div>
                        <h3>Klik Link dibawah ini untuk verifikasi akun anda</h3>
                        <a href='http://localhost:3000/verification/${token}'>Click, Here</a>
                        </div>`
                    })
                    res.status(200).send({
                        success: true,
                        message: "Register Succes ✅",
                        error: ""
                    })
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: true,
                message: "Failed ❌",
                error: ""
            })
        }


        // db.query(insertSQL, (err, results) => {
        //     if (err) {
        //         console.log(err)
        //         res.status(400).send(err)
        //     };
        //     res.status(200).send({
        //         success: true,
        //         message: "Register Success ✅",
        //         error: ""
        //     })
        // })
    },
    login: (req, res, next) => {
        let { email, password } = req.body
        // let hashPassword = Crypto.createHmac("sha256", "budi").update(password).digest("hex");
        let loginScript = `SELECT * FROM datauser WHERE email=${db.escape(email)} AND password=${db.escape(hashPassword(password))};`

        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).send({
                    success: true,
                    message: "Failed ❌",
                    error: err
                })
            };

            if (results.length > 0) {
                let { id, username, email, password, role, status } = results[0]
                let token = createToken({ id, username, email, role, status })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { id, username, email, password, role, status, token }
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log(req.body)
        let keepLoginScript = `SELECT * FROM datauser WHERE id=${db.escape(req.dataUser.id)};`
        db.query(keepLoginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                })
            }
            if (results.length > 0) {
                let { id, username, email, password, role, status } = results[0]
                let token = createToken({ id, username, email, role, status })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { username, email, role, status, token },
                    error: ""
                })
            } else {
                res.status(200).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    },
    verification: async (req, res) => {
        try {
            console.log("req.dataUser.iduser", req.dataUser.id)
            if (req.dataUser.id) {
                // 1. update status user, yang diawalnya Active menjadi Verify
                await dbQuery(`UPDATE datauser SET status='Verified' WHERE id=${db.escape(req.dataUser.id)};`);
                let login = await dbQuery(`SELECT * FROM datauser WHERE id=${db.escape(req.dataUser.id)};`);
                if (login.length > 0) {
                    let { id, username, email, password, role, status } = login[0];
                    let token = createToken({ id, username, email, role, status });
                    res.status(200).send({
                        success: true,
                        message: "Login Success ✅",
                        dataVerify: { username, email, role, status, token },
                        error: ""
                    })
                }
            } else {
                res.status(401).send({
                    success: false,
                    message: "Verify Failed :x:",
                    dataVerify: {},
                    err: ''
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: true,
                message: "Failed ❌",
                error: errGet
            });
        }
    }
}