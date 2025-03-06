import mongoose from "mongoose";
import BaseDatastore from "../../../common/datastore/base-datastore";
import ProcessingStatusEnums from "../../../common/enums/status.enums";
import { ErrorCodeEnums } from "../../../common/errors/error-enums";
import ErrorHandler from "../../../common/errors/error-handler";
import processingRequestSchema from "../../../common/datastore/schemas/processing-request.schema";
import ProcessingRequestModel from "../models/processing-request.model";
import { IProcessingRequestRepository } from "../image-processor.interfaces";
import { injectable } from "inversify";

@injectable()
export default class ProcessingRequestRepository extends BaseDatastore implements IProcessingRequestRepository {

    async createProcessingRequest(fileName: string, status: ProcessingStatusEnums = ProcessingStatusEnums.PENDING): Promise<ProcessingRequestModel> {
        let processingRequest;
        try {
            processingRequest = await new BaseDatastore.processingRequestsDB({ fileName, status: ProcessingStatusEnums.PENDING }).save();
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in creating processing request!');
        }
        return new ProcessingRequestModel(processingRequest);
    }

    async getProcessingRequestById(id: string): Promise<ProcessingRequestModel> {
        try {
            const processingRequest = await BaseDatastore.processingRequestsDB.findById(id);
            return new ProcessingRequestModel(processingRequest);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in getting processing request by ID!');
        }
    }

    async updateProcessingRequestStatus(id: string, status: ProcessingStatusEnums, additionalInfo?: string): Promise<ProcessingRequestModel> {
        try {
            const processingRequest = await BaseDatastore.processingRequestsDB.findByIdAndUpdate(id, { status, ...(additionalInfo && { additionalInfo }) });
            return new ProcessingRequestModel(processingRequest);
        } catch (error) {
            throw new ErrorHandler(ErrorCodeEnums.INTERNAL_SERVER_ERROR, 'Error in updating processing request!');
        }
    }
}