import { v4 as uuidv4 } from 'uuid';

const productSchema = {
  _id: { type: String, default: uuidv4 },
  processingRequestId: { type: String, required: true },
  serialNumber: { type: Number, required: true },
  productName: { type: String, required: true },
  inputImageUrls: [{ type: String }],
  outputImageUrls: [{ type: String }],
};

export default productSchema;