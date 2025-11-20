#!/usr/bin/env node

/**
 * Notion API 连接测试脚本
 * 用于验证你的 Notion 集成配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 检查 .env.local 文件是否存在
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env.local 文件');
  console.log('💡 请先运行设置脚本：npm run setup');
  process.exit(1);
}

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

// 检查必需的环境变量
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.log('❌ 未设置 NOTION_API_KEY');
  console.log('💡 请在 .env.local 文件中设置你的 Notion API 密钥');
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.log('❌ 未设置 NOTION_DATABASE_ID');
  console.log('💡 请在 .env.local 文件中设置你的 Notion 数据库 ID');
  process.exit(1);
}

// 验证 API 密钥格式
if (!NOTION_API_KEY.startsWith('secret_')) {
  console.log('❌ API 密钥格式错误');
  console.log('💡 API 密钥必须以 "secret_" 开头');
  process.exit(1);
}

console.log('🔍 配置检查完成');
console.log(`   API 密钥: ${NOTION_API_KEY.substring(0, 10)}...`);
console.log(`   数据库 ID: ${NOTION_DATABASE_ID}`);
console.log('');

// 测试 Notion API 连接
async function testNotionConnection() {
  try {
    // 动态导入 @notionhq/client
    const { Client } = await import('@notionhq/client');
    
    const notion = new Client({
      auth: NOTION_API_KEY,
    });

    console.log('🔄 正在测试 Notion API 连接...');
    
    // 测试数据库访问
    const response = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    console.log('✅ 连接成功！');
    console.log('📊 数据库信息：');
    console.log(`   名称: ${response.title[0]?.plain_text || '未命名'}`);
    console.log(`   ID: ${response.id}`);
    console.log(`   类型: ${response.object}`);
    console.log(`   创建时间: ${new Date(response.created_time).toLocaleString()}`);
    
    // 测试查询数据库
    console.log('\n🔄 正在测试数据库查询...');
    const queryResponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 5,
    });

    console.log('✅ 查询成功！');
    console.log(`📝 找到 ${queryResponse.results.length} 条记录`);
    
    if (queryResponse.results.length > 0) {
      console.log('\n📋 前几条记录：');
      queryResponse.results.slice(0, 3).forEach((page, index) => {
        const title = page.properties.Title?.title?.[0]?.plain_text || '无标题';
        console.log(`   ${index + 1}. ${title}`);
      });
    }

    console.log('\n🎉 所有测试通过！你的 Notion 集成配置正确。');
    console.log('💡 现在可以重启开发服务器：npm run dev');
    
  } catch (error) {
    console.log('❌ 连接失败');
    console.log(`   错误信息: ${error.message}`);
    
    if (error.message.includes('Could not find database')) {
      console.log('\n🔧 解决方案：');
      console.log('   1. 确保数据库 ID 正确');
      console.log('   2. 确保数据库已与集成共享');
      console.log('   3. 检查集成权限设置');
      console.log('\n📖 详细步骤请查看：NOTION_SETUP.md');
    } else if (error.message.includes('Unauthorized')) {
      console.log('\n🔧 解决方案：');
      console.log('   1. 检查 API 密钥是否正确');
      console.log('   2. 确认集成是否仍然有效');
      console.log('   3. 重新生成 API 密钥');
    } else {
      console.log('\n🔧 请检查：');
      console.log('   1. 网络连接是否正常');
      console.log('   2. Notion 服务是否可用');
      console.log('   3. 集成配置是否正确');
    }
    
    process.exit(1);
  }
}

// 运行测试
testNotionConnection().catch(error => {
  console.error('❌ 测试过程中发生错误:', error.message);
  process.exit(1);
});
