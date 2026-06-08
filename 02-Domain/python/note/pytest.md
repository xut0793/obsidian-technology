---
title: pytest
create_date: 2026-06-02 17:10:02
language:
tags:
---

## pytest
>[!tip] 简短描述

## What 它是什么
>[!tip] 它能做什么

## Why 为什么是它
>[!tip] 为什么选择它，它有什么优势，同类软件技术有哪些

## How 基本使用
>[!tip] quick start 步骤，常用的命令方法等

### `@pytest.mark.parametrize()`
在 pytest 自动化测试框架中，`@pytest.mark.parametrize()` 是实现数据驱动测试（Data-Driven Testing）的核心装饰器。它允许开发者为单个测试函数定义多组参数和预期结果，从而实现“一套逻辑、批量执行”的效果。

`@pytest.mark.parametrize()` 的主要作用是让一个测试函数自动循环执行多组不同的输入数据。其核心价值体现在四个方面：

1. **代码复用与精简**：避免了为不同输入重复编写结构相似的测试函数，极大减少了代码冗余。
2. **易于维护**：测试数据集中管理，新增或删除测试场景时，只需修改参数列表，无需改动底层测试逻辑。
3. **提升覆盖率**：能够轻松覆盖正常、异常、边界值等多种测试场景。
4. **清晰的失败定位**：pytest 会为每组数据生成独立的测试结果，当某组数据断言失败时，不会影响其他组的执行，且报告中会精准标记失败的特定用例。
#### 基本语法
该装饰器的基本语法为 `@pytest.mark.parametrize(argnames, argvalues, indirect=False, ids=None, scope=None)`，各参数含义如下：

1. **argnames（参数名）**
    
    - **类型**：字符串或列表/元组。
    - **作用**：指定测试函数的形参名称。多个参数名之间用逗号分隔（如 `"name,pwd"`）。参数值的传递顺序必须与这里定义的参数名顺序严格一致。
2. **argvalues（参数值列表）**
    
    - **类型**：必须是可迭代对象（通常为列表）。
    - **作用**：提供实际传入的测试数据。
        - 若只有一个参数名，值为单元素的列表，如 `["value1", "value2"]`。
        - 若有多个参数名，值必须是包含元组的列表，每个元组对应一组完整的参数值，如 ``。
3. **indirect（间接传参控制）**
    
    - **类型**：布尔值，默认为 `False`。
    - **作用**：决定参数值的处理方式。
        - `False`（默认）：参数值直接作为普通变量传入测试函数。
        - `True`：将 `argnames` 视为同名的 fixture 函数名称。此时，`argvalues` 中的值会被传递给对应的 fixture 函数（通过 `request.param` 获取），fixture 处理后的返回值再传入测试函数。这在需要动态初始化复杂测试数据时非常有用。
4. **ids（自定义用例标识）**
    
    - **类型**：字符串列表或函数，默认为 `None`。
    - **作用**：为每一组参数组合生成唯一的测试用例 ID，用于增强测试报告的可读性。如果不指定，pytest 会使用默认的索引或参数值自动生成 ID（如 `test_func[1-2]`）。使用 `ids` 可以将其替换为更具语义化的名称（如 `test_func[正整数相加]`）。
5. **scope（作用域范围）**
    
    - **类型**：字符串，可选值为 `function`、`class`、`module`、`package`、`session`，默认为 `function`。
    - **作用**：定义参数化数据的生命周期范围。此参数主要影响关联 fixture 的作用域，允许按参数实例对测试进行分组。例如，设置为 `module` 时，同一模块内的所有测试可能会共享相同的参数实例化过程。

#### 进阶应用技巧

除了基础用法外，`@pytest.mark.parametrize()` 还支持多种高级特性：

- **多层级应用**：不仅可以装饰单个测试函数，还可以应用在测试类（Class）上，使类内所有方法共用同一组参数；甚至可以通过设置全局变量 `pytestmark` 实现整个模块的参数化。
- **笛卡尔积组合**：支持叠加使用多个 `@pytest.mark.parametrize` 装饰器，pytest 会自动计算参数的笛卡尔积，穷举所有可能的组合场景。
- **独立标记子用例**：结合 `pytest.param()`，可以为特定的某一组参数单独添加标记（如 `marks=pytest.mark.xfail` 表示预期失败，或 `marks=pytest.mark.skip` 表示跳过），实现更精细的用例控制。
- **外部数据源对接**：`argvalues` 可以直接接收由函数返回的动态列表，从而方便地从 Excel、YAML、JSON 文件或数据库中读取测试数据，实现真正的代码与数据分离。
#### 代码示例
基本使用
```python
import pytest 
# 定义一个待测试的加法函数 
def add(a, b): return a + b 

# 使用 parametrize 传入三组不同的参数，test_add 函数会自动运行 3次。
# 每次运行时，a、b 和 expected 都会被替换为列表中对应元组的值。
# 如果其中某组数据断言失败，不会影响其他两组数据的正常执行。
@pytest.mark.parametrize("a, b, expected", [ 
(1, 2, 3), # 第1组参数 
(0, 0, 0), # 第2组参数
(-1, 1, 0), # 第3组参数 ])
def test_add(a, b, expected): assert add(a, b) == expected


@pytest.mark.parametrize("user, psw", [ 
("student", "123456"), # 正常执行的用例 
("teacher", "abcdefg"), # 正常执行的用例 
# 单独对这组数据添加 skip 标记，使其在运行时被跳过 
pytest.param("admin", "我爱中华！", marks=pytest.mark.skip(reason='该管理员账号尚未初始化')) ]) 
def test_login(user, psw): 
	print(f"尝试登录：{user} / {psw}") 
	assert 1 == 1
```
从文件读取数据进行注入测试
```python
import pytest 
import yaml

def load_test_data(): 
	"""读取YAML文件中的测试数据""" 
	with open("test_data.yml", "r", encoding="utf-8") as f: 
	return yaml.safe_load(f) 
	
@pytest.mark.parametrize("case", load_test_data()) 
def test_login(case): 
	# 直接从字典中获取对应字段的数据 
	username = case["username"] 
	password = case["password"] 
	expected_code = case["expected_code"] 
	print(f"正在测试：{case['name']}，用户：{username}") 
	# 这里编写实际的登录请求逻辑... # 
	assert actual_code == expected_code
```
## Deep 深入更解
>[!tip] 深入项目架构、源码等

## Reference 引用参考
>[!tip] 参考链接、资料等