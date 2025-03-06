import Bull from 'bull';
import { IBullQueueProvider } from '../common.interfaces';
import { injectable } from 'inversify';

@injectable()
export default class BullQueueProvider implements IBullQueueProvider {
    private static queue: Bull.Queue;

    getQueue(): Bull.Queue {
        return BullQueueProvider.queue;
    }

    initializeQueue() {
        const queueOptions: Bull.QueueOptions = {
            redis: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD,
            },
        };
        BullQueueProvider.queue = new Bull('image-processor', queueOptions);
    }

    async addJob(jobName: string, jobData: any, jobId?: string): Promise<Bull.Job> {
        const customJobOptions: Bull.JobOptions = {
            ...(jobId && { jobId }),
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 300,
            },
          };
        const job = await BullQueueProvider.queue.add(jobName, jobData, customJobOptions);
        return job;
    }
}