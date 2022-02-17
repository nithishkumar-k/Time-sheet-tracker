const mongoose = require("mongoose")

const schema = mongoose.Schema;

const userSchma = new schema({ 
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const user = mongoose.model("User", userSchma);
module.exports = user;