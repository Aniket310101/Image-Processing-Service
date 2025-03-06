import { inject, injectable } from "inversify";
import { ICsvHelper, IImageProcessorService, IProcessingRequestRepository, IProductRepository } from "../image-processor.interfaces";
import * as XLSX from 'xlsx';
import ErrorHandler from "../../../common/errors/error-handler";
import { ErrorCodeEnums } from "../../../common/errors/error-enums";
import { ImageProcessorTypes } from "../image-processor.types";
import ProductModel from "../models/product.model";
import ProcessingStatusEnums from "../../../common/enums/status.enums";
import ProcessingRequestModel from "../models/processing-request.model";
import { CommonTypes } from "../../../common/common.types";
import { IBullQueueProvider } from "../../../common/common.interfaces";

@injectable()
export default class ImageProcessorService implements IImageProcessorService {
    constructor(
        @inject(ImageProcessorTypes.CsvHelper) private csvHelper: ICsvHelper,
        @inject(ImageProcessorTypes.ProcessingRequestRepository) private processingRequestRepository: IProcessingRequestRepository,
        @inject(ImageProcessorTypes.ProductRepository) private productRepository: IProductRepository,
        @inject(CommonTypes.BullQueueProvider) private queueProvider: IBullQueueProvider
    ) {}

    async uploadFile(file: Express.Multer.File, webhookUrl?: string): Promise<ProcessingRequestModel> {
        let processingRequest = await this.processingRequestRepository.createProcessingRequest(file.originalname);
        const processingRequestId = processingRequest.id;
        try {
            const products = await this.csvHelper.parseCSVBuffer(file);
            const savedProducts: ProductModel[] = [];
            for (const product of products) {
                product.processingRequestId = processingRequestId;
                const savedProduct = await this.productRepository.createProduct(product);
                savedProducts.push(savedProduct);
            }
            const queueJobPayload = {
                processingRequestId: processingRequestId,
                products: savedProducts,
                ...(webhookUrl && { webhookUrl })
            }
            await this.queueProvider.addJob('image-processor', queueJobPayload, processingRequestId);
        } catch (error) {
            processingRequest = await this.updateProcessingRequestStatus(processingRequest.id, ProcessingStatusEnums.FAILED, (error as Error).message);
        }
        return processingRequest;
    }

    async getProductsByProcessingRequestId(processingRequestId: string): Promise<ProductModel[]> {
        return await this.productRepository.getProductsByProcessingRequestId(processingRequestId);
    }

    async updateProcessingRequestStatus(processingRequestId: string, status: ProcessingStatusEnums, additionalInfo?: string): Promise<ProcessingRequestModel> {
        const processingRequest = await this.processingRequestRepository.updateProcessingRequestStatus(processingRequestId, status, additionalInfo);
        return {...processingRequest, ...{status}};
    }

    async getProcessingRequestById(processingRequestId: string): Promise<ProcessingRequestModel> {
        const processingRequest = await this.processingRequestRepository.getProcessingRequestById(processingRequestId);
        return {
            status: processingRequest.status,
            ...(processingRequest.additionalInfo && { additionalInfo: processingRequest.additionalInfo })
        };
    }
}