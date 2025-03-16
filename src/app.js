const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const authController = require("./auth/auth.controller")
app.use("/api/auth", authController)

const userController = require ("./user/user.controller")
app.use("/api/user", userController)

const readingController = require("./readingProgress/readingProgress.controller")
app.use("/api/reading", readingController)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// export default app;