/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient"

export interface IRagQueryPayload {
    query: string,
    limit?: number,
    sourceType?: string
}

export interface IRagSource {
    id: string;
    content: string;
    similarity: number;
    metadata?: {
        name?: string;
        [key: string]: unknown;
    };
    sourceType?: string;
}

export interface IRagQueryData {
    answer: any;
    sources: IRagSource[];
    contextUsed: string
}

export interface IIngestDoctorData {
    success: boolean;
    message: string;
    indexedCount: number;
}

export const queryRagService = async (payload: IRagQueryPayload) => {
    const response = await httpClient.post<IRagQueryData>("/rag/query", payload)
    return response
}

export const ingestDoctorService = async () => {
    const response = await httpClient.post<IIngestDoctorData>("/rag/ingest-doctor", {})
    return response
}