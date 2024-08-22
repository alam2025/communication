import db from "../config/db.mjs";

// @desc    Get all users
// @route   GET /api/users
// @access  Public
export const getUsers = (req, res, next) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
};

// @desc    Create a user
// @route   POST /api/users
// @access  Public
export const createUser = (req, res, next) => {
  const newUser = req.body;
  const sql = "INSERT INTO users SET ?";
  db.query(sql, newUser, (err, result) => {
    if (err) return next(err);
    res.status(201).json({ id: result.insertId, ...newUser });
  });
};
