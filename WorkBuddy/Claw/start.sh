#!/bin/bash

# WorkBuddy 飞书集成启动脚本
# 作者: 老潘
# 版本: 1.0

echo "🚀 启动 WorkBuddy 飞书集成服务..."

# 检查环境变量
if [ -z "$FEISHU_APP_ID" ] && [ ! -f ".env" ]; then
    echo "❌ 错误: 未找到 .env 文件且未设置环境变量"
    echo "💡 请创建 .env 文件或设置以下环境变量:"
    echo "   - FEISHU_APP_ID"
    echo "   - FEISHU_APP_SECRET"
    echo "   - FEISHU_BOT_WEBHOOK"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "💡 请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 创建日志目录
mkdir -p logs

# 启动服务
echo "🎯 启动服务..."
echo "📍 服务将运行在: http://localhost:${PORT:-3000}"
echo "📊 健康检查: http://localhost:${PORT:-3000}/"
echo ""
echo "💡 飞书配置检查:"
echo "   - 应用ID: ${FEISHU_APP_ID:-从.env文件读取}"
echo "   - 应用密钥: ${FEISHU_APP_SECRET:-从.env文件读取}"
echo ""
echo "🎯 功能特性:"
echo "   • 🤖 智能对话交互"
echo "   • 🔍 本地知识搜索"
echo "   • 🧠 记忆系统管理"
echo "   • 📱 美观的卡片界面"
echo ""
echo "🚀 服务启动中..."

# 启动服务
if [ "$1" = "--pm2" ]; then
    # 使用PM2启动
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js
        echo "✅ 服务已通过PM2启动"
        echo "💡 管理命令:"
        echo "   pm2 logs workbuddy-feishu    # 查看日志"
        echo "   pm2 restart workbuddy-feishu # 重启服务"
        echo "   pm2 stop workbuddy-feishu    # 停止服务"
    else
        echo "❌ 未找到PM2，请先安装: npm install -g pm2"
        npm start
    fi
else
    # 直接启动
    npm start
fi