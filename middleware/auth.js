import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { userId, role } = await jwt.verify(token, process.env.JWT_SECRET);
        req.userId = userId;
        req.role = role;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

export default authMiddleware;