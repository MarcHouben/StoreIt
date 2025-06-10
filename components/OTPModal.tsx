// "use client"

// import React, { useState } from 'react'
// import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
// import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
// import Image from 'next/image';
// import { Button } from './ui/button';
// import { sendEmailOTP, verifySecret } from '@/lib/actions/user.actions';
// import { useRouter } from 'next/navigation';

// const OtpModal = ({ accountId, email }: { accountId: string, email: string }) => {
//     const router = useRouter();
//     const [isOpen, setIsOpen] = useState(true);
//     const [password, setPassword] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             const sessionId = await verifySecret({ accountId, password });
//             if(sessionId) router.push("/")
//         } catch (error) {
//             console.log("Failed to verify OTP", error);
//         }
//         setIsLoading(false);
//     }

//     const handleResendOTP = async () => {
//         await sendEmailOTP({email})
//     }

//     return (
//         <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
//             <AlertDialogContent className="shad-alert-dialog">
//                 <AlertDialogHeader className="relative flex justify-center">
//                     <AlertDialogTitle className="h2 text-center">Enter your OTP <Image className="otp-close-button" src="/assets/icons/close-dark.svg" alt="close" width={20} height={20} onClick={() => setIsOpen(false)} /></AlertDialogTitle>
//                     <AlertDialogDescription className="subtitle-2 text-center text-light-100">
//                         We&apos;ve sent a code to <span className='pl-1 text-brand'>{email}</span>
//                     </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <InputOTP maxLength={6} value={password} onChange={setPassword}>
//                     <InputOTPGroup className="shad-otp">
//                         <InputOTPSlot index={0} className="shad-otp-slot" />
//                         <InputOTPSlot index={1} className="shad-otp-slot" />
//                         <InputOTPSlot index={2} className="shad-otp-slot" />
//                         <InputOTPSlot index={3} className="shad-otp-slot" />
//                         <InputOTPSlot index={4} className="shad-otp-slot" />
//                         <InputOTPSlot index={5} className="shad-otp-slot" />
//                     </InputOTPGroup>
//                 </InputOTP>
//                 <AlertDialogFooter>
//                     <div className="flex w-full flex-col gap-4">
//                         <AlertDialogAction onClick={handleSubmit} className="shad-submit-btn h-12" type="button">Submit { isLoading && (<Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="ml-2 animate-spin" />)}</AlertDialogAction>
//                         <div className="subtitle-2 mt-2 text-center text-light-100">
//                             Didn&apos;t get a code? <Button type="button" variant="link" className="pl-1 text-brand" onClick={handleResendOTP}>Click to resend</Button>
//                         </div>
//                     </div>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     )
// }

// export default OtpModal

// components/OTPModal.tsx
"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import Image from "next/image";
import { Button } from "./ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OtpModal = ({ accountId, email }: { accountId: string; email: string }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const session = await verifySecret({ accountId, password: otp });
      if (session.sessionId) {
        router.push("/");
      } else {
        setError("Failed to verify OTP");
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendEmailOTP({ email });
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter your OTP
            <Image
              className="otp-close-button"
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We've sent a code to <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction onClick={handleSubmit} className="shad-submit-btn h-12" type="button">
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn't get a code?{" "}
              <Button type="button" variant="link" className="pl-1 text-brand" onClick={handleResendOTP}>
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;