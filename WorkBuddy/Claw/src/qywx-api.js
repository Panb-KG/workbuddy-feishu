import axios from 'axios';
import 'dotenv/config';

/**
 * 企业微信API客户端
 */
export class QywxApiClient {
  constructor(corpId, appId, appSecret) {
    this.corpId = corpId || process.env.QYWX_CORP_ID;
    this.appId = appId || process.env.QYWX_APP_ID;
    this.appSecret = appSecret || process.env.QYWX_APP_SECRET;
    this.accessToken = null;
    this.tokenExpireTime = null;
    this.baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin';
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/gettoken`, {
        params: {
          corpid: this.corpId,
          corpsecret: this.appSecret
        }
      });

      if (response.data.errcode === 0) {
        this.accessToken = response.data.access_token;
        this.tokenExpireTime = Date.now() + (response.data.expires_in - 60) * 1000; // 提前60秒刷新
        return this.accessToken;
      } else {
        throw new Error(`获取access_token失败: ${response.data.errmsg}`);
      }
    } catch (error) {
      throw new Error(`获取access_token异常: ${error.message}`);
    }
  }

  /**
   * 发送应用消息
   */
  async sendMessage(toUser, content, msgType = 'text') {
    const accessToken = await this.getAccessToken();
    
    const message = {
      touser: toUser,
      msgtype: msgType,
      agentid: this.appId
    };

    switch (msgType) {
      case 'text':
        message.text = { content };
        break;
      case 'markdown':
        message.markdown = { content };
        break;
      case 'textcard':
        message.textcard = content;
        break;
      default:
        throw new Error(`不支持的msgType: ${msgType}`);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/message/send?access_token=${accessToken}`,
        message
      );
      
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
   * 获取部门列表
   */
  async getDepartmentList(departmentId = null) {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/department/list`, {
        params: {
          access_token: accessToken,
          id: departmentId
        }
      });

      if (response.data.errcode === 0) {
        return { success: true, data: response.data.department };
      } else {
        return { success: false, error: response.data.errmsg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取部门成员
   */
  async getDepartmentUsers(departmentId, fetchChild = false) {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/user/simplelist`, {
        params: {
          access_token: accessToken,
          department_id: departmentId,
          fetch_child: fetchChild ? 1 : 0
        }
      });

      if (response.data.errcode === 0) {
        return { success: true, data: response.data.userlist };
      } else {
        return { success: false, error: response.data.errmsg };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(userId) {
    const accessToken = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/user/get`, {
        params: {
          access_token: accessToken,
          userid: userId
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
}