import { inject, injectable } from 'inversify';
import Bull from 'bull';
import { IImageProcessingWorker, IImageProcessorService, IProcessingRequestRepository, IProductRepository } from '../image-processor.interfaces';
import { ImageProcessorTypes } from '../image-processor.types';
import ProcessingStatusEnums from '../../../common/enums/status.enums';
import ProductModel from '../models/product.model';
import axios from 'axios';
import ErrorHandler from '../../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../../common/errors/error-enums';
import sharp from 'sharp';
import { CommonTypes } from '../../../common/common.types';
import { ICloudinaryProvider } from '../../../common/common.interfaces';
import path from 'path';
@injectable()
export default class ImageProcessingWorker implements IImageProcessingWorker {
    constructor(
        @inject(ImageProcessorTypes.ProcessingRequestRepository) private processingRequestRepository: IProcessingRequestRepository,
        @inject(ImageProcessorTypes.ProductRepository) private productRepository: IProductRepository,
        @inject(ImageProcessorTypes.ImageProcessorService) private imageProcessorService: IImageProcessorService,
        @inject(CommonTypes.CloudinaryProvider) private cloudinaryProvider: ICloudinaryProvider,
    ) {}

    async processJobs(job: Bull.Job) {
        const jobPayload = job.data;
        try {
            await this.imageProcessorService.updateProcessingRequestStatus(jobPayload.processingRequestId, ProcessingStatusEnums.PROCESSING);
            const products: ProductModel[] = jobPayload.products;
            for (const product of products) {
                const outputImageUrls: string[] = [];
                const inputImages = product.inputImageUrls;
                for (const inputImage of inputImages) {
                    const processedImageUrl = await this.processImage(inputImage);
                    outputImageUrls.push(processedImageUrl);
                }
                await this.productRepository.updateProduct(product.id, { outputImageUrls });
            }
            if (jobPayload.webhookUrl) {
                await this.notifyWebhook(jobPayload);
              }
            await this.imageProcessorService.updateProcessingRequestStatus(jobPayload.processingRequestId, ProcessingStatusEnums.COMPLETED);
        } catch (error) {
            if (job.attemptsMade === 2) {
                await this.imageProcessorService.updateProcessingRequestStatus(jobPayload.processingRequestId, ProcessingStatusEnums.FAILED, (error as Error).message);
            } else {
                await this.imageProcessorService.updateProcessingRequestStatus(jobPayload.processingRequestId, ProcessingStatusEnums.RETRYING);
            }
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Failed to process image! Error: ${error}`);
        }
    }

    private async processImage(imageUrl: string): Promise<string> {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        if (response.status !== 200) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Failed to fetch image! ${response.statusText}`);
        }
        const imageBuffer = Buffer.from(response.data, 'binary');
        const processedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 50 })
        .toBuffer();
        const fileName = `processed-${path.basename(imageUrl)}`;
        const processedImageUrl = await this.cloudinaryProvider.uploadImage(processedBuffer, fileName);
        return processedImageUrl;
    }

    private async notifyWebhook(jobPayload: any): Promise<void> {
        try {
          await axios.post(jobPayload.webhookUrl, {
            requestId: jobPayload.processingRequestId,
            products: jobPayload.products,
          });
        } catch (error) {
          throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, `Error while notifying webhook! Error: ${error}`);
        }
      } 
}