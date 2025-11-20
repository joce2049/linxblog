#!/usr/bin/env node

/**
 * 测试脚本：验证 notion-content.js 中的间距设置
 */

const fs = require('fs');
const path = require('path');

const contentFile = path.join(__dirname, '../lib/notion-content.js');
const content = fs.readFileSync(contentFile, 'utf-8');

console.log('📊 检查 notion-content.js 中的间距设置\n');

// 检查段落间距
const paragraphMatches = content.match(/class="mb-\d+[^"]*"/g) || [];
console.log('✅ 段落间距 (mb-*)：');
paragraphMatches.forEach(match => console.log(`   ${match}`));

// 检查大型元素间距
const myMatches = content.match(/class="my-\d+[^"]*"/g) || [];
console.log('\n✅ 大型元素间距 (my-*)：');
myMatches.forEach(match => console.log(`   ${match}`));

// 统计
console.log('\n📈 间距统计：');
console.log(`   mb-4: ${content.match(/mb-4/g)?.length || 0} 次`);
console.log(`   mb-6: ${content.match(/mb-6/g)?.length || 0} 次`);
console.log(`   mb-8: ${content.match(/mb-8/g)?.length || 0} 次`);
console.log(`   my-4: ${content.match(/my-4/g)?.length || 0} 次`);
console.log(`   my-6: ${content.match(/my-6/g)?.length || 0} 次`);
console.log(`   my-8: ${content.match(/my-8/g)?.length || 0} 次`);
console.log(`   my-10: ${content.match(/my-10/g)?.length || 0} 次`);

console.log('\n✨ 检查完成！\n');
