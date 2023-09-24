'use strict'
const Database = require('../../database/connection.js');
const db = new Database();
const ULID = require('ulid');
const sharp = require('sharp');
const aws = require('aws-sdk');

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
});

const uploadMetaDataDB = async (key, userId) => {
    db.insert('photos', ["key", "user_id"], [key, userId])
        .catch((err) => {
            console.err(err.message)
        })
}

const uploadFileS3 = async (fileName, fileData, callback) => {
    s3.upload({
        Bucket: 'labb-photos',
        Key: fileName,
        Body: fileData
    }, (error, data) => {
        if (error) throw error;
        callback();
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

exports.upload = async function(req, res) {
    if (!req.files) return res.status(400).send("File not found");
    const {image} = req.files;
    if (!image || image.mimetype != 'image/png') return res.status(400).send("Wrong image format");

    let imageBuffer = Buffer.from(image.data, 'binary');
    let resizedImageBuffer = await resizeImage(imageBuffer);
    let key = ULID.ulid();
    uploadFileS3(`${key}.png`, resizedImageBuffer, () => uploadMetaDataDB(key, req.session.user.id));

    res.sendStatus(200);
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
            if (req.session.user.stage_01 === true && req.session.user.stage_02 === true && req.session.user.stage_03 === true ) {
                res.redirect(`/reward`);
            } else {
                res.redirect(`/`);
            }
        } else {
            res.status(404).send("Server error");
        }
    } else {
        res.status(500).send("Server error");
    }   
}

