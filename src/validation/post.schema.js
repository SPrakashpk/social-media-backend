import Joi from 'joi';

export const postValidationSchema = Joi.object({
    text: Joi.string().max(3000).allow('').optional(),
    userId: Joi.string().required()
});

export const commentValidationSchema = Joi.object({
    text: Joi.string().max(3000).allow('').optional(),
    userId: Joi.string().required(),
    postId: Joi.string().required(),
});