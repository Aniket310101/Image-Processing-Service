export default class ProductModel {
    id?: string;
    processingRequestId?: string;
    serialNumber?: string;
    productName?: string;
    inputImageUrls?: string[];
    outputImageUrls?: string[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: any) {
        this.id = data.id ?? data._id;
        this.processingRequestId = data.processingRequestId;
        this.serialNumber = data.serialNumber;
        this.productName = data.productName;
        this.inputImageUrls = data.inputImageUrls;
        this.outputImageUrls = data.outputImageUrls;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
  }
  