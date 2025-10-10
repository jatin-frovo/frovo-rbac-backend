import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super admin', 'operational manager', 'field agent', 'support agent', 'warehouse manager', 'delivery personnel', 'auditor'], default: 'customer'}
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
export default User;