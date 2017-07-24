/**
 * Created by zhubg on 2016/10/17.
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { apolloExpress } from 'apollo-server';
import { buildSchema } from 'graphql';
//日期时间工具
var moment = require('moment');
//数据库
var baseDao = require('./dao/base_dao');
const PORT = 80;
var fetch = require('node-fetch');
var app = express();
//开启gzip
// var compression = require('compression');

// compress all requests
// app.use(compression());

app.use('/manager', express.static(path.join(__dirname, '../admin')));
app.use(express.static(path.join(__dirname, '../dist')));

var corsOptions = {
    // origin: 'http://192.168.0.104:8989',
    origin: function (origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const myGraphQLSchema = buildSchema(`
  input MessageInput {
    section: String
    title: String
    detail: String
  }
  
  type Token {
    token: String!
  }
  
  type Message {
    id: ID!
    section: String
    postingtime: String
    title: String
    detail: String

  }
  
  type ItemList {
    section: String!
    list:[Message]
  }

  type Query {
    getMessage(id: ID!): Message
    checkUser(id: ID!,name:String!,password:String!): Token
    getItemList(section:String!): ItemList
  }

  type Mutation {
    createMessage(token: String,input:MessageInput): Token
    updateMessage(id: ID!, input: MessageInput): Message
  }
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
    constructor(id, { section, postingtime, detail }) {
        this.id = id;
        this.section = section;
        this.postingtime = postingtime;
        this.title = title;
        this.detail = detail;
    }
}

class ItemList {
    constructor(section, list) {
        this.section = section;
        this.list = list;
    }
}

class Token {
    constructor(token) {
        this.token = token;
    }
}

var root = {
    getMessage: function ({ id }) {
        // if (!fakeDatabase[id]) {
        //     throw new Error('no message exists with id ' + id);
        // }
        let params = {};
        params.id = id;
        return baseDao('item', 'getItemById', params).then(obj => {
            console.log(obj);
            return new Message(id, obj[0]);
        }).catch(function (e) {
            console.log(e);
        });
    },
    checkUser: function ({ id, name, password }) {
        // if (!fakeDatabase[id]) {
        //     throw new Error('no message exists with id ' + id);
        // }
        let token = require('crypto').randomBytes(10).toString('hex');
        let params = {};
        params.id = id;
        return baseDao('user', 'getUserById', params).then(obj => {
            if (obj[0].name === name && obj[0].password === password) {
                params.token = token;
                return baseDao('user', 'updateTokenById', params).then(obj => {
                    return new Token(obj[0].publishtoken);
                }).catch(function (e) {
                    console.log(e);
                });
                // return new Token(token);
            } else {
                return new Token('PermissionFailed');
            }
            // return new Token(token);
        }).catch(function (e) {
            console.log(e);
        });
    },
    getItemList: function ({ section }) {
        let params = {};
        params.section = section;
        return baseDao('item', 'getListBySection', params).then(obj => {
            return new ItemList(section, obj);
        }).catch(function (e) {
            console.log(e);
        });
    },
    createMessage: function ({ token, input }) {
        // Create a random id for our "database".
        let params = {};
        // fakeDatabase[id] = input;
        params.id = 'manager';
        return baseDao('user', 'getUserById', params).then(obj => {
            if (obj[0].publishtoken === token) {
                let id = require('crypto').randomBytes(10).toString('hex');
                let now = moment().format();
                params.item = input;
                params.item.id = id;
                params.item.postingtime = now;
                return baseDao('item', 'insert', params).then(obj => {
                    return new Token('RightToken');
                }).catch(function (e) {
                    console.log(e);
                });
            } else {
                return new Token('ViolationToken');
            }
        }).catch(function (e) {
            console.log(e);
        });
    },
    updateMessage: function ({ id, input }) {
        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }
        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;
        return new Message(id, input);
    }
};

// app.get('/test', function (req, res, next) {
//     // res.redirect('https://github.com/miss61008596');
//     fetch('http://localhost:3000/graphql', {
//         method: 'POST',
//         body: JSON.stringify(
//             {
//                 "query":`mutation {
//                               createMessage(
//                                     token:"c73d7c821f0eafd9e482",
//                                     input:{
//                                         section: "1234",
//                                         title: "1234",
//                                         detail: "1234"
//                                     }
//                               ) {
//                                 token
//                               }
//                             }`
//             }
//         ),
//         headers: {'Content-Type': 'application/json'}
//     })
//         .then(function (res) {
//             return res.json();
//         }).then(function (json) {
//         console.log(json);
//         res.send(json);
//     });
// });

// app.use('/graphql',bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));

app.use('/graphql', cors(corsOptions), bodyParser.json(), apolloExpress({
    schema: myGraphQLSchema,
    rootValue: root
}));

app.listen(PORT, () => {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});

// app.use('/graphql', cors(corsOptions) ,bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));


// {
//     "query": `mutation {
//                               createMessage(input: {
//                                 author: "andy",
//                                 content: "hope is a good thing",
//                               }) {
//                                 id
//                               }
//                             }`
// }


// app.get('/mine', function (req, res, next) {
//     // res.redirect('https://github.com/miss61008596');
//     res.send(`<html>
// <body>
// <div style="display: flex;flex-direction: row;justify-content: center;align-items: center">
// <div style="display: flex">
// <img style="width: 160px;height: 160px;border-radius: 80px;margin-right: 20px" src="https://avatars2.githubusercontent.com/u/6361237?v=3&s=466" />
// </div>
// <div style="display: flex;flex-direction: column;">
// <h1>个人技术分享</h1>
// <h1>请访问我的github主页</h1><a href="https://github.com/miss61008596">https://github.com/miss61008596</a>
// <h5>QQ:61008596</h5>
// </div>
// </div>
// </body>
// </html>`);
// });