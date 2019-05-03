'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "comment" on table "DuplicatesValidations"
 *
 **/

var info = {
    "revision": 3,
    "name": "change comment length",
    "created": "2019-03-04T15:44:07.439Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "DuplicatesValidations",
        "comment",
        {
            "type": Sequelize.STRING(400),
            "field": "comment"
        }
    ]
}];

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
