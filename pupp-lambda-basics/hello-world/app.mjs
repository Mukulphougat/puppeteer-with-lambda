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
import chromium from "@sparticuz/chromium";
import AWS from "aws-sdk"
export const lambdaHandler = async (event, context) => {
    try {
        // const body=JSON.parse(event.body);  
        // console.log('S3 image URL:', s3result.Location) 
        // await page.screenshot({
        //     path: "first.png",
        //     encoding: 'base64'
        // })
        // await browser.close();
        const s3 = new AWS.S3({
            accessKeyId: "",
            secretKeyId: ""
        });
        const browser = await puppeteer.launch({
            args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(String(event.url));
        const title=await page.title();
        const buffer=await page.screenshot({
            fullPage: true 
        })
        const bucket_name="mydata-for-me"        
        const s3result=await s3.upload(
            {
                Bucket: bucket_name,
                Key: `${title}.png`,
                Body: buffer,
                ContentType: 'image/png',
                ACL: "public-read"
            }
        ).promise()
                
        browser.close();
        return {
            'statusCode': 200,
            'body': {
                Title: title,
                S3Result: s3result.Location
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal Server Error'
            }),
        };
    }
};
