const mongoose =  require("mongoose");

const schema = mongoose.Schema;

const timesheetSchema = new schema({
    name:{
        type: String
    },
    type:{
        type: String
    },
    entryDate:{
        type: Date
    },
    hours:{
        type: Number
    },
    notes:{
        type: String
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
    }
})

const saveTimeSchema = mongoose.model("Timesheet", timesheetSchema);
module.exports = saveTimeSchema;