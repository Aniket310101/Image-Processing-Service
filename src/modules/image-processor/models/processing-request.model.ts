import ProcessingStatusEnums from "../../../common/enums/status.enums";

export default class ProcessingRequestModel {
    id?: string;
    fileName?: string;
    status?: ProcessingStatusEnums;
    additionalInfo?: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: any) {
        this.id = data.id ?? data._id;
        this.fileName = data.fileName;
        this.status = data.status;
        this.additionalInfo = data.additionalInfo;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}