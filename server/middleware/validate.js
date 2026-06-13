const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: messages,
      });
    }

    // Assign sanitized value back to request
    req[source] = value;
    next();
  };
};

module.exports = validate;
