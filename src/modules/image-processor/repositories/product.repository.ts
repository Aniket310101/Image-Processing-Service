import BaseDatastore from "../../../common/datastore/base-datastore";
import { ErrorCodeEnums } from "../../../common/errors/error-enums";
import ErrorHandler from "../../../common/errors/error-handler";
import { IProductRepository } from "../image-processor.interfaces";
import { injectable } from "inversify";
import ProductModel from "../models/product.model";

@injectable()
export default class ProductRepository extends BaseDatastore implements IProductRepository {

    async createProduct(product: ProductModel): Promise<ProductModel> {
        let savedProduct;
        try {
            savedProduct = await new BaseDatastore.productsDB(product).save();
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in creating product!');
        }
        return new ProductModel(savedProduct);
    }

    async getProductById(id: string): Promise<ProductModel> {
        try {
            const product = await BaseDatastore.productsDB.findById(id);
            return new ProductModel(product);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in getting product by ID!');
        }
    }

    async updateProduct(id: string, data: ProductModel): Promise<ProductModel> {
        try {
            const product = await BaseDatastore.productsDB.findByIdAndUpdate(id, data);
            return new ProductModel(product);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in updating product!');
        }
    }

    async getProductsByProcessingRequestId(processingRequestId: string): Promise<ProductModel[]> {
        try {
            const products = await BaseDatastore.productsDB.find({ processingRequestId });
            return products.map((product) => new ProductModel(product));
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in getting products by processing request ID!');
        }
    }
}