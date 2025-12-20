import { promise as fastq } from "fastq";
import { actionsWorker } from "./actions";

const actionsQueue = fastq(actionsWorker, 1);

export { actionsQueue };
