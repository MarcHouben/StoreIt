// "use client";
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Form, FormField, FormControl, FormMessage, FormItem, FormLabel } from "./ui/form";
// import { Button } from "./ui/button";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { createAccount, signInUser } from "@/lib/actions/user.actions";
// import OtpModal from "./OTPModal";

// const authFormSchema = (formType: FormType) => {
//     return z.object({
//         email: z.string().email(),
//         fullName: formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional()
//     })
// }

// type FormType = "sign-in" | "sign-up"

// const AuthForm = ({ type }: { type: FormType }) => {
//     const[isLoading, setIsLoading] = useState(false);
//     const[errorMessage, setErrorMessage] = useState("");
//     const[accountId, setAccountId] = useState(null);

//     const formSchema = authFormSchema(type)
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             fullName: "",
//             email: "",
//         }
//     })

//     const onSubmit = async (values: z.infer<typeof formSchema>) => {
//         setIsLoading(true)
//         setErrorMessage('');

//         try {
//             const user = type === "sign-up" ? await createAccount({fullName: values.fullName || "", email: values.email}) : await signInUser({email: values.email})
//             setAccountId(user.accountId)   
//         } catch {
//             setErrorMessage('Failed to create account. Please try again')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     return (
//         <>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
//                     <h1 className="form-title">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
//                     {type === "sign-up" && <FormField
//                         control={form.control}
//                         name="fullName"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <div className="shad-form-item">
//                                     <FormLabel className="shad-form-label">Full Name</FormLabel>
//                                     <FormControl>
//                                         <Input className="shad-input" placeholder="Enter your full name" {...field} />
//                                     </FormControl>
//                                 </div>
//                                 <FormMessage className="shad-form-message" />
//                             </FormItem>
//                         )}
//                     />}
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <div className="shad-form-item">
//                                     <FormLabel className="shad-form-label">Email</FormLabel>
//                                     <FormControl>
//                                         <Input className="shad-input" placeholder="Enter your email" {...field} />
//                                     </FormControl>
//                                 </div>
//                                 <FormMessage className="shad-form-message" />
//                             </FormItem>
//                         )}
//                     />
//                     <Button className="form-submit-button" type="submit" disabled={isLoading}>
//                         {type === "sign-in" ? "Sign In" : "Sign Up"}
//                         {isLoading && (
//                             <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />
//                         )}
//                     </Button>
//                     {errorMessage && (
//                         <p className="error-message">*{errorMessage}</p>
//                     )}
//                     <div className="body-2 flex justify-center">
//                         <p className="text-light-100">
//                             {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
//                         </p>
//                         <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
//                             {" "}{type === "sign-in" ? "Sign Up": "Sign In"}
//                         </Link>
//                     </div>
//                 </form>
//             </Form>
//             {accountId && (<OtpModal email={form.getValues("email")} accountId={accountId} />)}
//         </>
//     );
// }

// export default AuthForm


// components/AuthForm.tsx
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormControl, FormMessage, FormItem, FormLabel } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "./OTPModal";

const authFormSchema = (formType: "sign-in" | "sign-up") => {
  return z.object({
    email: z.string().email(),
    fullName: formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
  });
};

type FormType = "sign-in" | "sign-up";
type AuthFormSchema = z.infer<ReturnType<typeof authFormSchema>>;

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);

  const formSchema = authFormSchema(type);
  const form = useForm<AuthFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (values: AuthFormSchema) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user = await (type === "sign-up"
        ? createAccount({ fullName: values.fullName || "", email: values.email })
        : signInUser({ email: values.email }));
      if (user.error) {
        setErrorMessage(user.error);
      } else {
        setAccountId(user.accountId);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input className="shad-input" placeholder="Enter your full name" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input className="shad-input" placeholder="Enter your email" {...field} />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          <Button className="form-submit-button" type="submit" disabled={isLoading}>
            {type === "sign-in" ? "Sign In" : "Sign Up"}
            {isLoading && (
              <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />
            )}
          </Button>
          {errorMessage && <p className="error-message">*{errorMessage}</p>}
          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
              {" "}{type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>
      {accountId && <OtpModal email={form.getValues("email")} accountId={accountId} />}
    </>
  );
};

export default AuthForm;


// "use client";

// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "@form/react";
// import { FormField, FormButton } from "./ui";
// import { createAccount, signInUser } from "@/lib/actions/auth.actions";
// import { Button, Input } from "@components/ui";
// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import OtpModal from "./OTPModal";

// const authFormSchema = (formType: string) => {
//   return z.object({
//     email: z.string().email(),
//     fullName: formType === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
//   });
// };

// type FormType = string;
// type AuthFormSchema = z.infer<ReturnType<typeof authFormSchema>>;

// const AuthForm = ({ type }: { type: type }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setError] = useState("");
//   const [accountId, setAccountId] = useState<string | null>(null);

//   const formSchema = authFormSchema(type);
//   const form = useForm<AuthFormSchema>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fullName: undefined,
//       email: undefined,
//     },
//   });

//   const onSubmit = async (values: AuthFormSchema) => {
//     setIsLoading(true);
//     setErrorMessage("");

//     try {
//       const user = await (type === "sign-up"
//         ? createAccount({ fullName: values.fullName || "", email: values.email })
//         : signInUser({ email: values.email }));
//       if (user.error) {
//         setErrorMessage(user.error);
//       } else {
//         setAccountId(user.accountId);
//       }
//     } catch (error) {
//       setErrorMessage(error.message || "Failed to process request. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
//           <h1 className="form-title">{type === "sign-in" ? "Sign In" : "Sign Up"}</h1>
//           {type === "sign-up" && (
//             <FormField
//               control={form.control}
//               name="fullName"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="shad-form-item">
//                     <FormLabel className="shad-form-label">Full Name</FormLabel>
//                     <FormControl>
//                       <Input className="shad-input" placeholder="Enter your full name" {...field} />
//                     </FormControl>
//                   </div>
//                   <FormMessage className="shad-form-message" />
//                 </FormItem>
//               )}
//             />
//           )}
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//                 <FormItem>
//                     <div className="shad-form-item">
//                         <FormLabel className="shad-form-label">Email</FormLabel>
//                         <FormControl>
//                             <Input className="shad-input" placeholder="Enter your email" {...field} />
//                         </FormControl>
//                     </div>
//                     <FormMessage className="shad-form-message" />
//                 </FormItem>
//             )}
//           />
//           <Button className="form-submit-button" type="submit" disabled={isLoading}>
//             {type === "sign-in" ? "Sign In" : "Sign Up"}
//             {isLoading && (
//               <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />
//             )}
//           </Button>
//           {errorMessage && <p className="error-message">*{errorMessage}</p>}
//           <div className="body-2 flex justify-center">
//             <p className="text-light-100">
//               {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
//             </p>
//             <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
//               {" "}{type === "sign-in" ? "Sign Up" : "Sign In"}
//             </Link>
//           </div>
//         </form>
//       </Form>
//       {accountId && <OtpModal email={form.getValues("email")} accountId={accountId} />}
//     </>
//   );
// };

// export default AuthForm;