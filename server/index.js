require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());

const URI = process.env.DB_URI;
mongoose.connect(URI, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});

const userRoutes = require("./api/user");
const teamRoutes = require("./api/team");

app.use("/api/user", userRoutes);
app.use("/api/team", teamRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
