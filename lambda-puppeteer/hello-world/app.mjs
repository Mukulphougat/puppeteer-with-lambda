/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";
import AWS from "aws-sdk"
export const lambdaHandler = async (event, context) => {
    let browser=null;
    try {
        const s3 = new AWS.S3({
            accessKeyId: "AKIA2FJ6CWHQOBB4F6GZ",
            secretAccessKey: "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",
        });
        const bucket_name="mydata-for-me"
        const body=JSON.parse(event.body);
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(body.url, { waitUntil: 'networkidle0' });
        const title=await page.title();
        const buffer=await page.screenshot({
            fullPage: true 
        })
        const s3result = await s3
            .upload({
                Bucket: bucket_name,
                Key: `${Date.now()}.png`,
                Body: buffer,
                ContentType: 'image/png'
                })
                .promise()
                    //
        // console.log('S3 image URL:', s3result.Location) 
        // await page.screenshot({
        //     path: "first.png",
        //     encoding: 'base64'
        // })
        await browser.close();
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                Title: title,
                Image_URL: s3result.Location
            })
        }
    } catch (err) {
        if (browser !== null) {
            await browser.close();
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    } 
};
