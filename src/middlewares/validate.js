// middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  console.log('body :',req.body)
  const { error } = schema.validate(req.body);
  if (error) {
    return res.sendError(error.details[0].message,400);
  }
  next();
};
