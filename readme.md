# 时光留痕

## 项目介绍
如果超过24小时没人在留言板留言就会自动删除留言板中的所有历史记录

## 技术实现
- 前端：HTML5 + CSS3 + JavaScript，实现响应式设计
- 后端：Java Spring Boot，提供API接口
- 数据库：MySQL，存储留言和用户信息

## 如何启动项目
1. **创建数据库**：
   - 运行`src/main/resources/sql/schema.sql`文件，创建数据库和表结构
2. **修改数据库连接**：
   - 根据你的MySQL数据库配置，修改`src/main/resources/application.yml`中的数据库连接信息
3. **启动后端**：
   - 使用Maven构建并运行项目：`mvn spring-boot:run`
   - 或者通过IDE直接运行`TimeCapsuleApplication.java`
4. **访问前端**：
   - 打开浏览器访问`http://localhost:8999`即可使用本应用

![image](https://github.com/user-attachments/assets/3027f4a0-7398-4744-9963-dc6d040b7e80)

