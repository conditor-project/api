const Joi = require('joi');

const schema = Joi.array().items(
  Joi.object().keys({
    nestedPaths: Joi.array().items(Joi.string()),
    queryString: Joi.string().required()
  })
);

const attempt = (ast) => {
  return Joi.attempt(ast, schema);
};

module.exports = { schema, attempt };
