import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describe the properties 
// that are required to create user
interface UserAttrs {
    email: string,
    password: string
}

// An interface that describe the properties 
// that user document has
interface UserDoc extends mongoose.Document {
    email: string,
    password: string
}

// An interface that describe the properties 
// that user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

// Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
}
);

// This is middleware function 
// that convert simple password into hash password on save method
userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hased = await Password.toHash(this.get('password'));
        this.set('password', hased);
    }
    done();
})

// Adding statics property in schema
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

// Model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// Test
// User.build({email : "",password : ""});

export { User };