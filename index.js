const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: "unauthorized access",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({
        message: "Forbidden access",
      });
    }

    req.decoded = decoded;
    next();
  });
}

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

    //start
    app.get("/", (req, res) => {
      res.send({
        status: "success",
        massage: "Flash Photography Point sever in running",
      });
    });

    //jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    //services

    // get all services
    app.get("/homeServices", async (req, res) => {
      const query = {};
      const date = { date: -1 };

      const cursor = servicesCollection.find(query).limit(3).sort(date);
      const services = await cursor.toArray();

      res.send({
        status: "success",
        data: services,
      });
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const date = { date: -1 };

      const cursor = servicesCollection.find(query).sort(date);
      const services = await cursor.toArray();

      res.send({
        status: "success",
        data: services,
      });
    });

    // single service get by id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const services = await servicesCollection.findOne(query);

      res.send({
        status: "success",
        data: services,
      });
    });

    // services added post
    app.post("/services", async (req, res) => {
      const query = req.body;
      const date = { date: new Date() };
      const services = await servicesCollection.insertOne({
        name: query.name,
        image: query.image,
        price: query.price,
        description: query.description,
        date: date.date,
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

    // get all user review
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

    // only single user review get all
    app.get("/myReview", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded;

      if (decoded.email !== email) {
        res.status(403).send({
          message: "Forbidden access",
        });
      }

      let query = {};
      if (email) {
        query = {
          email: email,
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

    // only single user review get by id
    app.get("/myReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const reviewUseer = await reviewUserCollection.findOne(query);

      res.send({
        status: "success",
        data: reviewUseer,
      });
    });

    // all user review added
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

    // review delete by id
    app.delete("/myReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const userReview = reviewUserCollection.deleteOne(query);
      res.send({
        status: "success",
        data: userReview,
      });
    });

    // review updated by id
    app.patch("/myReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const reviewUser = req.body;
      const updatedReview = {
        $set: {
          serviceTitle: reviewUser.serviceTitle,
          reviewMassage: reviewUser.reviewMassage,
          email: reviewUser.email,
        },
      };

      const updateReviewUser = await reviewUserCollection.updateOne(
        query,
        updatedReview
      );
      res.send({
        status: "success",
        data: updateReviewUser,
      });
    });
  } finally {
  }
}

run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`Server is running port: ${port}`);
});
