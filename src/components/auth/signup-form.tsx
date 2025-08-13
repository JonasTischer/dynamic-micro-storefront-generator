"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		name: z.string().min(2, {
			message: "Name must be at least 2 characters.",
		}),
		password: z.string().min(8, {
			message: "Password must be at least 8 characters.",
		}),
		re_password: z.string().min(8, {
			message: "Password must be at least 8 characters.",
		}),
		terms: z.boolean().refine((val) => val === true, {
			message: "You must agree to the Terms of Service and Privacy Policy.",
		}),
	})
	.refine((data) => data.password === data.re_password, {
		message: "Passwords do not match.",
		path: ["re_password"],
	});

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			re_password: "",
			terms: false,
		},
	});

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
  await authClient.signUp.email({
    email: data.email, // user email address
    password: data.password, // user password
    name: data.name, // user display name
    callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
  }, {
    onRequest: (ctx) => {
      //show loading
    },
    onSuccess: (ctx) => {
      //redirect to the dashboard or sign in page
      toast.success("Signup successful")
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
					Create your Next Starter account
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Google Sign-In Button */}
				<div className="mb-6">
					<Button
						onClick={() => {
							authClient.signIn.social({
								provider: "google",
								callbackURL: "/dashboard"
							})
						}}
            className="w-full"
            variant="outline"
					>
						Signup with Google
					</Button>
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
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs font-medium text-muted-foreground">
											Name
										</FormLabel>
										<FormControl>
											<Input placeholder="John" {...field} className="mt-1" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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
										Create Password
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

						<FormField
							control={form.control}
							name="re_password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-medium text-muted-foreground">
										Confirm Password
									</FormLabel>
									<FormControl>
										<Input type="password" {...field} className="mt-1" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="terms"
							render={({ field }) => (
								<FormItem className="pt-2">
									<div className="flex items-center gap-2">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
										</FormControl>
										<FormLabel className="text-xs font-normal leading-snug text-muted-foreground cursor-pointer">
											I agree to the <Link href="/agb" className="underline hover:text-primary">Terms of Service</Link> and the <Link href="/datenschutz" className="underline hover:text-primary">Data Privacy Policy</Link>
										</FormLabel>
										<FormMessage className="mt-1" />
									</div>
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full medical-button-gradient text-primary-foreground font-semibold tracking-wide uppercase text-sm h-11"
							disabled={isPending}
						>
							{isPending ? "Create Account..." : "Create Account"}
						</Button>
					</form>
				</Form>

				<div className="mt-6 space-y-3 text-center">
					<p className="text-xs text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-primary hover:underline"
						>
							Login
						</Link>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

export default SignUpForm;