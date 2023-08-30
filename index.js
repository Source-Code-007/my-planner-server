require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const verifyJWT = require('./Middleware/verifyJWT')
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iw4kl2c.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const database = await client.db('my-planner')
    const tasksCollection = await database.collection('tasks-collection')

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get(('/'), (req, res) => {
      res.send('Homepage of My planner server');
    })

    // create jwt
    app.post(('/create-jwt'), (req, res) => {
      const { email } = req.query
      const result = jwt.sign({
        email: email
      }, process.env.JWT_SECRET);
      res.send({ result })
    })

    // add tasks
    app.post(('/insert-tasks'), verifyJWT, async (req, res) => {
      const task =  req?.body
      const result = await tasksCollection.insertOne(task)
      res.send(result)
    })

    // get my tasks
    app.get('/get-tasks', async (req, res) => {
      const email = req.query?.email
      const tasks = await tasksCollection.find({user: email}).toArray()
      res.send(tasks)
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
  console.log('My planner server running!');
})
