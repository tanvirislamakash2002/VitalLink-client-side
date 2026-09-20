/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginAction } from '@/src/app/(commonLayout)/(authRouteGroup)/login/_action';
import { ILoginPayload } from '@/src/zod/auth.validation';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

const LoginForm = () => {
    const queryClient = useQueryClient();

    const [serverError, setServerError] = useState<string | null>(null)

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: ILoginPayload) => loginAction(payload),
    })

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null)
            try {
                const result = await mutateAsync(value) as any
                if (!result.success) {
                    setServerError(result.message || "Login failed")
                    return
                }
            } catch (error: any) {
                console.log(`Login failed: ${error.message}`)
                setServerError(`Login failed: ${error.message}`)
            }
        }
    })
    return (
        <Card className='w-full max-w-md mx-auto shadow-md'>
            <CardHeader className='text-center'>
                <CardTitle className='text-2xl font-bold'>
                    Welcome Back!
                </CardTitle>
                <CardDescription>
                    Please enter your credentials to log in.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    method='POST'
                    action="#"
                    noValidate
                    onSubmit={
                        (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }
                    }
                    className='space-y-4'
                >

                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;