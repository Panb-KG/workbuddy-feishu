import axios from 'axios';
import 'dotenv/config';

/**
 * 飞书机器人客户端
 */
export class FeishuBotClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl || process.env.FEISHU_BOT_WEBHOOK;
  }

  /**
   * 发送文本消息
   */
  async sendText(content) {
    const message = {
      msg_type: 'text',
      content: {
        text: content
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送富文本消息
   */
  async sendPost(postContent) {
    const message = {
      msg_type: 'post',
      content: {
        post: postContent
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送图片消息
   */
  async sendImage(imageKey) {
    const message = {
      msg_type: 'image',
      content: {
        image_key: imageKey
      }
    };

    return this.sendMessage(message);
  }

  /**
   * 发送卡片消息
   */
  async sendCard(cardContent) {
    const message = {
      msg_type: 'interactive',
      card: cardContent
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

      if (response.data.StatusCode === 0) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.StatusMessage };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送告警消息
   */
  async sendAlert(alertType, title, content, level = 'warning') {
    const levelColors = {
      critical: 'red',
      warning: 'orange',
      info: 'blue',
      success: 'green'
    };

    const card = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: `🚨 ${alertType}告警`
        },
        template: levelColors[level]
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**标题**: ${title}\n**内容**: ${content}\n**时间**: ${new Date().toLocaleString()}\n**级别**: ${level.toUpperCase()}`
          }
        },
        {
          tag: 'action',
          actions: [{
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: '查看详情'
            },
            type: 'primary',
            url: 'https://example.com/alerts'
          }]
        }
      ]
    };

    return this.sendCard(card);
  }

  /**
   * 发送任务通知
   */
  async sendTaskNotification(taskName, assignee, deadline, priority = 'medium') {
    const priorityIcons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };

    const card = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '📋 任务分配通知'
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**任务名称**: ${taskName}\n**负责人**: ${assignee}\n**截止时间**: ${deadline}\n**优先级**: ${priorityIcons[priority]} ${priority.toUpperCase()}`
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '开始处理'
              },
              type: 'primary',
              value: 'start'
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '查看详情'
              },
              type: 'default',
              url: 'https://example.com/tasks'
            }
          ]
        }
      ]
    };

    return this.sendCard(card);
  }

  /**
   * 发送日报/周报
   */
  async sendReport(reportData) {
    const card = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: `📊 ${reportData.title}`
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**日期**: ${reportData.date}\n\n**完成事项**:\n${reportData.completed.map(item => `✅ ${item}`).join('\n')}\n\n**待办事项**:\n${reportData.todos.map(item => `📝 ${item}`).join('\n')}`
          }
        }
      ]
    };

    return this.sendCard(card);
  }

  /**
   * 发送审批通知
   */
  async sendApprovalNotification(approvalType, applicant, content, approvalUrl) {
    const card = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '📝 审批通知'
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**审批类型**: ${approvalType}\n**申请人**: ${applicant}\n**内容**: ${content}`
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '同意'
              },
              type: 'primary',
              value: 'approve'
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '拒绝'
              },
              type: 'danger',
              value: 'reject'
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '查看详情'
              },
              type: 'default',
              url: approvalUrl
            }
          ]
        }
      ]
    };

    return this.sendCard(card);
  }
}