'use strict'
const Database = require('../../database/connection.js');
const db = new Database();

const aws = require('aws-sdk');
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
});

const sharp = require('sharp');

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

const resizeImage = async (buffer) => {
    //TODO: should handle error
    return await sharp(buffer)
        .resize({
            width: 1200,
            fit: 'outside'
        })
        .toBuffer()
}

const resizeImageToFile = (buffer) => {
    sharp(buffer)
        .resize({
            width: 1200,
            fit: 'outside'
        })
        .toFile(__dirname + '/../../public/images/upload/test.png',
            (err, info) => {

            }
        )
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

// exports.upload = function(req, res) {
//     const {image} = req.files;
//     if (!image) return res.sendStatus(400);
//     // If does not have image mime type prevent from uploading
//     if (image.mimetype != 'image/png') return res.sendStatus(400);
//     image.mv(__dirname + '/../../public/images/upload/' + image.name);

//     res.sendStatus(200);
// }

exports.upload = async function(req, res) {
    if (!req.files) return res.status(400).send("File not found");

    const {image} = req.files;
    if (!image || image.mimetype != 'image/png') return res.status(400).send("Wrong image format");

    let imageBuffer = Buffer.from(image.data, 'binary');
    let resizedImageBuffer = await resizeImage(imageBuffer);
    uploadFileS3("buffer.png", resizedImageBuffer);

    res.sendStatus(200);
    //TODO: should I update this to DB?
    //TODO: prevent double clicking upload button.
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