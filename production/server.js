'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _apolloServer = require('apollo-server');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by zhubg on 2016/10/17.
                                                                                                                                                           */


//数据库
var baseDao = require('./dao/base_dao');
var PORT = 3000;
var fetch = require('node-fetch');
var app = (0, _express2.default)();

app.use(_express2.default.static(_path2.default.join(__dirname, '../dist')));
var whitelist = [];
var corsOptions = {
    // origin: 'http://192.168.0.104:8989',
    origin: function origin(_origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

var myGraphQLSchema = (0, _graphql.buildSchema)('\n  input MessageInput {\n    content: String\n    author: String\n  }\n\n  type Message {\n    id: ID!\n    section: String\n    postingtime: String\n    title: String\n    detail: String\n\n  }\n  \n  type ItemList {\n    section: String!\n    list:[Message]\n  }\n\n  type Query {\n    getMessage(id: ID!): Message\n    getItemList(section:String!): ItemList\n  }\n\n  type Mutation {\n    createMessage(input: MessageInput): Message\n    updateMessage(id: ID!, input: MessageInput): Message\n  }\n');

// If Message had any complex fields, we'd put them on this object.

var Message = function Message(id, _ref) {
    var section = _ref.section;
    var postingtime = _ref.postingtime;
    var detail = _ref.detail;

    _classCallCheck(this, Message);

    this.id = id;
    this.section = section;
    this.postingtime = postingtime;
    this.title = title;
    this.detail = detail;
};

var ItemList = function ItemList(section, list) {
    _classCallCheck(this, ItemList);

    this.section = section;
    this.list = list;
};

var root = {
    getMessage: function getMessage(_ref2) {
        var id = _ref2.id;

        // if (!fakeDatabase[id]) {
        //     throw new Error('no message exists with id ' + id);
        // }
        var params = {};
        params.id = id;
        return baseDao('item', 'getItemById', params).then(function (obj) {
            console.log('let us see what\'in supportlist! ');
            return new Message(id, obj[0]);
        }).catch(function (e) {
            console.log(e);
        });
    },
    getItemList: function getItemList(_ref3) {
        var section = _ref3.section;

        var params = {};
        params.section = section;
        return baseDao('item', 'getListBySection', params).then(function (obj) {
            console.log('let us see what\'in supportlist! ');
            console.log(obj);
            return new ItemList(section, obj);
        }).catch(function (e) {
            console.log(e);
        });
    },
    createMessage: function createMessage(_ref4) {
        var input = _ref4.input;

        // Create a random id for our "database".
        var id = require('crypto').randomBytes(10).toString('hex');

        fakeDatabase[id] = input;
        return new Message(id, input);
    },
    updateMessage: function updateMessage(_ref5) {
        var id = _ref5.id;
        var input = _ref5.input;

        if (!fakeDatabase[id]) {
            throw new Error('no message exists with id ' + id);
        }
        // This replaces all old data, but some apps might want partial update.
        fakeDatabase[id] = input;
        return new Message(id, input);
    }
};

app.get('/test', function (req, res, next) {
    // res.redirect('https://github.com/miss61008596');
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": 'query {\n                              getItemList(section:"\u673A\u6784\u6982\u51B5") {\n                                section\n                                list{\n                                    id\n                                    section\n                                    postingtime\n                                    title\n                                    detail\n                                }\n                              }\n                            }'
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});

// app.use('/graphql',bodyParser.json(), apolloExpress({
//     schema: myGraphQLSchema,
//     rootValue: root
// }));

app.use('/graphql', (0, _cors2.default)(corsOptions), _bodyParser2.default.json(), (0, _apolloServer.apolloExpress)({
    schema: myGraphQLSchema,
    rootValue: root
}));

app.listen(PORT, function () {
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