/**
 * Created by kadoufall on 2017/6/7.
 */
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
    host: 'http://118.89.203.58:9200/',
});

const connect = async (ctx, next) => {
    await client.ping({
        requestTimeout: 3000
    }).then(data => {
        console.log('All is well');
        ctx.response.body = `<h1>Connect to Elasticsearch Server Success</h1>
        <p><a href="/">Go back</a></p>`;
    }).catch(error => {
        console.trace('elasticsearch cluster is down!');
        console.log(error);
        ctx.response.body = `<h1>Connect error, please try again</h1>
        <p><a href="/">Try again</a></p>`;
    });
};

const index = async (ctx, next) => {
    ctx.response.body = `
        <h3><a href="/connect">点击测试连接</a></h3>
        
        <h1>查询</h1>
        <form action="/search" method="get">
            <p>Type:
                <select name="type">
                <option value="author">作者</option>
                <option value="title">书名</option>
                <option value="abstract">摘要</option>
                </select>
            </p> 
            <p>Search <input type="text" name="search" placeholder="请输入要搜索的内容"></p>
            <p><input type="submit" value="搜索"></p>
        </form>        
        
        <h1>增加书籍</h1>
        <form action="/addBook" method="post">
            <p>Title: <input name="title" placeholder="请输入书名"></p>
            <p>Author: <input name="author" placeholder="请输入作者名"></p>
            <p>Abstract: <textarea rows="5"  cols="30" name="abstract" placeholder="请输入摘要"></textarea></p>     
            <p><input type="submit" value="增加"></p>
        </form>              
    `;
};

const addBook = async (ctx, next) => {
    // console.log(ctx.request.body);
    const
        title = ctx.request.body.title || '',
        abstract = ctx.request.body.abstract || '',
        author = ctx.request.body.author || '';

    ctx.response.body = await client.exists({
        index: 'book',
        type: 'category1',
        id: title + '-' + author
    }).then(exists => {
        if (exists === true) {
            return `<h1>The book exists. Please add another one!</h1>
                                 <p><a href="/">Go back</a></p>`;
        } else {
            return client.create({
                index: 'book',
                type: 'category1',
                id: title + '-' + author,
                body: {
                    title: title,
                    abstract: abstract,
                    author: author
                }
            }).then(response => {
                // console.log(response);
                return `<h1>Add success!</h1>
                                     <p><a href="/">Go back</a></p>`;
            }).catch(error => {
                console.log(error);
                return `<h1>Some error occurred. Please try again!</h1>
                                 <p><a href="/">Try again</a></p>`;
            });
        }
    }).catch(error => {
        console.log(error);
        return `<h1>Some error occurred. Please try again!</h1>
                                 <p><a href="/">Try again</a></p>`;
    });
};

const search = async (ctx, next) => {
    const search = ctx.request.query.search || '';
    const type = ctx.request.query.type;
    const q = type + ':' + search;
    // console.log(q);
    await client.search({
        analyzer: 'ik_max_word',
        q: q
    }).then(response => {
        //console.log(response);
        let books = response.hits.hits.map(hit => {
            return hit['_source'];
        });

        //console.log(books);

        ctx.render('search', {books});
    }).catch(error => {
        console.log(error);
        ctx.response.body = `<h1>Some error occurred. Please try again!</h1>
                                 <p><a href="/">Try again</a></p>`;
    });

};

module.exports = {
    'GET /': index,
    'POST /addBook': addBook,
    'GET /connect': connect,
    'GET /search': search
};