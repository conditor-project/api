'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "DuplicatesValidations", deps: []
 * createTable "Users", deps: []
 *
 **/

var info = {
    "revision": 1,
    "name": "init",
    "created": "2019-02-27T13:35:24.021Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "DuplicatesValidations",
            {
                "id": {
                    "type": Sequelize.STRING,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true
                },
                "isDuplicate": {
                    "type": Sequelize.BOOLEAN,
                    "field": "isDuplicate"
                },
                "initialSourceId": {
                    "type": Sequelize.STRING,
                    "field": "initialSourceId"
                },
                "initialSource": {
                    "type": Sequelize.STRING,
                    "field": "initialSource"
                },
                "targetSourceId": {
                    "type": Sequelize.STRING,
                    "field": "targetSourceId"
                },
                "targetSource": {
                    "type": Sequelize.STRING,
                    "field": "targetSource"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Users",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "firstname": {
                    "type": Sequelize.STRING,
                    "field": "firstname"
                },
                "lastname": {
                    "type": Sequelize.STRING,
                    "field": "lastname"
                },
                "email": {
                    "type": Sequelize.STRING,
                    "field": "email"
                },
                "role": {
                    "type": Sequelize.STRING,
                    "field": "role"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
