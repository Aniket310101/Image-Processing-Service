import { Response, Request } from 'express';
import {
  controller,
  interfaces,
  httpPost,
  httpGet,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import ErrorHandler from '../../../common/errors/error-handler';
import { ErrorCodeEnums } from '../../../common/errors/error-enums';
import util from 'util';
import multer from 'multer';
import { IImageProcessorService } from '../image-processor.interfaces';
import { ImageProcessorTypes } from '../image-processor.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadFileResponse:
 *       type: object
 *       properties:
 *         processingRequestId:
 *           type: string
 *           description: Unique identifier for the processing request
 *     ProcessingStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, RETRYING FAILED]
 *         additionalInfo:
 *           type: string
 *           description: Additional information if the processing request
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the product
 *           example: "7dea0569-29a4-4010-b666-eab7b936eb43"
 *         processingRequestId:
 *           type: string
 *           description: ID of the associated processing request
 *           example: "37ef0eb0-c3b1-4475-ab36-d57fd28ea984"
 *         serialNumber:
 *           type: integer
 *           description: Serial number of the product in the CSV
 *           example: 1
 *         productName:
 *           type: string
 *           description: Name or SKU of the product
 *           example: "SKU1"
 *         inputImageUrls:
 *           type: array
 *           description: List of original image URLs
 *           items:
 *             type: string
 *           example: [
 *             "<original-image-url>",
 *             "<original-image-url>",
 *             "<original-image-url>"
 *           ]
 *         outputImageUrls:
 *           type: array
 *           description: List of processed image URLs
 *           items:
 *             type: string
 *           example: [
 *             "<processed-image-url>",
 *             "<processed-image-url>",
 *             "<processed-image-url>"
 *           ]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the product was created
 *           example: "2025-03-06T16:31:08.845Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the product was last updated
 *           example: "2025-03-06T16:31:19.364Z"
 *     GetProductsResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Product'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Image Processor
 *   description: Image processing and CSV file handling endpoints
 */
@controller('/api/image-processor')
export default class ImageProcessorController
  implements interfaces.Controller {
  constructor(
    @inject(ImageProcessorTypes.ImageProcessorService)
    private imageProcessorService: IImageProcessorService,
  ) {}

  /**
   * @swagger
   * /api/image-processor/upload:
   *   post:
   *     summary: Upload a CSV file for processing
   *     tags: [Image Processor]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: CSV file to process (max 500MB)
   *               webhookUrl:
   *                 type: string
   *                 description: Webhook URL for processing notifications
   *                 default: ""
   *             required:
   *               - file
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UploadFileResponse'
   *       400:
   *         description: Invalid file type or request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpPost('/upload')
  async uploadImage(req: Request, res: Response) {
    const maxFileSize = 524288000;
    const docMulterLoader = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxFileSize },
    });
    const fileUploader = util.promisify(docMulterLoader.single('file'));
    try {
    await fileUploader(req, res);
    } catch (error: any) {
        throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, error.message);
    }
    if (
      req.file.mimetype !==
      'text/csv'
    ) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, 'Invalid file type uploaded! Only CSV files are supported.');
    }
    const result = await this.imageProcessorService.uploadFile(req.file, req.body.webhookUrl);
    return res.send({ processingRequestId: result.id });
  }

  /**
   * @swagger
   * /api/image-processor/status/{processingRequestId}:
   *   get:
   *     summary: Get the status of a processing request
   *     tags: [Image Processor]
   *     parameters:
   *       - in: path
   *         name: processingRequestId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the processing request to check
   *     responses:
   *       200:
   *         description: Processing status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProcessingStatus'
   *       404:
   *         description: Processing request not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpGet('/status/:processingRequestId')
  async getProcessingRequestStatusById(req: Request, res: Response) {
    const result = await this.imageProcessorService.getProcessingRequestById(req.params.processingRequestId);
    return res.send(result);
  }

  /**
   * @swagger
   * /api/image-processor/products/{processingRequestId}:
   *   get:
   *     summary: Get all products by processing request ID
   *     tags: [Image Processor]
   *     parameters:
   *       - in: path
   *         name: processingRequestId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the processing request
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GetProductsResponse'
   *       404:
   *         description: Processing request not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  @httpGet('/products/:processingRequestId')
  async getProductsByProcessingRequestId(req: Request, res: Response) {
    const result = await this.imageProcessorService.getProductsByProcessingRequestId(req.params.processingRequestId);
    return res.send(result);
  }
}
