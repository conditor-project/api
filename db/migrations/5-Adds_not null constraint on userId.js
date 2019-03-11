'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "UserId" on table "DuplicatesValidations"
 * changeColumn "UserId" on table "DuplicatesValidations"
 *
 **/

var info = {
    "revision": 5,
    "name": "Adds not null constraint on userId",
    "created": "2019-03-11T15:44:26.523Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "UserId",
            {
                "type": Sequelize.INTEGER,
                "field": "UserId",
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "Users",
                    "key": "id"
                },
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "UserId",
            {
                "type": Sequelize.INTEGER,
                "field": "UserId",
                "onUpdate": "CASCADE",
                "onDelete": "NO ACTION",
                "references": {
                    "model": "Users",
                    "key": "id"
                },
                "allowNull": false
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
