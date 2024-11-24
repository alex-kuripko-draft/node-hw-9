const roleMiddleware = (role) => (req, res, next) => {
    if (req.role !== role) {
        return res.status(403).json({ error: 'Access Denied' });
    }
    next();
};

export default roleMiddleware;