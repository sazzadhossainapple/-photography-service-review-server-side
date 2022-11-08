const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(size).toArray();

      res.send({
        status: "success",
        data: services,
      });
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const services = await servicesCollection.findOne(query);

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

    // review user

    app.get("/allUserReview", async (req, res) => {
      let query = {};

      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId,
        };
      }

      const date = { date: -1 };
      const cursor = reviewUserCollection.find(query).sort(date);
      const userReview = await cursor.toArray();
      res.send({
        status: "success",
        data: userReview,
      });
    });

    app.get("/myReview", async (req, res) => {
      const email = req.query.email;
      // const serviceId = req.query.serviceId;
      let query = {};
      if (email) {
        query = {
          email: email,
          // serviceId: serviceId,
        };
      }
      const date = { date: -1 };
      const cursor = reviewUserCollection.find(query).sort(date);
      const myReview = await cursor.toArray();
      res.send({
        status: "success",
        data: myReview,
      });
    });

    app.post("/userReview", async (req, res) => {
      const query = req.body;
      const date = { date: new Date() };
      const userReview = await reviewUserCollection.insertOne({
        serviceId: query.serviceId,
        serviceTitle: query.serviceTitle,
        reviewMassage: query.reviewMassage,
        userName: query.userName,
        email: query.email,
        userImage: query.userImage,
        date: date.date,
      });

      if (userReview.insertedId) {
        res.send({
          status: "success",
          data: userReview,
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
