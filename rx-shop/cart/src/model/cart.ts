import mongoose from "mongoose"
import { ProductDoc } from "./product"

interface CartAttrs {
    userId: string
    cartList: { _id: ProductDoc, purchaseQuantity: number }[]
}
interface CartDoc extends mongoose.Document {
    userId: string
    cartList: { _id: ProductDoc, purchaseQuantity: number }[]
}

interface CartModel extends mongoose.Model<CartDoc> {
    build(attrs: CartAttrs): CartDoc
}

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    cartList: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        purchaseQuantity: { type: Number, required: true }
    }]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
});

cartSchema.statics.build = (attrs: CartAttrs) => {
    return new Cart(attrs);
}


const Cart = mongoose.model<CartDoc, CartModel>('Cart', cartSchema);


export { Cart }