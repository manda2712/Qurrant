const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const adminAuthorization = require("./middleware/adminAuthorization");

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const authController = require("./auth/auth.controller")
app.use("/api/auth", authController)

const userController = require ("./user/user.controller")
app.use("/api/user", userController)

const readingController = require("./readingProgress/readingProgress.controller")
app.use("/api/reading", readingController)

// module.exports = app;