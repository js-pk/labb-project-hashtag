'use strict'
const fileUpload = require('express-fileupload');
const Database = require('../../database/connection.js');
const db = new Database();
const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
})

const uploadFileS3 = (fileName, fileData) => {
    s3.upload({
        Bucket: 'labb-photos',
        Key: fileName,
        Body: fileData
    }, (error, data) => {
        if (error) throw error;
        // console.log(data.Location);
    })
}

const authorize = function(req) {
    return req.session.user
}

exports.run = function(req, res, next) {
    const stageNo = req.params.stageNo || "01";
    const user = req.session.user;
    if (["01", "02", "03"].includes(stageNo)) {
        if (authorize(req)) {
            res.render(`games/${stageNo}`, {
                email: user.email
            })
        } else {
            res.redirect("/")
        }
    }
}

exports.upload = function(req, res) {
    const {image} = req.files;
    if (!image) return res.sendStatus(400);
    // If does not have image mime type prevent from uploading
    if (image.mimetype != 'image/png') return res.sendStatus(400);
    image.mv(__dirname + '/../../public/images/upload/' + image.name);

    res.sendStatus(200);
}

exports.uploadS3 = function(req, res) {
    const {image} = req.files;
    if (!image) return res.sendStatus(400);
    if (image.mimetype != 'image/png') return res.sendStatus(400);
    //TODO: get image blob, uploadFileS3(filename, filedata)
}


exports.complete = function(req, res, next) {
    if (authorize(req)) {
        const stageNo= req.params.stageNo;
        if (["01", "02", "03"].includes(stageNo)) {
            const stageString = `stage_${stageNo}`;
            db.update("users", `${stageString}=?`, "id=?", [1, req.session.user.id]);
            // update session and redirect to next game
            req.session.user[stageString] = true;
            if (["01", "02"].includes(stageNo)) {
                res.redirect(`/game/0${Number(stageNo)+1}`);
            } else if (stageNo === "03") {
                res.redirect('/');
            }
        } else {
            res.status(404).send("Server error");
        }
    } else {
        res.status(500).send("Server error");
    }   
}