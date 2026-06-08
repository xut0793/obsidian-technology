2025年12月17日11:19:12  不是所有实体都要一比一映射！Spring Boot 中 Entity/DTO/VO 如何正确使用？[https://mp.weixin.qq.com/s/CxBJmbW6YYY5HlY0IcPUVw](https://mp.weixin.qq.com/s/CxBJmbW6YYY5HlY0IcPUVw)


- DTO（Data Transfer Object）是用来接收请求的，不是万能垃圾桶。DTO 只服务一件事：**让接口入参准确、干净、受控。**
- VO（View Object）用来返回数据，不是照搬数据库字段。因为返回数据有时需要组合、格式化、脱敏等。
- Entity 应该只做一件事：映射数据库表结构，不负责业务、不负责接口。
   
   输入只走dto，输出只走vo，业务（service）围绕entity。
   也有一种：controller 输入dto，输出vo。service 使用bo（business Object)，dao使用entity。
   复杂业务逻辑可以考虑增加领域层 domain，比如订单领域对象 orderDomain，负责订单的支付、状态变更，物流信息等。此时 service 变成了业务流程的编排，比如订单与支付的流程。