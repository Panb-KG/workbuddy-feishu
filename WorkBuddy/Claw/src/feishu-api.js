import axios from 'axios';
import 'dotenv/config';

/**
 * 飞书API客户端
 */
export class FeishuApiClient {
  constructor(appId, appSecret) {
    this.appId = appId || process.env.FEISHU_APP_ID;
    this.appSecret = appSecret || process.env.FEISHU_APP_SECRET;
    this.tenantAccessToken = null;
    this.tokenExpireTime = null;
    this.baseUrl = 'https://open.feishu.cn/open-apis';
  }

  /**
   * 获取租户访问令牌
   */
  async getTenantAccessToken() {
    if (this.tenantAccessToken && Date.now() < this.tokenExpireTime) {
      return this.tenantAccessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/v3/tenant_access_token/internal`, {
        app_id: this.appId,
        app_secret: this.appSecret
      });

      if (response.data.code === 0) {
        this.tenantAccessToken = response.data.tenant_access_token;
        this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000; // 提前60秒刷新
        return this.tenantAccessToken;
      } else {
        throw new Error(`获取tenant_access_token失败: ${response.data.msg}`);
      }
    } catch (error) {
      throw new Error(`获取tenant_access_token异常: ${error.message}`);
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(receiveIdType, receiveId, content, msgType = 'text') {
    const accessToken = await this.getTenantAccessToken();
    
    const message = {
      receive_id_type: receiveIdType, // open_id, user_id, email, chat_id
      receive_id: receiveId,
      content: JSON.stringify(this.buildContent(content, msgType)),
      msg_type: msgType
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/im/v1/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.code === 0) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.msg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 构建消息内容
   */
  buildContent(content, msgType) {
    switch (msgType) {
      case 'text':
        return { text: content };
      case 'post':
        return { post: content };
      case 'image':
        return { image_key: content };
      case 'interactive':
        return content; // 直接使用传入的卡片内容
      default:
        return { text: content };
    }
  }

  /**
   * 获取用户列表
   */
  async getUserList(pageSize = 50, pageToken = null) {
    const accessToken = await this.getTenantAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/contact/v3/users`, {
        params: {
          page_size: pageSize,
          page_token: pageToken
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.code === 0) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.msg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取部门列表
   */
  async getDepartmentList(parentDepartmentId = '0', pageSize = 50, pageToken = null) {
    const accessToken = await this.getTenantAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/contact/v3/departments`, {
        params: {
          parent_department_id: parentDepartmentId,
          page_size: pageSize,
          page_token: pageToken
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.code === 0) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.msg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取部门成员
   */
  async getDepartmentUsers(departmentId, pageSize = 50, pageToken = null) {
    const accessToken = await this.getTenantAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/contact/v3/users/find_by_department`, {
        params: {
          department_id: departmentId,
          page_size: pageSize,
          page_token: pageToken
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.data.code === 0) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.msg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建卡片消息
   */
  createCardMessage(title, content, buttons = []) {
    return {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: title
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: content
          }
        },
        ...buttons.map(button => ({
          tag: 'action',
          actions: [{
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: button.text
            },
            type: button.type || 'primary',
            value: button.value
          }]
        }))
      ]
    };
  }
}