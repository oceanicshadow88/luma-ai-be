import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    avatarUrl: string;
    locale: string;
    createdAt: Date;
    active: boolean;
    hashPassword(): Promise<void>;
    validatePassword(inputPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        avatarUrl: {
            type: String,
        },
        locale: {
            type: String,
            required: true,
            default: 'en',
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        }
    },
    { timestamps: true },
);

// use this: no arrow function
userSchema.methods.hashPassword = async function (this: IUser): Promise<void> {
    this.password = await bcrypt.hash(this.password, 12);
}

userSchema.methods.validatePassword = async function (this: IUser, password: string): Promise<void> {
    bcrypt.compare(password, this.password)
}

// Prevent duplicate model registration in development (hot reload)
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default UserModel;