# 获取当前登录用户信息

## 接口信息

| 属性 | 值 |
|------|-----|
| **HTTP 方法** | GET |
| **接口路径** | `/system/user/current` |
| **认证方式** | JWT Token |

## 请求参数

此接口无需请求参数，通过 Cookie 中的 Token 进行身份认证。

## 响应数据

### 响应结构

```json
{
  "permissions": ["string"],
  "roles": ["string"],
  "sysUser": {
    "avatar": "string",
    "deleted": 0,
    "email": "string",
    "id": 1,
    "loginDate": "2024-01-01 12:00:00",
    "loginIp": "192.168.1.1",
    "nickName": "string",
    "password": "string",
    "phonenumber": "string",
    "remark": "string",
    "sex": "0",
    "status": "0",
    "tenantId": 1,
    "userName": "string",
    "userType": "00"
  }
}
```

### 字段说明

#### LoginUser（登录用户信息）

| 字段名 | 类型 | 含义 |
|--------|------|------|
| `permissions` | `string[]` | 权限列表 |
| `roles` | `string[]` | 角色列表 |
| `sysUser` | `SysUserApi` | 用户信息对象 |

#### SysUserApi（系统用户信息）

| 字段名 | 类型 | 含义 |
|--------|------|------|
| `avatar` | `string` | 用户头像 URL |
| `deleted` | `number` | 删除标志（0 代表存在，2 代表删除） |
| `email` | `string` | 用户邮箱 |
| `id` | `number` | 用户 ID |
| `loginDate` | `string` | 最后登录时间 |
| `loginIp` | `string` | 最后登录 IP |
| `nickName` | `string` | 用户昵称 |
| `password` | `string` | 密码（加密存储） |
| `phonenumber` | `string` | 手机号码 |
| `remark` | `string` | 备注 |
| `sex` | `string` | 用户性别（0 男，1 女，2 未知） |
| `status` | `string` | 账号状态（0 正常，1 停用） |
| `tenantId` | `number` | 租户 ID |
| `userName` | `string` | 用户账号 |
| `userType` | `string` | 用户类型（00 系统用户） |

## 错误响应

| HTTP 状态码 | 错误信息 | 说明 |
|-------------|----------|------|
| 401 | `Unauthorized` | 未登录或 Token 无效 |
| 500 | `Internal Server Error` | 服务器内部错误 |

## 示例

### 请求示例

```bash
curl -X GET http://localhost:8080/system/user/current \
  -H "Cookie: JSESSIONID=xxx"
```

### 成功响应示例

```json
{
  "permissions": ["user:view", "user:edit"],
  "roles": ["admin"],
  "sysUser": {
    "avatar": "https://example.com/avatar.jpg",
    "deleted": 0,
    "email": "admin@example.com",
    "id": 1,
    "loginDate": "2024-01-15 10:30:00",
    "loginIp": "192.168.1.100",
    "nickName": "管理员",
    "password": "$2a$10$xxx",
    "phonenumber": "13800138000",
    "remark": "系统管理员",
    "sex": "0",
    "status": "0",
    "tenantId": 1,
    "userName": "admin",
    "userType": "00"
  }
}
```