const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const userController = require("../controller/user_controller");

class middleware{
    auth (req, res, next) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.sendStatus(403);
        }
        try{
            const data = jwt.verify(token, process.env.KEY);
            req.token = data.data;
            return next();
        }
        catch{
            return res.sendStatus(403);
        }
    }
}
const obj = new middleware();

router.post("/user-register", userController.register);
router.post("/user-login", userController.login);

router.post("/timesheet-details" ,obj.auth, userController.addTimesheet);

router.post("/update/:id", obj.auth, userController.update);
router.delete("/delete/:id", obj.auth, userController.delete );

router.get("/get-by-id/:id", obj.auth, userController.getById);
router.get("/get-all-timesheets", userController.allTimesheets);

router.get("/date-filter/:id", obj.auth, userController.dateFilter);

router.get("/week-report/:id",obj.auth, userController.weekReport);
router.get("/month-report/:id",obj.auth, userController.monthReport);

router.get("/week-details/:id",obj.auth, userController.weekDetails);
router.get("/month-details/:id",obj.auth, userController.monthDetails);

router.get("/sort/:id", obj.auth, userController.sort);

module.exports = router;
