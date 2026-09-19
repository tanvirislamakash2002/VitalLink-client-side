/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { httpClient } from "@/src/lib/axios/httpClient";
import { ApiErrorResponse } from "@/src/types/api.types";
import { ILoginResponse } from "@/src/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";

export const loginAction = async (payload: ILoginPayload): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsedPayload = loginZodSchema.safeParse(payload)
    if (!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "Invalid input"
        return {
            success: false,
            message: firstError
        }
    }
    try {
        const response = await httpClient.post<ILoginResponse>("/auth/login", parsedPayload.data)
        const { accessToken, refreshToken, token, user } = response.data;
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: `Login failed: ${error.message}`
        }
    }
}