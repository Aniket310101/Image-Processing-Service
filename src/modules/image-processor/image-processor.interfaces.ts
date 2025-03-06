import Bull from "bull";
import BaseDatastore from "../../common/datastore/base-datastore";
import ProcessingStatusEnums from "../../common/enums/status.enums";
import ProcessingRequestModel from "./models/processing-request.model";
import ProductModel from "./models/product.model";

export interface IImageProcessorService {
    uploadFile(file: Express.Multer.File, webhookUrl?: string): Promise<ProcessingRequestModel>;
    updateProcessingRequestStatus(processingRequestId: string, status: ProcessingStatusEnums, additionalInfo?: string): Promise<ProcessingRequestModel>;
    getProcessingRequestById(processingRequestId: string): Promise<ProcessingRequestModel>;
    getProductsByProcessingRequestId(processingRequestId: string): Promise<ProductModel[]>;
}

export interface IProcessingRequestRepository extends BaseDatastore {
    createProcessingRequest(fileName: string, status?: ProcessingStatusEnums): Promise<ProcessingRequestModel>;
    getProcessingRequestById(id: string): Promise<ProcessingRequestModel>;
    updateProcessingRequestStatus(id: string, status: ProcessingStatusEnums, additionalInfo?: string): Promise<ProcessingRequestModel>;
}

export interface IProductRepository extends BaseDatastore {
    createProduct(product: ProductModel): Promise<ProductModel>;
    getProductById(id: string): Promise<ProductModel>;
    updateProduct(id: string, data: ProductModel): Promise<ProductModel>;
    getProductsByProcessingRequestId(processingRequestId: string): Promise<ProductModel[]>;
}

export interface IImageProcessingWorker {
    processJobs(job: Bull.Job): Promise<void>;
}

export interface ICsvHelper {
    parseCSVBuffer(file: Express.Multer.File): Promise<ProductModel[]>;
}