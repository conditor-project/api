'use strict';

const Joi = require('@hapi/joi'),
      _   = require('lodash')
;

const validator = module.exports;

const idConditor = Joi.string().token();
const report = Joi.object().keys({
                                   recordId: idConditor.required(),
                                   comment : Joi.string().max(400,'utf8')
                                 });


validator.schema = Joi.object()
                      .keys({
                              recordId           : idConditor.required(),
                              reportDuplicates   : Joi.array().items(report, idConditor).single(),
                              reportNonDuplicates: Joi.array().items(report, idConditor).single()
                            })
                      .or('reportDuplicates', 'reportNonDuplicates')
;


validator.validate = (duplicatesValidations) => {
  return Joi.validate(duplicatesValidations, validator.schema, {abortEarly: false});
};


validator.normalize = (duplicatesValidations) => {
  return _(duplicatesValidations)
    .pick(['reportDuplicates', 'reportNonDuplicates'])
    .mapValues((reports) => {
      return _.map(reports, (report) => {
        if (_.isPlainObject(report)) return report;
        return {recordId: report};
      });
    })
    .set('recordId', duplicatesValidations.recordId)
    .value()
    ;
};
