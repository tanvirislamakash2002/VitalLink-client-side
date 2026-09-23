"use server"

import { cookies } from "next/headers";
import { setTokenInCookies } from "../lib/tokenUtils";

const BASE_API_URL = process.env.NEXT_PUBLIC_URL;

if (BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
}

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`
            }
        })

        if (!res.ok) {
            return false
        }

        const { data } = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if (accessToken) {
            await setTokenInCookies("accessToken", accessToken)
        }

        if (newRefreshToken) {
            await setTokenInCookies("refreshToken", newRefreshToken)
        }

        if (token) {
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60)
        }
        return true
    } catch (error) {
        console.error("Error refreshing token:", error)
        return false
    }
}

export async function getUserInfo() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
        return null;
    }

    const res = await fetch(`${BASE_API_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${accessToken}`
        }
    })

    if (!res.ok) {
        return null;
    }

    const { data } = await res.json();

    return data;
}