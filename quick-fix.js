#!/usr/bin/env node

/**
 * 快速修复脚本
 * 解决 Notion 集成和 React 组件的问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 LinX Blog - 快速修复脚本');
console.log('================================\n');

// 检查 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env.local 文件');
  console.log('💡 请先运行设置脚本：npm run setup');
  process.exit(1);
}

console.log('✅ 环境变量文件已存在');
console.log('');

// 显示修复步骤
console.log('📋 修复步骤：');
console.log('');

console.log('1. 🔍 检查数据库属性：');
console.log('   npm run check:db');
console.log('');

console.log('2. 🧪 测试 Notion 连接：');
console.log('   npm run test:notion');
console.log('');

console.log('3. 🚀 重启开发服务器：');
console.log('   npm run dev');
console.log('');

console.log('4. 📱 在浏览器中访问：');
console.log('   http://localhost:3000');
console.log('');

// 检查当前状态
console.log('🔍 当前状态检查：');
console.log('');

try {
  // 检查环境变量
  require('dotenv').config({ path: '.env.local' });
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID;
  
  if (apiKey) {
    console.log('✅ NOTION_API_KEY: 已设置');
  } else {
    console.log('❌ NOTION_API_KEY: 未设置');
  }
  
  if (dbId) {
    console.log('✅ NOTION_DATABASE_ID: 已设置');
  } else {
    console.log('❌ NOTION_DATABASE_ID: 未设置');
  }
  
} catch (error) {
  console.log('❌ 环境变量检查失败:', error.message);
}

console.log('');

// 显示常见问题解决方案
console.log('🚨 常见问题解决方案：');
console.log('');

console.log('问题 1: "Could not find sort property with name or id: Created"');
console.log('解决: 数据库属性名称不匹配，运行 npm run check:db 查看实际属性');
console.log('');

console.log('问题 2: "Event handlers cannot be passed to Client Component props"');
console.log('解决: 已修复，使用 ImageWithFallback 组件替代 onError');
console.log('');

console.log('问题 3: 数据库未与集成共享');
console.log('解决: 在 Notion 中将数据库与集成共享，设置权限为 "Can edit"');
console.log('');

console.log('📖 详细说明请查看：');
console.log('   - NOTION_SETUP.md');
console.log('   - TROUBLESHOOTING.md');
console.log('');

console.log('🎯 下一步行动：');
console.log('   1. 运行 npm run check:db 检查数据库属性');
console.log('   2. 根据检查结果调整数据库结构或代码');
console.log('   3. 运行 npm run dev 重启服务');
console.log('   4. 检查浏览器控制台是否还有错误');
console.log('');

console.log('💡 提示：如果问题仍然存在，请分享错误信息，我会继续帮你解决！');
