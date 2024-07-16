const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const nodemailer = require("nodemailer");
const { ObjectId } = require('mongodb');
const axios = require('axios');

//model import
const { StudentModel } = require("../models/student.model");

//middleware import
const { isAuthenticated } = require("../middlewares/authenticate");

//gel all students data
router.get("/all", async (req, res) => {
    try {
        const students = await StudentModel.find();
        res.send({ message: "All students data", students });
    } catch (error) {
        res.status(400).send({ message: "Something went wrong" });
    }
});
router.get("/studentsdata", async (req, res) => {
    // console.log()
    const students = await StudentModel.find();
    res.send(students);
    // return res.json(students);
    // return res.json(await StudentModel.find());
});
// register new students
router.post("/register",  async (req, res) => {
    const { name, email, password } = req.body.data;
    try {
        let user = await StudentModel.find({ email });
        if (user.length > 0) {
            return res.send({ msg: "User already registered" });
        }
        bcrypt.hash(
            password,
            +process.env.Salt_rounds,
            async (err, secure_password) => {
                if (err) {
                    console.log(err);
                } else {
                    const student = new StudentModel({
                        name,
                        email,
                        class: req.body.data.class,
                        password: secure_password,
                    });
                    await student.save();
                    let newStudent = await StudentModel.find({ email });

                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "agrawaljoy1@gmail.com",
                            pass: "nsziioprjzwcodlm",
                        },
                    });

                    // const mailOptions = {
                    //   from: "agrawaljoy1@gmail.com",
                    //   to: email,
                    //   subject: "Account ID and Password",
                    //   text: `Welcome to LMS, Congratulations,Your account has been created successfully.This is your User type : Student and Password : ${password}  `,
                    // };

                    // transporter.sendMail(mailOptions, (error, info) => {
                    //   if (error) {
                    //     return res.send({ msg: "error" });
                    //   }
                    //   res.send({ msg: "Password sent" });
                    // });

                    res.send({
                        msg: "Student Registered Successfully",
                        student: newStudent[0],
                    });
                }
            }
        );
    } catch (err) {
        res.status(404).send({ msg: "Student Registration failed" });
    }
});

//student login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const student = await StudentModel.find({ email });
        if (student.length > 0) {
            if (student[0].access == "false") {
                return res.send({ message: "Access Denied" });
            }
            // bcrypt.compare(password, student[0].password, (err, results) => {
            // if (results) {
            let token = jwt.sign(
                { email, name: student[0].name, id: student[0]._id },
                process.env.secret_key,
                { expiresIn: "7d" }
            );
            res.send({
                message: "Login Successful",
                user: student[0],
                token,
            });
        } else {
            res.status(201).send({ message: "Wrong credentials" });
        }
        // }
        // );
        // } else {
        //   res.send({ message: "Wrong credentials" });
        // }
    } catch (error) {
        res.status(404).send({ message: "Error" });
    }
});

//edit student
router.patch("/:studentId", isAuthenticated, async (req, res) => {
    const { studentId } = req.params;
    const payload = req.body.data;
    try {
        const student = await StudentModel.findByIdAndUpdate(
            { _id: studentId },
            payload
        );
        const updatedStudent = await StudentModel.find({ _id: studentId });
        res
            .status(200)
            .send({ msg: "Updated Student", student: updatedStudent[0] });
    } catch (error) {
        res.status(404).send({ msg: "Error" });
    }
});

router.get("/:studentId", async (req, res) => {
    const { studentId } = req.params;
    console.log(studentId);
    try {
        const student = await StudentModel.find();
        // res.json(student)
        for (let i = 0; i < student.length; i++) {
            console.log(student[i]._id.toString() === studentId.toString())
            if (student[i]._id.toString() === studentId.toString()) {
                console.log(student[i]);
                // You may want to send the found student as a response
                return res.json(student[i]);
            }
        }
        // console.log("fuck you");
    } catch (error) {
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

router.delete("/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await StudentModel.findByIdAndDelete({ _id: studentId });
        res.status(200).send({ msg: "Deleted Student" });
    } catch (error) {
        res.status(400).send({ msg: "Error" });
    }
});

router.post("/getDetails", async (req, res) => {
    const id = req.body;
    console.log(id);
    try {
        const studentDetails = StudentModel.findOne({ _id: id });
        return res.send(studentDetails);
    } catch (err) {
        res.status(400).send({ msg: "Error" });
    }
})

router.post("/getImages", async (req, res) => {
    const { api } = req.body;
    console.log(api);
    let images = "";
    try {
        const response = await axios.get(api);

        const originalImages = response.data.images_results.map(image => image.original);
        return res.status(200).send({ images: originalImages });
    } catch (error) {
        console.error('Error:', error.message);
    }
    return res.send({ msg: "Images" });
})

router.post("/getVideos", async (req, res) => {
    const { api } = req.body;
    console.log(api);
    try {
        const response = await axios.get(api);
        console.log(response.data);
        // const originalImages = response.data.images_results.map(image => image.original);
        return res.status(200).send(response.data.items.map(item => item.id.videoId));
    } catch (error) {
        console.error('Error:', error.message);
    }
    // return res.send({ msg: "Images" });
})

module.exports = router;
