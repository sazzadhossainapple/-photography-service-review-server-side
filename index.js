const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASSWORD}@cluster0.kqw4pwk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // database and collection name
    const servicesCollection = client
      .db("FlashPhotographyPoint")
      .collection("services");
    const reviewUserCollection = client
      .db("FlashPhotographyPoint")
      .collection("reviewUser");

    //end point
    app.get("/", (req, res) => {
      res.send({
        status: "success",
        massage: "Flash Photography Point sever in running",
      });
    });

    //services

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send({
        status: "success",
        data: services,
      });
    });

    app.post("/services", async (req, res) => {
      const query = req.body;
      const services = await servicesCollection.insertOne({
        name: query.name,
        image: query.image,
        price: query.price,
        rating: query.rating,
        description: query.description,
      });

      if (services.insertedId) {
        res.send({
          status: "success",
          data: services,
        });
      } else {
        res.send({
          status: "Couldn't create the services",
        });
      }
    });
  } finally {
  }
}

run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`Server is running port: ${port}`);
});
