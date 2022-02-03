const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
const { db } = require('./config/database')
const bearerToken = require('express-bearer-token')
dotenv.config();

const PORT = process.env.PORT;
app.use(cors())
app.use(express.json())
app.use(bearerToken())

db.getConnection((err, connection) => {
    if (err) {
        console.log(`Error MySQL Connection : `, err.message)
    }
    console.log(`Connected to MySQL Server : ${connection.threadId}`)
})

app.get('/', (req, res) => res.status(200).send("<h2>Welcome to library api</h2>"));

const { usersRoute, productsRoute } = require('./routes');
app.use('/datauser', usersRoute);
app.use('/books', productsRoute);

app.listen(PORT, () => console.log('Ecommerce API Ready! : ', PORT))