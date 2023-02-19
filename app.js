const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const User = require("./user");
const producer = require("./producer");

mongoose.connect(config.mongo.uri);

const app = express();
app.use(express.json());

app.post("/users", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  await user.save();
  const event = {
    type: "user_created",
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  };
  await producer.publishEvent(event, config.rabbitmq.priority.write);

  res.json(user);
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });

  const event = {
    type: "user_read",
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  };
  await producer.publishEvent(event, config.rabbitmq.priority.read);

  res.json(user);
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.password = req.body.password || user.password;
  await user.save();

  const event = {
    type: "user_updated",
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  };
  await producer.publishEvent(event, config.rabbitmq.priority.update);

  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  await user.remove();

  const event = {
    type: "user_deleted",
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  };
  await producer.publishEvent(event, config.rabbitmq.priority.write);

  res.json(user);
});

app.listen(3000, () => {
  console.log("Started");
});
