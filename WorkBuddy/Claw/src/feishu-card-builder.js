/**
 * 飞书卡片消息构建器 - 创建美观的交互式卡片
 */
export class FeishuCardBuilder {
  
  /**
   * 创建帮助卡片
   */
  createHelpCard() {
    return {
      config: {
        wide_screen_mode: true,
        enable_forward: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '🤖 WorkBuddy 帮助菜单'
        },
        template: 'blue'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**基础命令:**\n• `/help` - 显示帮助菜单\n• `/ping` - 测试连接状态\n• `/status` - 查看系统状态'
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**搜索功能:**\n• `/search [关键词]` - 搜索信息\n• `/查找 [关键词]` - 中文搜索'
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**记忆系统:**\n• `/memory` - 查看记忆状态\n• `/记录 [内容]` - 记录新内容'
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**项目管理:**\n• `/project` - 查看当前项目\n• `/config` - 查看配置信息'
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '📊 查看状态'
              },
              type: 'primary',
              value: {
                command: 'status'
              }
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🔍 搜索测试'
              },
              type: 'default',
              value: {
                command: 'search',
                args: 'JavaScript'
              }
            }
          ]
        }
      ]
    };
  }

  /**
   * 创建搜索结果卡片
   */
  createSearchResultsCard(query, results) {
    const elements = [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**🔍 搜索 "${query}" 的结果**`
        }
      }
    ];

    if (results.length === 0) {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '❌ 未找到相关结果'
        }
      });
    } else {
      results.slice(0, 5).forEach((result, index) => {
        elements.push({
          tag: 'div',
          fields: [
            {
              is_short: false,
              text: {
                tag: 'lark_md',
                content: `**${index + 1}. ${result.title}**`
              }
            },
            {
              is_short: false,
              text: {
                tag: 'lark_md',
                content: `${result.summary}\n*相关度: ${result.score.toFixed(2)}*`
              }
            }
          ]
        });

        if (index < results.length - 1) {
          elements.push({ tag: 'hr' });
        }
      });
    }

    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '🔍 搜索结果'
        },
        template: 'green'
      },
      elements: elements
    };
  }

  /**
   * 创建状态卡片
   */
  createStatusCard(statusInfo) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '📈 WorkBuddy 系统状态'
        },
        template: 'blue'
      },
      elements: [
        {
          tag: 'div',
          fields: Object.entries(statusInfo).map(([key, value]) => ({
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**${key}**\n${value}`
            }
          }))
        },
        {
          tag: 'hr'
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🔄 刷新状态'
              },
              type: 'primary',
              value: {
                command: 'status'
              }
            }
          ]
        }
      ]
    };
  }

  /**
   * 创建项目信息卡片
   */
  createProjectCard(projectInfo) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '📋 项目信息'
        },
        template: 'purple'
      },
      elements: [
        {
          tag: 'div',
          fields: Object.entries(projectInfo).map(([key, value]) => ({
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**${key}**\n${value}`
            }
          }))
        }
      ]
    };
  }

  /**
   * 创建配置信息卡片
   */
  createConfigCard(configInfo) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '⚙️ 系统配置'
        },
        template: 'wathet'
      },
      elements: [
        {
          tag: 'div',
          fields: Object.entries(configInfo).map(([key, value]) => ({
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**${key}**\n${value}`
            }
          }))
        }
      ]
    };
  }

  /**
   * 创建快速操作卡片
   */
  createQuickActionsCard() {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '🚀 快速操作'
        },
        template: 'turquoise'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '选择以下快速操作:'
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🔍 搜索'
              },
              type: 'primary',
              value: {
                command: 'search',
                args: ''
              }
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🧠 记忆'
              },
              type: 'default',
              value: {
                command: 'memory'
              }
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '📊 状态'
              },
              type: 'default',
              value: {
                command: 'status'
              }
            }
          ]
        }
      ]
    };
  }

  /**
   * 创建欢迎卡片
   */
  createWelcomeCard(userName = '老潘') {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '🎉 欢迎使用 WorkBuddy!'
        },
        template: 'green'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `👋 你好 ${userName}! 我是你的智能工作助手 WorkBuddy。\n\n我可以帮你：\n• 🔍 搜索信息和知识\n• 🧠 记录和管理记忆\n• 📊 查看项目状态\n• ⚙️ 管理系统配置`
          }
        },
        {
          tag: 'hr'
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**💡 开始使用:**\n输入 `/help` 查看所有命令\n或点击下方按钮快速开始'
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '📖 查看帮助'
              },
              type: 'primary',
              value: {
                command: 'help'
              }
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🚀 快速开始'
              },
              type: 'default',
              value: {
                command: 'quick'
              }
            }
          ]
        }
      ]
    };
  }

  /**
   * 创建错误卡片
   */
  createErrorCard(errorMessage) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '❌ 操作失败'
        },
        template: 'red'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: errorMessage
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🔄 重试'
              },
              type: 'primary',
              value: {
                command: 'retry'
              }
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '📖 查看帮助'
              },
              type: 'default',
              value: {
                command: 'help'
              }
            }
          ]
        }
      ]
    };
  }

  /**
   * 创建成功卡片
   */
  createSuccessCard(message) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: '✅ 操作成功'
        },
        template: 'green'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: message
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '🔍 继续搜索'
              },
              type: 'primary',
              value: {
                command: 'search',
                args: ''
              }
            }
          ]
        }
      ]
    };
  }
}