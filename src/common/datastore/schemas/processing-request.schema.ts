import { v4 as uuidv4 } from 'uuid';

const processingRequestSchema = {
  _id: { type: String, default: uuidv4 },
  fileName: { type: String, required: true },
  status: { type: String, required: true },
  additionalInfo: { type: String, required: false },
};

export default processingRequestSchema;