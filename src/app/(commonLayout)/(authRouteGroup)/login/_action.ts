/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/src/lib/authUtils";
import { httpClient } from "@/src/lib/axios/httpClient";
import { setTokenInCookies } from "@/src/lib/tokenUtils";
import { ApiErrorResponse } from "@/src/types/api.types";
import { ILoginResponse } from "@/src/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/src/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (payload: ILoginPayload, redirectPath?: string): Promise<ILoginResponse | ApiErrorResponse> => {
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

        const { role, emailVerified, needPasswordChange, email } = user

        await setTokenInCookies("accessToken", accessToken)
        await setTokenInCookies("refreshToken", refreshToken)
        await setTokenInCookies("better-auth.session_token", token)

        if (!emailVerified) {
            redirect("/verify-email")
        } else if (needPasswordChange) {
            redirect(`/reset-password?email=${email}`)
        } else {
            // redirect(redirectPath || "/dashboard")
            const targetPath = redirectPath && isValidRedirectForRole(redirectPath, role as UserRole) ? redirectPath : getDefaultDashboardRoute(role as UserRole)

            redirect(targetPath)
        }


    } catch (error: any) {
        if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        return {
            success: false,
            message: `Login failed: ${error.message}`
        }
    }
}