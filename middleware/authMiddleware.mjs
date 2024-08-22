export default (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    // Perform token validation
    // If valid, proceed
    next();
  } else {
    res.sendStatus(403); // Forbidden
  }
};
