'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "firstname" from table "Users"
 * removeColumn "lastname" from table "Users"
 * removeColumn "role" from table "Users"
 * addColumn "UserId" to table "DuplicatesValidations"
 * changeColumn "email" on table "Users"
 * changeColumn "email" on table "Users"
 * changeColumn "email" on table "Users"
 *
 **/

var info = {
    "revision": 4,
    "name": "Refact Users and add email",
    "created": "2019-03-08T10:06:09.319Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["Users", "firstname"]
    },
    {
        fn: "removeColumn",
        params: ["Users", "lastname"]
    },
    {
        fn: "removeColumn",
        params: ["Users", "role"]
    },
    {
        fn: "addColumn",
        params: [
            "DuplicatesValidations",
            "UserId",
            {
                "type": Sequelize.INTEGER,
                "field": "UserId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "Users",
                    "key": "id"
                },
                "allowNull": true
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "Users",
            "email",
            {
                "type": Sequelize.STRING,
                "field": "email",
                "unique": true,
                "allowNull": false,
                "validate": {
                    "isEmail": true
                }
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "Users",
            "email",
            {
                "type": Sequelize.STRING,
                "field": "email",
                "unique": true,
                "allowNull": false,
                "validate": {
                    "isEmail": true
                }
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "Users",
            "email",
            {
                "type": Sequelize.STRING,
                "field": "email",
                "unique": true,
                "allowNull": false,
                "validate": {
                    "isEmail": true
                }
            }
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
