"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useTransition } from "react";
import { toast } from "sonner";

const formSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		password: z.string().min(8, {
			message: "Password must be at least 8 characters.",
		}),
	})

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
  await authClient.signIn.email({
    email: data.email, // user email address
    password: data.password, // user password
    callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
  }, {
    onRequest: (ctx) => {
      //show loading
    },
    onSuccess: (ctx) => {
      //redirect to the dashboard or sign in page
      toast.success("Login successful")
    },
    onError: (ctx) => {
      // display the error message
      toast.error(ctx.error.message);
    },
  });
  })
}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader className="text-center lg:text-left">
				<CardTitle className="text-2xl font-bold tracking-tight">
					Next Starter Account
				</CardTitle>
				<CardDescription className="mt-1 text-sm">
					Login to your Next Starter account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Google Sign-In Button */}
				<div className="mb-6">
					<Button onClick={() => {
						authClient.signIn.social({
							provider: "google",
							callbackURL: "/dashboard"
						})
					}}>Login with Google</Button>
				</div>

				{/* Divider */}
				<div className="relative mb-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with email
						</span>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Email
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="john.doe@example.com"
											{...field}
											className="mt-1"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Password
									</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="At least 8 characters"
											{...field}
											className="mt-1"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full medical-button-gradient text-primary-foreground font-semibold tracking-wide uppercase text-sm h-11"
							disabled={isPending}
						>
							{isPending ? "Login..." : "Login"}
						</Button>
					</form>
				</Form>

				<div className="mt-6 space-y-3 text-center">
					<p className="text-xs text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="font-medium text-primary hover:underline"
						>
							Signup
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

export default LoginForm;