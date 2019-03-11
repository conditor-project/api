'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "comment" to table "DuplicatesValidations"
 * changeColumn "targetSource" on table "DuplicatesValidations"
 * changeColumn "targetSourceId" on table "DuplicatesValidations"
 * changeColumn "initialSource" on table "DuplicatesValidations"
 * changeColumn "initialSourceId" on table "DuplicatesValidations"
 * changeColumn "isDuplicate" on table "DuplicatesValidations"
 *
 **/

var info = {
    "revision": 2,
    "name": "addComment",
    "created": "2019-03-04T15:23:02.960Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "DuplicatesValidations",
            "comment",
            {
                "type": Sequelize.STRING,
                "field": "comment"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "targetSource",
            {
                "type": Sequelize.STRING,
                "field": "targetSource",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "targetSourceId",
            {
                "type": Sequelize.STRING,
                "field": "targetSourceId",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "initialSource",
            {
                "type": Sequelize.STRING,
                "field": "initialSource",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "initialSourceId",
            {
                "type": Sequelize.STRING,
                "field": "initialSourceId",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "DuplicatesValidations",
            "isDuplicate",
            {
                "type": Sequelize.BOOLEAN,
                "field": "isDuplicate",
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
