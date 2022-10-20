import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ProductAttrs {
    name: string,
    price: number,
    userId: string,
    quantity: number,
    available : boolean
}

interface ProductDoc extends mongoose.Document {
    name: string,
    price: number,
    userId: string,
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
    userId: { type: String, required: true },
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
    return new Product(attr);
}

const Product = mongoose.model<ProductDoc, ProductModel>('Products', productSchema);

export { Product }