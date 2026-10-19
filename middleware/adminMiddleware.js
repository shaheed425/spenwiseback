/**
 * 🔐 ADMIN MIDDLEWARE
 * - Allows only admin users
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.usertype !== "admin") {
      return res.status(403).json({
        message: "Admin access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error ❌", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default adminMiddleware;
