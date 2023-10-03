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
export const lambdaHandler = async (event, context) => {
    let browser=null;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: true,
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(event.url);
        const title=await page.title();
        // const buffer=await page.pdf({
        //     printBackground: true,
        //     format: 'A4',
        // })
        // const s3result = await aws.S3
        //     .upload({
        //         Bucket: 'mydata-for-me',
        //         Key: `${Date.now()}.png`,
        //         Body: buffer,
        //         ContentType: 'image/png',
        //         ACL: 'public-read'
        //         })
        //         .promise()

        // console.log('S3 image URL:', s3result.Location) 
        // await page.screenshot({
        //     path: "first.png",
        //     encoding: 'base64'
        // })
        await browser.close();
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                Title: title
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
