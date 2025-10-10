import express from 'express';
import verifyToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';
const router = express.Router();

//only for super admin
router.get('/super-admin',verifyToken, authorizeRoles("super-admin"), (req, res) => {
    res.json({ message: 'Super Admin Access' });
});

//only for operational manager
router.get('/operational-manager', verifyToken,authorizeRoles("operational-manager", "super-admin"), (req, res) => {
    res.json({ message: 'Operational Manager Access' });
});

//only for field agent
router.get('/field-agent', verifyToken, authorizeRoles("field-agent", "operational-manager", "super-admin"),(req, res) => {
    res.json({ message: 'Field Agent Access' });
});

//only for support agent
router.get('/support-agent', verifyToken, authorizeRoles("support-agent", "field-agent", "operatinal-manager", "super-admin"), (req, res) => {
    res.json({ message: 'Support Agent Access' });
});

//only for warehouse manager
router.get('/warehouse-manager',verifyToken,authorizeRoles("support-agent", "field-agent", "operatinal-manager", "super-admin","warehouse-manager"), (req, res) => {
    res.json({ message: 'Warehouse Manager Access' });
});

//only for delivery personnel
router.get('/delivery-personnel', verifyToken, authorizeRoles("support-agent", "field-agent", "operatinal-manager", "super-admin","warehouse-manager", "delivery-personal"), (req, res) => {
    res.json({ message: 'Delivery Personnel Access' });
});

//only for auditor
router.get('/auditor',verifyToken,authorizeRoles("support-agent", "field-agent", "operatinal-manager", "super-admin","warehouse-manager", "delivery-personal","auditor"), (req, res) => {
    res.json({ message: 'Auditor Access' });
});

//only for customer
router.get('/customer', verifyToken, authorizeRoles("support-agent", "field-agent", "operatinal-manager", "super-admin","warehouse-manager", "delivery-personal","auditor","customer"), (req, res) => {
    res.json({ message: 'Customer Access' });
});
export default router;