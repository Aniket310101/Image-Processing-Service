import mongoose, { Schema } from 'mongoose';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error-enums';
import productSchema from './schemas/product.schema';
import processingRequestSchema from './schemas/processing-request.schema';
import { injectable } from 'inversify';

@injectable()
export default class BaseDatastore {

    static productsDB: mongoose.Model<typeof productSchema>;
    static processingRequestsDB: mongoose.Model<typeof processingRequestSchema>;
    async initializeDB() {
        const dbUrl: string = process.env.DB_CONNECTION_STRING as string;
        try {
            await mongoose.connect(dbUrl);
        } catch (err) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Could Not Connect to DB!');
        }
        try {
            await this.initializeDBModels();
        } catch (err) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in intializing DB models!');
        }
    }

    private async initializeDBModels() {
        BaseDatastore.productsDB = mongoose.model<typeof productSchema>(
            'products', new Schema(productSchema, {timestamps: true, _id: true, id: true})
        );

        BaseDatastore.processingRequestsDB = mongoose.model<typeof processingRequestSchema>(
            'processing_requests', new Schema(processingRequestSchema, {timestamps: true, _id: true, id: true})
        );
    } 
}