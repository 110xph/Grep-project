# DBMind

## Usage

### Dependencics
- Node.js v-12 (https://nodejs.org/zh-cn/)

### Install
```
# clone the repo
$ git clone https://github.com/Thanksyy/DBMind-Web.git

# go into app's directory
$ cd DBMind-Web

# （不是必须）check whether need to install app's dependencies
$ npm install
```
### Usage
```
# In the /DBMind-Web folder
node ./bin/www

# Open your browser
http://localhost:3002/
```

## Development
- /DBAI_Algo/: 把demo需要的python代码写在这个文件夹里面
- /views/: 前端html
- /public/javascripts/： 编写js代码
- /public/stylesheets/ ： 编写css样式

## File Architecture

## Procedure
./db_operation/db.py -- 创建分布式数据库 [w]，数据导入 [w]，创建关系表 [w]，指定划分列 [w]，运行查询 [w]，获得表现 [w]
./algorithm/ -- 动态规划(遍历所有可能组合) [w]，启发式（在列图上找最大生成树） [w]，图压缩 [w]
./public/javascripts -- 通过网页上传算法输入 [w]，展示算法划分结果 [w]，动态展示划分后执行情况 [w]，数据分析 [w]
