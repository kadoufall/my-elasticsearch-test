# Web Homework 2
- 使用`Elasticsearch`和`Koa`做的一个图书数据库的demo
- 支持添加书籍，按作者、书名或摘要搜索
- node v8.0.0
- 运行方式 ↓
> npm install

> npm start

> http://localhost:3000/

- 初始设置了十条左右的数据，测试的时候可以尝试以下搜索

| Type | Search Content |
|: --- :|:--- :| 
| 作者 | 严歌苓 |
| 作者 | 贾平凹 |
| 书名 | 白鹿原 |
| 摘要 | 文学奖 |

---
下面是对`Elasticsearch`的一些理解

## Elasticsearch

### What & Why
- `Elasticsearch`是一个基于`Lucene`构建的开源、分布式、`RESTful`接口全文搜索引擎。同时也是一个分布式文档数据库
- `Elasticsearch`有**高可用性**：提供复制（`replica`）机制，一个分片（`shared`）可以复制多个，保证了在一台服务器宕机后仍可提供服务，集群仍可使用
- `Elasticsearch`有**横向可拓展性**：增加一台新的服务器进入集群很简单，不需要对原来架构进行改动
- `Elasticsearch`有**分片机制提供的更好的分布性**：同一索引分为多个分片，然后提升处理效率。类似于`HDFS`的块机制

---

### Lucene
- `Lucene`是一个全文搜索引擎开源库。全文搜索，顾名思义，就是在目标系统中针对某个关键词进行搜索。`Elasticsearch`底层是基于`Lucene`
- 在一般的`MySQL`数据库中，这种全文搜索会使用类似于`like`这样的`sql`语句，这样搜索的效率就会很低
- 针对全文搜索这样的应用场景，需要根据属性的值来查找记录，而不是由记录来确定属性值。这种索引方式称为**倒排索引**
#### 倒排索引
> 例句
> 1. I am from Fudan University, majoring software engineering. 
> 2. He is from Shanghai Jiaotong University, majoring electrical engineering.
- 提取关键词
    - 进行分词，中文分词则需要特殊的分词器
    - 去掉`from`，`am`, `is`这种没有实际意义的词
    - 统一大小写
    - 还原动词，比如`majoring`还原成`major`
    - 去除标点符号
    - 提取后的关键词
        ```
        [i], [from], [fudan], [university], [major], [software], [engineering]

        [he], [from], [shanghai], [jiaotong], [university], [major], [electrical], [engineering]
        ```
- 建立倒排索引

| 关键词 | 语句号 [出现频率] | 出现位置 |
|:------|:------|:----|
| engineering | 1[1] <br /> 2[1] | 7 <br /> 8 |
| electrical | 2[1] | 7 |
| from | 1[1] <br /> 2[1] | 2 <br /> 2 |
| fudan | 1[1] | 3 |
| he | 2[1] | 1 |
| i | 1[1] | 1 |
| jiaotong | 2[1] | 4 |
| major | 1[1] <br /> 2[1] | 5 <br /> 6 |
| shanghai | 2[1] | 3 |
| software | 1[1] | 6 |
| university | 1[1] <br /> 2[1] | 4 <br /> 5 |

- 实现
    - 分别有词典文件（`Term Dictionary`），频率文件（`Frequencies`）和位置文件（`Positions`）。其中词典文件还有指向后面两个的指针
- 压缩算法
    - 减少索引文件的大小
    - 压缩关键词：上一个词为`阿拉伯`，那么当前词： `阿拉伯语` => `<3, 语言>` 
    - 压缩数字：只保存与上一个值的差值。上一个id为177，当前id为：`179` => `2`

---

### Elasticsearch术语
#### Input Data
- 文本（text）：普通的非结构化的数据
- 分析（analysis）：将文本转为索引词
- 索引词（term）：不可分割的词语，搜索里面最小单元

#### Structured data
- 索引（index）：`Elasticsearch`用来存储数据的逻辑区域，它类似于关系型数据库中的`database` 概念。一个`index`可以在一个或者多个`shard`上面，同时一个`shard`也可能会有多个`replicas`
- 类型（type）：为了查询需要，一个`index`可能会有多种`document`，也就是`type`. 它类似于关系型数据库中的 `table` 概念。但需要注意，不同`document`里面同名的`field`一定要是相同类型的
- 文档（document）：`Elasticsearch`里面存储的实体数据，类似于关系数据中一个`table`里面的一行数据`row`。 `document`由多个`field`组成
- 映射（mapping）：类似于关系型数据库中的 `schema` 定义概念。存储`field`的相关映射信息，不同`type`会有不同的`mapping`
- 字段（field）：类似于关系型数据库的`column`。可以是一个简单的值，或者是一个数组或对象的嵌套结构

#### Server
- 节点（node）: 一个server实例
- 集群（cluster）：多个node组成cluster
- 分片（shard）：数据分片，一个`index`可能会有多个`shards`，不同`shards`可能在不同`nodes`
- 复制（replica）：`shard`的备份，有一个主分片`primary shard`，其余的叫做副本分片`replica shards`

---

### Elasticsearch环境搭建与实践
- Ubuntu Server 16.04
- http://118.89.203.58:9200
- 索引分词器：[IK Analysis for Elasticsearch](https://github.com/medcl/elasticsearch-analysis-ik)
- 使用[elasticsearch-js](https://github.com/elastic/elasticsearch-js)与`Elasticsearch`服务器进行通讯
- 参考资料
    - [Elasticsearch技术解析与实战](http://www.hzmedia.com.cn/books11117891)
    - [elasticsearch-note](https://github.com/siddontang/elasticsearch-note)
---

## Koa
- 相比`express`，`Koa`主要解决了回调的问题，使用ES7的新关键字`async`和`await`实现异步操作
- homework中尝试搭建了最基础的`Koa`服务器，使用了[koa-bodyparser](https://github.com/koajs/bodyparser)和[koa-router](https://github.com/alexmingoia/koa-router)中间件实现了路由分配并简化了http操作
- 使用了[art-template](https://github.com/aui/art-template)模版引擎尝试了服务器端渲染
