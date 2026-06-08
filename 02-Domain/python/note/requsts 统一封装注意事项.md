---
title: requsts 统一封装注意事项
create_date: 2026-06-01 11:20:06
language: python
tags:
  - python
  - requests
---

## Requsts
>[!tip] 简短描述

`requests` 是一个功能强大且简单易用的 python 语言 HTTP 库，用于发送 HTTP 请求。它提供了更友好的 API，用于处理 HTTP 请求和响应，以及处理 cookies、身份验证和代理等常见应用场景。requests 库已经成为Python开发人员的首选HTTP库之一。

## Session
`Session` 会话提供了一种在多个请求之间共享状态的机制。在使用 requests 库发送多个相关的 HTTP 请求时，我们可以使用 Session 来维持一个会话。通过 Session，我们可以跨多个请求使用相同的 cookies、身份验证信息和**连接池**。这对于需要进行身份验证或需要保持会话状态的应用程序非常有用。
```python
import requests
session = requests.Session()
```

## 登录态
在中后台的管理系统中，目前有两种主流的身份验证机制：`session + cookie` 和 `Bearer Token` 形式
### Cookie
传统网站的登录机制依赖服务器下发的 Cookie（Session ID）。使用 Session 发送登录请求后，它会自动保存响应中的 Cookie，并在后续请求中透明地附加到 HTTP 头部。
```python
# 1. 准备登录数据 
login_url = "https://example.com/login" 
payload = {"username": "test_user", "password": "123456"} 
# 2. 发送登录请求，Session 会自动提取并保存返回的 Cookie 
response = session.post(login_url, data=payload) 
# 检查是否登录成功 
if response.status_code == 200: 
	print("登录成功") 
else: 
	print("登录失败") 
# 3. 访问受保护的页面，无需手动传 Cookie，Session 会自动携带 
profile_url = "https://example.com/profile" 
res_profile = session.get(profile_url) print(res_profile.text)
```
### Token
在现代前后端分离或微服务架构中，登录成功后通常会返回一个 Token（如 JWT）。此时需要将 Token 统一设置到 Session 的 Header 中，让该 Session 发起的所有请求都自动带上认证信息。
```python
# 1. 调用登录接口获取 Token 
api_login_url = "https://api.example.com/auth/login" 
login_data = {"username": "admin", "pwd": "123456"} 
res_login = session.post(api_login_url, json=login_data) 

# 假设响应格式为 {"token": "eyJhbGciOiJIUzI1NiJ9..."} 
auth_token = res_login.json().get("token") 

# 2. 全局更新 Session 的 Header 
# 此后通过该 session 发出的所有请求，都会自动携带 Authorization 头
session.headers.update({ "Authorization": f"Bearer {auth_token}", "Content-Type": "application/json" }) 

# 3. 直接调用业务接口，已具备鉴权状态 
business_api = "https://api.example.com/user/info" 
res_business = session.get(business_api) print(res_business.json())
```

## best practice
> [!question] 
> python 接口自动化测试中，封装请求 requests 时，需要实现一个 requests.session 全局使用，还是每个案例套件中自行实例化一个 requests.session，通常使用哪种方式？

在 Python 接口自动化测试中，通常推荐**全局复用 requests.Session 实例 + 分层管理登录态**的方式。这种方式不仅能大幅降低服务器压力、提高执行效率，还能有效避免用例间的状态污染。

### 为什么不建议每个案例套件自行实例化？

如果每个测试文件（Module）或每条测试用例（Function）都独立实例化一个 `requests.Session`，会导致以下问题：

1. **性能低下**：每次实例化都需要重新建立 TCP 连接，无法复用底层的连接池（Connection Pool），显著增加整体执行时间。
2. **重复请求与限流风险**：每个套件都要单独走一遍登录流程，频繁触发系统限流策略或图形验证码机制，甚至影响测试环境的稳定性。
3. **维护困难**：需要在多处处理鉴权逻辑，一旦认证方式变更，修改成本极高。

### 全局使用 requests.session 的最佳实践

目前主流的框架设计（如结合 pytest 框架时）倾向于将 Session 作为全局资源进行复用，但为了避免所有用例共享同一个 Cookie/Token 导致的状态污染，通常采用**分层+参数化**的策略：

#### 1. 利用 Fixture 的作用域实现全局复用

通过定义一个具有 `scope="session"` 作用域的 Fixture 来封装基础会话对象。这确保了在整个测试运行周期内，Session 仅被实例化一次，实现了 TCP 连接的复用。

```python
import pytest
import requests

@pytest.fixture(scope="session")
def api_client():
    """创建一个全局的HTTP会话客户端，整个测试会话只创建一次"""
    session = requests.Session()
    # 配置一些默认请求头，比如 User-Agent
    session.headers.update({'User-Agent': 'MyAPITestBot/1.0'})
    yield session  
    session.close()  # 测试结束后关闭会话，释放资源
```

#### 2. 区分「基础会话」与「带登录态会话」

并不是所有接口都需要登录（例如健康检查、公开信息查询等）。因此，需要将“连接管理”和“请求构造（含鉴权）”拆分开来：

- **基础层（Guest Session）**：仅提供通用的 headers 和 timeout，不带任何认证信息。
- **业务层（Authed Session）**：依赖基础 Session，在内部调用登录接口获取 Token/Cookie，并将其注入到 Session 的 headers 中。

#### 3. 灵活控制作用域以平衡隔离性

根据接口的特性，可以动态调整鉴权 Fixture 的作用域：

- ** `scope="function"` **：适用于需要严格隔离的用例。每个测试函数执行前都会重新登录并生成新的 Token，防止用例间产生副作用干扰。
- ** `scope="module"` **：适用于同一模块内的多个用例共用一个登录态。
- ** `scope="session"` **：适用于全局仅需登录一次的场景，极大提升执行效率。

### 总结建议

在实际封装中，你应该摒弃在每个测试类或文件中手动 `sess = requests.session()` 的做法。正确的架构是：**在底层工具类或 conftest.py 中全局单例化 `requests.Session`，并通过不同作用域的 Fixture 按需注入鉴权信息**。这样既享受了全局 Session 带来的性能红利，又保证了接口自动化测试的独立性与健壮性。