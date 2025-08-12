"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Check if user role matches required role
        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Only ${requiredRole} can access this resource`,
            });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
