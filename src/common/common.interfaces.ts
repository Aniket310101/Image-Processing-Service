import Bull from "bull";

export interface IBullQueueProvider {
    initializeQueue(): void;
    getQueue(): Bull.Queue;
    addJob(jobName: string, jobData: any, jobId?: string): Promise<Bull.Job>;
}

export interface ICloudinaryProvider {
    initializeCloudinary(): void;
    uploadImage(file: Buffer, fileName: string): Promise<string>;
}