const express = require("express");
const app = express();
app.use(express.json());

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const userRouter = require("./router/user_router");

mongoose.connect(process.env.URI, ()=>{
    console.log("DB connected");
})

app.use("/api", userRouter);

app.use("*", (req, res)=>{
    res.status(404).json({
        code: "404",
        Message: "Page not found"
    })
});

app.listen(5000, ()=>{
    console.log("server running on port 5000");
})