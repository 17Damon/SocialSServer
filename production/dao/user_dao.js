/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';

//加载util路径

module.paths.push('./util');
//permission to kill
var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('database');

//userDao
function userDao(req, res, module, method, params) {
    //code

    //promise
    console.log('userDao');
    return dao[method](req, res, module, method, params);
}

//功能Dao--start--
var dao = {};

//getUserByOpenid
dao.getUserByOpenid = function (req, res, module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('userDao-getUserByOpenid');
    if (params.openid) {
        var openid = params.openid;
        console.log('openid:' + openid);
        var AQL = '\n        For i in user\n            FILTER i.openid == \'' + openid + '\' \n            return UNSET(i,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.openid Undefined!Check it!';
    }
};

//getUserByCode
dao.getUserByCode = function (req, res, module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('userDao-getUserByCode');
    if (params.code) {
        var code = params.code;
        console.log('code:' + code);
        var AQL = '\n        For i in user\n            FILTER i.code == \'' + code + '\' \n            return UNSET(i,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.code Undefined!Check it!';
    }
};

//insert
dao.insert = function (req, res, module, method, params) {
    //some code
    console.log('userDao-insert');
    if (params.user) {
        var user = JSON.stringify(params.user);
        var AQL = '\n            INSERT ' + user + '\n            IN user\n            return NEW\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.user Undefined!Check it!';
    }
};

//updateCode
dao.updateCode = function (req, res, module, method, params) {
    //some code
    console.dir(params);
    console.log('userDao-updateCode');
    if (params.openid && params.code) {
        var openid = params.openid;
        var code = params.code;
        console.log('code:' + code);
        console.log('openid:' + openid);
        var AQL = '\n        For i in user\n            FILTER i.openid == \'' + openid + '\' \n            UPDATE i WITH {code: \'' + code + '\' } IN user\n            return UNSET(NEW,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.openid or params.code Undefined!Check it!';
    }
};

//update
dao.update = function (req, res, module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('userDao-update');
    if (params.user) {
        var openid = params.user.openid;
        console.log('openid:' + openid);
        var AQL = '\n        For i in user\n            FILTER i.openid == \'' + openid + '\' \n            UPDATE i WITH ' + JSON.stringify(params.user) + ' IN user\n            return UNSET(i,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.openid Undefined!Check it!';
    }
};

//edit
dao.edit = function (req, res, module, method, params) {
    //some code

    //promise
    return 'edit';
};

//move
dao.move = function (req, res, module, method, params) {
    console.log('userDao-move');

    //returns an array of result.
    return db.query('\n            For i in five\n            limit 0,100\n            return i\n            ').then(function (cursor) {
        return cursor.all();
    });
};

//deleteUserByOpenid
dao.deleteUserByOpenid = function (req, res, module, method, params) {
    //some code
    if (params.openid) {
        var openid = params.openid;
        var AQL = '\n            FOR u IN user\n            FILTER u.openid == \'' + openid + '\'\n            REMOVE u IN user\n            RETURN OLD\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.user Undefined!Check it!';
    }
};

//queryAql
dao.queryAql = function (req, res, module, method, params) {
    //some code

    console.log('userDao-queryAql');
    var aqlStr = '199';
    console.log('aqlStr:' + aqlStr);
    var AQL = '\n        For i IN five \n        FILTER i.value == \'199\' \n        UPDATE i WITH { value: \'250\'} IN five \n        return UNSET(NEW,@tokill)\n        ';
    console.log('AQL:' + AQL);
    //returns an array of result.
    return db.query(AQL, tokill).then(function (cursor) {
        return cursor.all();
    });
};
//功能Dao---end---

//return
module.exports = userDao;