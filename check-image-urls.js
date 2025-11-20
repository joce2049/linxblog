
const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

async function checkImages() {
    const databaseId = process.env.NOTION_DATABASE_ID;

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 5,
        });

        console.log("Checking first 5 items for images:");

        for (const page of response.results) {
            const props = page.properties;
            // Assuming 'image' is the property name based on lib/notion.js
            // We need to find the correct property name if it's not 'image'
            // Let's look for any file property

            let imageUrl = null;
            let propertyName = "";

            for (const [key, value] of Object.entries(props)) {
                if (value.type === "files" && value.files.length > 0) {
                    propertyName = key;
                    imageUrl = value.files[0].file?.url || value.files[0].external?.url;
                    break;
                }
            }

            console.log(`\nPage ID: ${page.id}`);
            if (imageUrl) {
                console.log(`  Property: ${propertyName}`);
                console.log(`  URL: ${imageUrl}`);
                if (imageUrl.includes("X-Amz-Expires")) {
                    const urlObj = new URL(imageUrl);
                    const expires = urlObj.searchParams.get("X-Amz-Expires");
                    const date = urlObj.searchParams.get("X-Amz-Date");
                    console.log(`  AWS Signed URL detected.`);
                    console.log(`  Expires in: ${expires} seconds`);
                    console.log(`  Date: ${date}`);
                } else {
                    console.log("  Type: External/Other (Not AWS Signed)");
                }
            } else {
                console.log("  No image found.");
            }
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkImages();
