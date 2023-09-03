require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
const data = require('./Data/DummyData.js')



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const database = await client.db('airbnb')
    const categoryCollection = await database.collection('categoryCollection')

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get(('/allData'), async (req, res) => {
      const result= await categoryCollection.find({}).toArray()
      res.send(result);
    })

    app.get(('/singleData/:id'), async (req, res) => {
      const id = req.params?.id
      const result= await categoryCollection.findOne({_id: new ObjectId(id)})
      res.send(result);
    })

    app.get('/get-category', async (req, res) => {
      const distinctCategories = await categoryCollection
        .aggregate([
          { $group: { _id: null, categories: { $addToSet: '$category' } } },
          { $project: { _id: 0, categories: 1 } },
        ])
        .toArray();

      if (distinctCategories.length > 0) {
        res.send(distinctCategories[0].categories.sort());
      } else {
        res.send({ message: 'No distinct categories found!' });
      }
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
