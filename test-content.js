const { getFullPageContent } = require('./lib/notion-content');
const { getDatabase } = require('./lib/notion');

async function test() {
    console.log('Fetching articles...');
    const articles = await getDatabase();
    if (articles.length === 0) {
        console.log('No articles found.');
        return;
    }

    const article = articles[0];
    console.log(`Testing content fetch for article: ${article.title} (${article.id})`);

    const content = await getFullPageContent(article.id);
    console.log('Content result:', JSON.stringify(content, null, 2));
}

test().catch(console.error);
