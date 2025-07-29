// middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  console.log('body :',req.body)
  console.log("Validation middleware triggered")
  const { error } = schema.validate(req.body);
  if (error) {
    console.log('Validation Error:', error.message); // Add this log
    return res.sendError(error.details[0].message,400);
  }
  next();
};
