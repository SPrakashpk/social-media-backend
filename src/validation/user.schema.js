import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  username: Joi.string().pattern(/^[a-zA-Z0-9_.-]+$/).min(3).max(20).required().messages({
    'string.pattern.base': `"username" can only contain letters, numbers, and underscores`,
  }),
  password: Joi.string().min(6).required(),
});
