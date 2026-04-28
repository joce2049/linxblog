const { Client } = require('@notionhq/client');
require("dotenv").config({ path: ".env.local" });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
    console.error("错误：未设置 NOTION_API_KEY 环境变量");
    process.exit(1);
}

if (!DATABASE_ID) {
    console.error("错误：未设置 NOTION_DATABASE_ID 环境变量");
    process.exit(1);
}

const notion = new Client({
    auth: NOTION_API_KEY,
});

async function checkImages() {
    try {
        console.log("Fetching database...");
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            page_size: 5,
        });

        console.log(`Fetched ${response.results.length} pages.`);

        for (const page of response.results) {
            const props = page.properties;
            const title = props['标题']?.title?.[0]?.plain_text || "No Title";

            // Check '封面' property (which is mapped to 'image' in config)
            const coverProp = props['封面'];
            let imageUrl = null;

            if (coverProp?.files?.length > 0) {
                const fileObj = coverProp.files[0];
                if (fileObj.type === 'file') {
                    imageUrl = fileObj.file.url;
                    console.log(`[${title}] Image Type: FILE (Temporary)`);
                } else if (fileObj.type === 'external') {
                    imageUrl = fileObj.external.url;
                    console.log(`[${title}] Image Type: EXTERNAL`);
                }
            }

            if (imageUrl) {
                console.log(`[${title}] URL: ${imageUrl}`);
                // Try to fetch the image head
                try {
                    const res = await fetch(imageUrl, { method: 'HEAD' });
                    console.log(`[${title}] Status: ${res.status}`);
                    if (res.status !== 200) {
                        console.log(`[${title}] Headers:`, res.headers);
                    }
                } catch (e) {
                    console.log(`[${title}] Fetch Error: ${e.message}`);
                }
            } else {
                console.log(`[${title}] No image found.`);
            }
            console.log('---');
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkImages();
