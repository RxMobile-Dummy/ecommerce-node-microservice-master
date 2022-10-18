import { OrderStatus } from "@rx-demo/common";
import { ObjectId } from "mongodb";
import mongoose from "mongoose"
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { ProductDoc } from "./product";

interface OrderAttrs {
    userId: string,
    status: OrderStatus,
    expiresAt: Date,
    productList: [{ _id: string, purchaseQuantity: number }],
    totalPrice: number
}

interface OrderDoc extends mongoose.Document {
    userId: string,
    status: OrderStatus,
    expiresAt: Date,
    productList: [{ _id: string, purchaseQuantity: number }],
    totalPrice: number,
    version: number
}


interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatus), default: OrderStatus.Created },
    expiresAt: { type: mongoose.Schema.Types.Date },
    productList: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        purchaseQuantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);


orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }