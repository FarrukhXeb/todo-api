const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
  }),
};

const update = {
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    dueDate: Joi.date(),
    status: Joi.valid('incomplete', 'complete', 'in-progress'),
  }),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  create,
  update,
};
