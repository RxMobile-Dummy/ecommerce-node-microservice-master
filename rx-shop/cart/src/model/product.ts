import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ProductAttrs {
    id: string,
    name: string,
    price: number,
    quantity: number,
    available : boolean
}

export interface ProductDoc extends mongoose.Document {
    name: string,
    price: number,
    quantity: number
    version: number,
    available : boolean
}

interface ProductModel extends mongoose.Model<ProductDoc> {
    build(attr: ProductAttrs): ProductDoc;
}

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    available :{ type: Boolean, required: true },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

productSchema.set('versionKey', 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attr: ProductAttrs) => {
    return new Product({
        _id: attr.id,
        name: attr.name,
        price: attr.price,
        quantity: attr.quantity,
        available : attr.available
    });
}




const Product = mongoose.model<ProductDoc, ProductModel>('Products', productSchema);

export { Product }