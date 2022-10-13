import { BadRequestError } from '@rx-demo/common';
import { Request, Response } from 'express';
import { Cart } from '../model/cart';
import { Product } from '../model/product';

const success = 'success';

export class CartDomain {

    // SHOW CART
    static async showCart(req: Request, res: Response) {
        try {
            const cart = await Cart.findOne({ userId: req.currentUser?.id }).populate('cartList._id', '-version -_id -quantity');
            var subTotal : number = 0;
            if (!cart) {
                return res.status(200).send({})
            }

            if (cart.cartList.length == 0) {
                return res.status(200).send({})
            }

            cart.cartList.forEach(element => {
                const productPrice = Number(element._id.price);
                const productQuantity = Number(element.purchaseQuantity);
                subTotal = subTotal + (productPrice * productQuantity) ;
            });

            const response = {cart : cart , subTotal : subTotal}

            return res.status(200).send(response);
        } catch (error: any) {
            throw new Error(error)
        }

    }

    //ADD-TO-CART
    static async addToCart(req: Request, res: Response) {
        const productId = req.body.productId;
        const checkProduct = await Product.findById(productId);

        if (!checkProduct) {
            throw new BadRequestError('invalid product');
        }

        const checkQuantity = await Product.findOne({ $and: [{ id: productId }, { quantity: { $gte: 1 } }] });
        if (!checkQuantity) {
            throw new BadRequestError('product out of stock');
        }

        const cart = await Cart.findOne({ userId: req.currentUser?.id });

        if (!cart) {

            const createCart = Cart.build({
                userId: req.currentUser?.id!,
                cartList: [{ _id: productId, purchaseQuantity: 1 }]
            });
            await createCart.save();

            return res.status(201).send({ addToCart: success });
        }
        else {


            const productCheck = await Cart.findOne({ $and: [{ userId: req.currentUser?.id }, { cartList: { $elemMatch: { _id: productId } } }] });

            if (productCheck) {
                const objIndex = productCheck.cartList.findIndex((element) => element._id == productId);
                const priviousQuantity = Number(productCheck.cartList[objIndex].purchaseQuantity);

                const latestQuantity = await Product.findOne({ $and: [{ id: productId }, { quantity: { $gt: priviousQuantity } }] });

                if (!latestQuantity) {
                    throw new BadRequestError('cant add product to cart because you add maximum available quantity in cart');
                }
                productCheck.cartList[objIndex].purchaseQuantity = priviousQuantity + 1;

                await productCheck.save();

                return res.status(201).send({ addToCart: success });
            }
            else {
                cart.cartList.push({ _id: productId, purchaseQuantity: 1 });
                await cart.save();
                return res.status(201).send({ addToCart: success });
            }

        }

    }

    // REMOVE-FROM_CART
    static async removeFromCart(req: Request, res: Response) {
        const productId = req.body.productId;
        const checkProduct = await Product.findById(productId);

        if (!checkProduct) {
            throw new BadRequestError('invalid product');
        }

        const productCheckInCart = await Cart.findOne({ $and: [{ userId: req.currentUser?.id }, { cartList: { $elemMatch: { _id: productId } } }] });
        if (!productCheckInCart) {
            throw new BadRequestError('cannot remove product from cart becasue this product is not available in your cart');
        }

        const objIndex = productCheckInCart.cartList.findIndex((element) => element._id == productId);
        const priviousQuantity = Number(productCheckInCart.cartList[objIndex].purchaseQuantity);

        if (priviousQuantity == 1) {
            productCheckInCart.cartList.splice(objIndex, 1) // 2nd parameter means remove one item only
            await productCheckInCart.save()
            return res.status(201).send({ removeFromCart: success })
        }

        productCheckInCart.cartList[objIndex].purchaseQuantity = priviousQuantity - 1;
        await productCheckInCart.save();
        return res.status(201).send({ removeFromCart: success })
    }

}