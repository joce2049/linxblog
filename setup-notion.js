#!/usr/bin/env node

/**
 * Notion 环境变量设置助手
 * 这个脚本帮助你快速配置 Notion API 环境变量
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 LinX Blog - Notion 集成设置助手');
console.log('=====================================\n');

// 检查是否已存在 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  发现已存在的 .env.local 文件');
  rl.question('是否要覆盖现有配置？(y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      startSetup();
    } else {
      console.log('❌ 设置已取消');
      rl.close();
    }
  });
} else {
  startSetup();
}

function startSetup() {
  console.log('\n📋 请按提示输入你的 Notion 配置信息\n');
  
  rl.question('🔑 请输入你的 Notion API 密钥 (以 secret_ 开头): ', (apiKey) => {
    if (!apiKey.startsWith('secret_')) {
      console.log('❌ API 密钥格式错误！必须以 "secret_" 开头');
      rl.close();
      return;
    }
    
    rl.question('🆔 请输入你的 Notion 数据库 ID: ', (databaseId) => {
      if (!databaseId || databaseId.length < 20) {
        console.log('❌ 数据库 ID 格式错误！请检查是否正确');
        rl.close();
        return;
      }
      
      // 创建环境变量内容
      const envContent = `# Notion API 配置
# 自动生成于 ${new Date().toISOString()}

# Notion 集成 API 密钥
NOTION_API_KEY=${apiKey}

# Notion 数据库 ID
NOTION_DATABASE_ID=${databaseId}

# 配置说明：
# 1. 确保你的 Notion 数据库已与集成共享
# 2. 重启开发服务器以应用新配置
# 3. 检查控制台日志确认连接状态
`;
      
      try {
        // 写入 .env.local 文件
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ 环境变量配置成功！');
        console.log('📁 配置文件已保存到: .env.local');
        console.log('\n🔧 接下来需要做的：');
        console.log('   1. 确保你的 Notion 数据库已与集成共享');
        console.log('   2. 重启开发服务器: npm run dev');
        console.log('   3. 检查控制台日志确认连接状态');
        console.log('\n📖 详细设置说明请查看: NOTION_SETUP.md');
        
        // 显示配置摘要
        console.log('\n📋 配置摘要：');
        console.log(`   API 密钥: ${apiKey.substring(0, 10)}...`);
        console.log(`   数据库 ID: ${databaseId}`);
        
      } catch (error) {
        console.error('❌ 写入配置文件失败:', error.message);
        console.log('💡 请手动创建 .env.local 文件并添加以下内容：');
        console.log(`NOTION_API_KEY=${apiKey}`);
        console.log(`NOTION_DATABASE_ID=${databaseId}`);
      }
      
      rl.close();
    });
  });
}

// 处理退出
rl.on('close', () => {
  console.log('\n👋 设置完成！如有问题请查看 NOTION_SETUP.md');
  process.exit(0);
});
