import axios from 'axios';
import 'dotenv/config';

/**
 * 企业微信机器人客户端
 */
export class QywxBotClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl || process.env.QYWX_BOT_WEBHOOK;
  }

  /**
   * 发送文本消息
   */
  async sendText(content, mentionedList = [], mentionedMobileList = []) {
    const message = {
      msgtype: 'text',
      text: {
        content,
        mentioned_list: mentionedList,
        mentioned_mobile_list: mentionedMobileList
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送Markdown消息
   */
  async sendMarkdown(content) {
    const message = {
      msgtype: 'markdown',
      markdown: {
        content
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送图片消息
   */
  async sendImage(base64, md5) {
    const message = {
      msgtype: 'image',
      image: {
        base64,
        md5
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送图文消息
   */
  async sendNews(articles) {
    const message = {
      msgtype: 'news',
      news: {
        articles: articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          picurl: article.picurl
        }))
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送文件消息
   */
  async sendFile(mediaId) {
    const message = {
      msgtype: 'file',
      file: {
        media_id: mediaId
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 通用消息发送方法
   */
  async sendMessage(message) {
    try {
      const response = await axios.post(this.webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.errcode === 0) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.errmsg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送告警消息模板
   */
  async sendAlert(alertType, title, content, timestamp = new Date()) {
    const markdown = `## ${alertType}告警
**标题**: ${title}
**内容**: ${content}
**时间**: ${timestamp.toLocaleString()}
**状态**: ⚠️ 需要关注`;

    return this.sendMarkdown(markdown);
  }

  /**
   * 发送任务通知
   */
  async sendTaskNotification(taskName, assignee, deadline, priority = '中等') {
    const emoji = {
      '高': '🔴',
      '中等': '🟡',
      '低': '🟢'
    };

    const markdown = `### 📋 任务分配通知
**任务名称**: ${taskName}
**负责人**: ${assignee}
**截止时间**: ${deadline}
**优先级**: ${emoji[priority]} ${priority}

请及时处理并更新任务进度`;

    return this.sendMarkdown(markdown);
  }

  /**
   * 发送日报/周报
   */
  async sendDailyReport(reportData) {
    const markdown = `## 📊 ${reportData.title}
**日期**: ${reportData.date}
**完成事项**:
${reportData.completed.map(item => `- ${item}`).join('\n')}

**待办事项**:
${reportData.todos.map(item => `- ${item}`).join('\n')}

**问题与建议**:
${reportData.issues.map(item => `- ${item}`).join('\n')}`;

    return this.sendMarkdown(markdown);
  }
}