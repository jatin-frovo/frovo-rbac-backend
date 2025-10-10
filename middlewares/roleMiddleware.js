const authorizeRoles = (...allowedRoles)=>{
    return (req, res, next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({ message: 'Forbidden: You do not have the required role to access this resource' });
        }
        next();
    }
}
export default authorizeRoles;
