---
title: API接口自动化项目架构
create_date: 2026-06-02 11:27:32
language: python
tags:
  - python
  - pytest
---

## API接口自动化项目架构
>[!tip] 简短描述
基于 **pytest + requests + allure + uv** 实现 API 接口自动化项目。

## 技术栈
```text
python uv
pytest requests allure
jmespath
pymql
```

## 架构原则
|原则     |  详细   |
| --- | --- |
| 接口与用例解耦    | `api/` 只描述 URL、方法、入参；`testcases/` 只编排步骤与断言   |
| 数据与代码解耦 | 使用`yaml`或`json`文件描述测试数据，通过`@pytest.mark.parametrize` 实现参数测试
|多环境配置| 通过 `env/*.yaml` 实现多环境切换 |
| 公共逻辑| 统一封装请求、断言、数据库操作等|
## 分层架构
项目整体按以下分层结构进行解耦。
基础（公共）层 - 工具封装层 - 业务逻辑层 - 测试数据层 - 测试报告层

|分层     | 描述     |
| --- | --- |
| 基础公共层 | 环境配置、全局配置、日志、工具等 |
| 工具层| requests 统一请求封装、数据库操作封装、断言工具封装、日志操作封装等 |
| 业务层 | 接口api和用例case分离、单接口和场景多接口分离 |
| 数据层 |测试数据 yaml/json |
| 报告层 | allure可视化报告、失败日志、截图等 |

## 项目目录
```text
api-auto-test-framework/  
├── pyproject.toml               # 项目元数据与依赖声明（uv 源）
├── uv.lock                      # 锁文件（提交到仓库）
├── .python-version              # 可选：uv 固定 Python 版本
├── pytest.ini
├── conftest.py                  # 全局 fixture、命令行参数、hook
├── run.py                       # 一键执行：uv run pytest + allure generate
├── env/                         # 环境配置
│   ├── dev.yaml
│   ├── test.yaml
│   └── prod.yaml
├── config/
│   ├── __init__.py
│   └── settings.py              # 加载 env/{ENV}.yaml
├── db/                          # MySQL 封装
│   ├── __init__.py
│   ├── mysql_client.py
│   └── user_dao.py
├── common/
│   ├── __init__.py
│   ├── request_client.py        # 请求封装：日志、authorization(token)
│   ├── assert_utils.py          # 接口响应断言（JMESPath）
│   ├── assert_db.py             # 数据库断言
│   ├── jmespath_utils.py        # JMESPath 封装
│   ├── data_loader.py           # 测试数据加载
│   └── logger.py                # 日志封装
├── api/                         # API
│   ├── __init__.py
│   ├── base_api.py
│   ├── auth_api.py              # 登录并解析 access_token
│   └── user_api.py
├── testcases/                   # 测试用例
│   ├── conftest.py              # 鉴权、DB fixture
│   ├── api/                     # 单接口用例（测试类=模块，测试函数=接口）
│   │   ├── test_auth_api.py
│   │   └── test_user_api.py
│   └── scenario/                # 场景用例（测试类=场景，测试函数编排多个接口）
│       └── test_user_register_flow.py
├── data/                        # 测试数据
│   ├── api/                     # 单接口用例数据
│   │   ├── auth/
│   │   │   └── login_cases.yaml
│   │   └── user/
│   │       └── create_user_cases.yaml
│   └── scenario/                # 场景用例数据（多步骤）
│       └── user/
│           └── register_login_flow.yaml
└── reports/                     # 测试报告
    ├── allure-results/
    └── allure-report/
```

## pytest
测试执行器由 pytest 框架实现，两大特性：
- `pytest.fixture` 夹具提供全局环境和以及验证 token 的注入。
- `pytest.mark.parametrize ` 实现数据和代码分离，把用例标题、接口参数、预期响应数据通过 `yaml/json` 文件组织，测试用例的脚本中只写逻辑不写数据。
## allure
Allure 提供了丰富的 API（通常以装饰器或静态方法的形式存在），用于在测试代码中注入语义化信息、细化执行步骤以及附加排查证据。为了帮助你更清晰地掌握这些核心 API，以下是常用 Allure API 的对比总结：

|API / 装饰器|核心作用与定位|典型应用场景|
|:--|:--|:--|
|`@allure.feature`|宏观业务模块划分  <br>定义测试用例所属的核心功能模块，对应敏捷开发中的“特性”层级。|标记测试类属于“用户管理”、“订单支付”或“购物车”等具体业务域。|
|`@allure.story`|微观用户故事细分  <br>进一步细化 Feature 下的具体需求场景或用户故事。|在“订单支付”模块下，细分为“支付宝支付”、“微信支付”等具体流程。|
|`@allure.title`|自定义用例展示名称  <br>覆盖默认的函数名，使报告中的用例标题更加直观且支持动态参数替换。|将晦涩的函数名改为 `{case_name}` 或“验证手机号格式异常时提示错误”。|
|`@allure.severity`|设定用例严重级别  <br>为用例打上优先级标签，便于在报告中按重要程度筛选和过滤。|为核心链路接口标注 `CRITICAL`，次要功能标注 `MINOR` 或 `TRIVIAL`。|
|`@allure.step`|拆解操作步骤（上下文）  <br>记录详细的执行动作，支持嵌套，是构建清晰排障路径的关键。|包裹“发送登录请求”、“解析响应Token”、“断言状态码”等具体执行逻辑。|
|`allure.attach()`|附加排查证据文件  <br>向报告中挂载图片、文本、日志、网页源码等多媒体附件。|失败时自动截图、附加 HTTP 请求/响应报文、嵌入 HTML 定制页面或系统运行日志。|
|`allure.dynamic.*`|运行时动态设置属性  <br>在测试执行过程中动态修改标题、描述或添加标签，灵活性极高。|根据数据驱动（DDT）传入的不同参数，动态生成包含具体数据的测试标题。|

## 断言
三层断言 
1. 响应状态码 `response.status_code`
2. 响应业务码 `response.data.code`
3. 响应数据：`response.data.data`
4. 数据库验证：通过 sql 执行数据库查询进行数据对比

## Bug
自动化测试用例执行失败，怎么区分是脚本 Bug 还是业务 Bug ?
1. 按照步骤，通过手工测试一遍进行验证
2. 通过查询日志、抓包、查数据库验证
3. 检查参数、断言、依赖是否正确
