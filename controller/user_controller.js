const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const ObjectId = mongoose.Types.ObjectId;

const User = require("../models/user_schema");
const Timesheet = require("../models/timesheet_schema");
const router = require("../router/user_router");

exports.register = async (req, res) =>{
    try{
        if(!req.body.name || !req.body.email || !req.body.password)
        {
            return res.status(400).json({
                code : "400",
                message : "All fields are should fill properly"
            })
        }
        const existMail = await User.findOne({email : req.body.email});
        if(existMail){
            return res.status(409).json({
                code : "409",
                message : "Provide a unique mail"
            })
        }
        const encrptPassword = bcrypt.hashSync(req.body.password, salt);
        const addUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: encrptPassword
        })
        const user = await addUser.save();
        return res.status(201).json({
            status:"Success",
            user
        })
    }
    catch(e){
        return res.status(500).send(e.stack);
    }
}

exports.login = async (req, res)=>{
    try{
        const checkUser = await User.findOne({email: req.body.email});
        if(checkUser){
            const checkPassword = bcrypt.compareSync(req.body.password, checkUser.password);
            if(checkPassword){
                const jwtToken = jwt.sign({data:checkUser._id}, process.env.KEY, {expiresIn: "10hr"});
                res.cookie("access_token", jwtToken, {
                    httpOnly: true,
                  });
                res.status(200).json({
                    status:"success"
                })
            }
            else{
                return res.status(401).json({
                    code: "401",
                    message: "Invalid password"
                })
            }
        }
        else{
            return res.status(401).json({
                code: "401",
                message: "User does not exist"
            })
        }
    }
    catch(e){
        return res.status(500).send(e.stack);
    }
}

exports.addTimesheet = async (req, res)=>{
    try{
        const id = req.token;
        const timeSheet = new Timesheet({
            name : req.body.name,
            type : req.body.type,
            entryDate : req.body.entryDate,
            hours : req.body.hours,
            notes : req.body.notes,
            user : id
        })
        const save = await timeSheet.save();
        return res.status(201).json({
            status:"Success",
            save
        })
    }
    catch(e){
        return res.status(500).send(e.stack);
    }
}

exports.update = async (req, res)=>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        const result = await User.findByIdAndUpdate(req.params.id,req.body,{new: true});
        return res.status(200).json({
            ststus: "success",
            result
        });
        
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.delete = async (req, res)=>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        await User.findByIdAndDelete(req.params.id);
        await Timesheet.deleteMany({user:req.params.id})
        return res.send(200).json({
            status: "success",
            message: "successfully deleted"
        })
    }
    catch(e){
        return res.status(500).send(e.stack)
    }
}

exports.allTimesheets = async (req, res)=>{
    try{
        Timesheet.find().populate("user")
        .then(data =>
            res.status(200).json({
                ststus:"success",
                data
            })
        )
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.getById = async (req, res) =>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        Timesheet.find({user: req.params.id}).populate("user")
        .then(data =>
            res.status(200).send(data)
        )
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.dateFilter = async (req, res)=>{        
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        let date = new Date(req.query.date);
        const filter = await Timesheet.aggregate([
            {
                $lookup:{
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as:"details"
                }
            },
            {
                $match: {
                    user: ObjectId( req.params.id),
                    entryDate: date
                }
            },  
        ])
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.weekReport = async (req, res)=>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        const filter = await Timesheet.aggregate([
            {
                $match:{
                    user: ObjectId( req.params.id)
                }
            },
            {
                $group:{
                    _id:{$week:"$entryDate"},
                    averageWorkingHours :{$avg: "$hours"},
                }
            },
            
        ])
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.monthReport = async (req, res)=>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        const filter = await Timesheet.aggregate([
            {
                $match:{
                    user: ObjectId(req.params.id)
                }
            },
            {
                $group:{
                    _id:{$month:"$entryDate"},
                    averageWorkingHours :{$avg: "$hours"},
                }
            }
        ])
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.staus(500).send(e.stack);
    }
}

exports.weekDetails = async (req, res)=>{        
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        const filter = await Timesheet.aggregate([
            {
                $addFields:{
                    "week": {$week: '$entryDate'}
                }
                
            },
            {
                $lookup:{
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as:"details"
                }
            },
            {
                $match: {
                    user: ObjectId( req.params.id),
                    week: parseInt(req.query.week)
                }
            } 
        ])
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.monthDetails = async (req, res)=>{        
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        const filter = await Timesheet.aggregate([
            {
                $addFields:{
                    "month": {$month: '$entryDate'}
                }
                
            },
            {
                $lookup:{
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as:"details"
                }
            },
            {
                $match: {
                    user: ObjectId( req.params.id),
                    month: parseInt(req.query.month)
                }
            } 
        ])
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}

exports.sort = async (req, res)=>{
    try{
        if(req.token !== req.params.id){
            return res.status(401).json({
                code: "401",
                message: "Enter correct id"
            })
        }
        let sortBy='';
        if(req.query.sort){
            sortBy = req.query.sort.split(',').join(' ');
        }
        else{
            return res.status(400).json({
                code: "400",
                message: "Enter a sortvalue"
            })
        }
        const filter = await Timesheet.find({user: ObjectId(req.params.id)}).sort(sortBy).populate("user");
        return res.status(200).json({
            status: "success",
            filter
        })
    }
    catch(e){
        res.status(500).send(e.stack);
    }
}