---
title: "Volcengine Multimodal"
description: "火山引擎即梦AI图片/视频生成 - 图片生成与视频生成，使用 volcengine SignerV4 签名"
version: "5.0.0"
agent_created: true
---

# Volcengine Multimodal

火山引擎即梦AI 多模态内容生成。支持图片生成（Seedream 4.0/4.6）和视频生成（Seedance 3.0 Pro）。

## 认证

使用 IAM AK/SK + HMAC-SHA256 签名。凭证通过 `volcengine` SDK 的 `SignerV4` 签名。

**环境变量**（需在 `.env.local` 或系统环境中设置）：
```bash
export VOLC_ACCESSKEY="AKLT..."
export VOLC_SECRETKEY="..."
```

| 项目 | 值 |
|------|-----|
| API 端点 | `https://visual.volcengineapi.com` |
| Region | `cn-north-1` |
| Service | `cv` |

## 依赖

```bash
pip install volcengine requests
```

## 可用模型

### 图片

| req_key | 模型 | 说明 |
|---------|------|------|
| `jimeng_t2i_v40` | 即梦图片4.0 | 文生图/图生图，最高4K，最多15张组图 |
| `jimeng_seedream46_cvtob` | 即梦图片4.6 | 基于Seedream4.0，人像/设计/风格化 |

### 视频

| req_key | 模型 | 说明 |
|---------|------|------|
| `jimeng_ti2v_v30_pro` | 即梦视频3.0 Pro | 文/图生视频，1080P，多镜头叙事 |

## 核心代码

```python
import json, time, os, requests
from volcengine.auth.SignerV4 import SignerV4

AK = os.environ["VOLC_ACCESSKEY"]
SK = os.environ["VOLC_SECRETKEY"]
HOST = "visual.volcengineapi.com"
URL = f"https://{HOST}"

class Creds:
    def __init__(self):
        self.ak, self.sk, self.service, self.region = AK, SK, "cv", "cn-north-1"
        self.session_token = ""

class Req:
    def __init__(self, action, body):
        self.method = "POST"
        self.path = "/"
        self.query = {"Action": action, "Version": "2022-08-31"}
        self.body = json.dumps(body, separators=(",", ":")).encode("utf-8")
        self.headers = {"Host": HOST, "Content-Type": "application/json"}
        SignerV4.sign(self, Creds())

def _api(action, body):
    from urllib.parse import urlencode
    r = Req(action, body)
    resp = requests.post(f"{URL}?{urlencode(r.query)}", data=r.body, headers=r.headers, timeout=60)
    return resp.json()

def generate_image(prompt, req_key="jimeng_t2i_v40", image_urls=None,
                   size=4194304, save_path=None):
    """图片生成"""
    body = {"req_key": req_key, "prompt": prompt, "size": size}
    if image_urls: body["image_urls"] = image_urls
    r = _api("CVSync2AsyncSubmitTask", body)
    if r.get("code") != 10000: raise RuntimeError(r.get("message"))
    tid = r["data"]["task_id"]
    for _ in range(60):
        r = _api("CVSync2AsyncGetResult", {"req_key": req_key, "task_id": tid,
               "req_json": json.dumps({"return_url": True})})
        if r["data"].get("status") == "done":
            urls = r["data"].get("image_urls", [])
            if urls and save_path:
                os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
                with open(save_path, "wb") as f: f.write(requests.get(urls[0], timeout=60).content)
                return {"task_id": tid, "urls": urls, "saved": save_path}
            return {"task_id": tid, "urls": urls}
        time.sleep(5)
    raise TimeoutError("超时")

def generate_video(prompt, req_key="jimeng_ti2v_v30_pro", image_url=None,
                   aspect_ratio="16:9", duration=5, save_path=None):
    """视频生成（异步）"""
    frames = 121 if duration <= 5 else 241
    body = {"req_key": req_key, "prompt": prompt, "seed": -1,
            "frames": frames, "aspect_ratio": aspect_ratio}
    if image_url: body["image_urls"] = [image_url]
    r = _api("CVSync2AsyncSubmitTask", body)
    if r.get("code") != 10000: raise RuntimeError(r.get("message"))
    tid = r["data"]["task_id"]
    for _ in range(120):
        r = _api("CVSync2AsyncGetResult", {"req_key": req_key, "task_id": tid,
               "req_json": json.dumps({"return_url": True})})
        d = r.get("data", {})
        if d.get("status") == "done":
            rd = d.get("RespData", d)
            video_url = rd.get("VideoUrl", rd.get("video_url", ""))
            if video_url:
                if save_path:
                    os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
                    with open(save_path, "wb") as f: f.write(requests.get(video_url, timeout=120).content)
                    return {"task_id": tid, "url": video_url, "saved": save_path}
                return {"task_id": tid, "url": video_url}
            raise RuntimeError(f"无视频URL: {rd}")
        time.sleep(10)
    raise TimeoutError("超时")
```

## 参数

### 图片
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 描述，最长800字符 |
| image_urls | array | 否 | 参考图URL，0-10张(4.0)/0-14张(4.6) |
| size | int | 否 | 面积，默认4194304(2K)，范围[1024², 4096²] |
| force_single | bool | 否 | 强制单图 |

### 视频
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 描述，建议400字以内 |
| image_url | string | 否 | 首帧图片URL（图生视频） |
| aspect_ratio | string | 否 | 16:9/4:3/1:1/3:4/9:16/21:9，默认16:9 |
| duration | int | 否 | 5或10秒 |

## 响应格式

提交: `{"code": 10000, "data": {"task_id": "xxx"}, "message": "Success"}`
查询: `{"code": 10000, "data": {"status": "done|in_queue|generating|failed", "image_urls": [...], "video_url": "..."}}`

## 注意事项

- 图片URL有效期24小时，视频URL约1小时，请及时下载
- 计费: 图片 0.2元/张，视频3.0 Pro 1元/秒
- 状态: `in_queue` → `generating` → `done` / `failed`
