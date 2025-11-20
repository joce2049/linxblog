#!/usr/bin/env node

/**
 * Notion 数据库属性检查脚本
 * 用于查看你的数据库实际有哪些属性
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
  process.exit(1);
}

if (!NOTION_DATABASE_ID) {
  console.log('❌ 未设置 NOTION_DATABASE_ID');
  process.exit(1);
}

async function checkDatabaseProperties() {
  try {
    // 动态导入 @notionhq/client
    const { Client } = await import('@notionhq/client');
    
    const notion = new Client({
      auth: NOTION_API_KEY,
    });

    console.log('🔍 正在检查数据库属性...');
    console.log(`📋 数据库ID: ${NOTION_DATABASE_ID}\n`);
    
    // 获取数据库信息
    const response = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    console.log('✅ 数据库连接成功！');
    console.log(`📊 数据库名称: ${response.title[0]?.plain_text || '未命名'}\n`);
    
    // 显示所有属性
    console.log('📋 数据库属性列表：');
    console.log('=' .repeat(50));
    
    const properties = response.properties;
    Object.keys(properties).forEach((key, index) => {
      const prop = properties[key];
      console.log(`${index + 1}. ${key}`);
      console.log(`   类型: ${prop.type}`);
      
      if (prop.type === 'select' && prop.select?.options) {
        console.log(`   选项: ${prop.select.options.map(opt => opt.name).join(', ')}`);
      } else if (prop.type === 'multi_select' && prop.multi_select?.options) {
        console.log(`   选项: ${prop.multi_select.options.map(opt => opt.name).join(', ')}`);
      }
      console.log('');
    });
    
    // 检查必需的属性
    console.log('🔍 检查必需的属性：');
    const requiredProps = {
      'Title': '标题',
      'Description': '描述', 
      'Category': '分类',
      'Tags': '标签',
      'Image': '图片',
      'Views': '浏览量',
      'Likes': '点赞数',
      'Comments': '评论数',
      'Created time': '创建时间',
      'Status': '状态',
      'URL': '链接'
    };
    
    let missingProps = [];
    Object.keys(requiredProps).forEach(propName => {
      if (properties[propName]) {
        console.log(`✅ ${propName} (${requiredProps[propName]})`);
      } else {
        console.log(`❌ ${propName} (${requiredProps[propName]}) - 缺失`);
        missingProps.push(propName);
      }
    });
    
    if (missingProps.length > 0) {
      console.log(`\n⚠️  缺失 ${missingProps.length} 个必需属性`);
      console.log('💡 建议在 Notion 中添加这些属性，或者修改代码中的属性映射');
    } else {
      console.log('\n🎉 所有必需属性都已存在！');
    }
    
    // 显示排序建议
    console.log('\n📝 排序属性建议：');
    if (properties['Created time']) {
      console.log('✅ 可以使用 "Created time" 进行时间排序');
    } else if (properties['Created']) {
      console.log('✅ 可以使用 "Created" 进行时间排序');
    } else {
      console.log('❌ 没有找到创建时间属性，无法进行时间排序');
    }
    
  } catch (error) {
    console.log('❌ 检查失败');
    console.log(`   错误信息: ${error.message}`);
    
    if (error.message.includes('Could not find database')) {
      console.log('\n🔧 解决方案：');
      console.log('   1. 确保数据库 ID 正确');
      console.log('   2. 确保数据库已与集成共享');
      console.log('   3. 检查集成权限设置');
    }
    
    process.exit(1);
  }
}

// 运行检查
checkDatabaseProperties().catch(error => {
  console.error('❌ 检查过程中发生错误:', error.message);
  process.exit(1);
});
