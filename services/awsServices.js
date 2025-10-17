const AWS = require('aws-sdk');

exports.uploadToS3 = async (data, filename) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3 = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'// makes the file publicly readable
    };

    try {
        const response = await s3.upload(params).promise();// Use promise to handle the upload asynchronously
        return response.Location; // Return the URL of the uploaded file
    } catch (error) {
        throw new Error(`Error uploading to S3: ${error.message}`);
    }
}