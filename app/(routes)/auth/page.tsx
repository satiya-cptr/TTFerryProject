"use client";

// Authentication page
// TODO: probably separate the forms into individual components
// TODO 2: update to use new design

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError, Input, InputOTP, Label, Tabs, TextField, toast } from "@heroui/react";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getDoc, doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { DoubleStackButton } from "@/components/ui/doubleStackButton";
import RollingText from "@/components/ui/rollingText";

export default function AuthPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = use(searchParams);
  const defaultTab = params.tab === "guest" ? "guest" : "account";
  const [heading, setHeading] = useState(defaultTab === "guest" ? "Manage Booking" : "Sign In");

  return (
    <div className="min-h-screen mt-16 bg-light-surface">
      <div className="mx-[10px] mb-[10px]">
        <div className="flex flex-col lg:flex-row gap-[10px]" style={{ height: 'calc(100vh - 4rem - 10px)' }}>
          
          {/* Left content */}
          <div className="flex-1 flex flex-col h-full justify-center items-center lg:items-start lg:pl-[46px] py-12 lg:py-0">
            <h1 className="font-inter font-semimedium text-5xl md:text-8xl text-blue-ink text-center lg:text-left leading-tight tracking-tight">
              Access your <br className="hidden md:block" /> bookings <br className="hidden md:block" /> your way
            </h1>
            
            <p className="font-normal text-xs md:text-2xl text-blue-ink text-center lg:text-left mt-[12px] md:mt-[18px] max-w-[260px] md:max-w-md leading-tight opacity-80">
              Use your reference code to find your booking or sign in to see it all.
            </p>

            <div className="mt-8">
              <DoubleStackButton variant="light">
                <RollingText primary="need some help?" secondary="need some help?" />
              </DoubleStackButton>
            </div>
          </div>

          {/* Right side content */}
          <div className="relative w-full h-full lg:w-1/2 rounded-[32px] overflow-hidden" style={{ height: 'auto', minHeight: '620px' }}>
            <Image src="/images/ocean-by-ian-panelo.webp" alt="The ocean by Ian Panelo" fill priority className="object-cover" />

            <div className="absolute inset-[12px] md:inset-[16px] bg-light-surface rounded-[24px] md:rounded-[22px] flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10 my-auto flex flex-col items-center">
                
                {/* heading */}
                <h2 className="font-semimedium text-3xl md:text-5xl text-blue-ink mb-14 md:mt-6 text-center transition-opacity duration-300">
                  {heading}
                </h2>
                
                {/* tabs */}
                <Tabs 
                  defaultSelectedKey={defaultTab} 
                  className="w-full max-w-lg mx-auto my-auto"
                  onSelectionChange={(key) => {
                    setHeading(key === "guest" ? "Manage Booking" : "Sign In");
                  }}
                >
                  <Tabs.ListContainer className="block mx-auto max-w-sm w-full" >
                    <Tabs.List aria-label="Authentication Options" className="w-full bg-light-surface *:data-[selected=true]:text-light-surface">
                      <Tabs.Tab id="account" className="flex-1">
                        <span className="font-medium">Sign In</span>
                        <Tabs.Indicator className="bg-blue-ink"/>
                      </Tabs.Tab>
                      <Tabs.Tab id="guest" className="flex-1">
                        <span className="font-medium">Manage Booking</span>
                        <Tabs.Indicator className="bg-blue-ink"/>
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                  <Tabs.Panel className="pt-8" id="account">
                    <AccountAuthForm onModeChange={setHeading} />
                  </Tabs.Panel>
                  <Tabs.Panel className="pt-8" id="guest">
                    <GuestLookupForm />
                  </Tabs.Panel>
                </Tabs>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AccountAuthForm({ onModeChange }: { onModeChange?: (val: string) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!onModeChange) return;
    const modeTitles = {
      signin: "Sign In",
      signup: "Create Account",
      forgot: "Reset Password"
    };
    onModeChange(modeTitles[mode]);
  }, [mode, onModeChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        router.push(userDoc.data()?.role === "admin" ? "/admin" : "/account");
      } else if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email, firstName, lastName, role: "user", createdAt: new Date(),
        });
        router.push("/account");
      } else {
        await sendPasswordResetEmail(auth, email);
        toast.success("Reset email sent!");
        setMode("signin");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
  
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-light-surface">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-3xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <TextField isRequired className="flex-1" value={firstName} onChange={setFirstName}>
                <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">First Name</Label>
                <Input placeholder="John" className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none" />
              </TextField>
              <TextField isRequired className="flex-1" value={lastName} onChange={setLastName}>
                <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">Last Name</Label>
                <Input placeholder="Doe" className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none" />
              </TextField>
            </div>
          )}

          <TextField isRequired type="email" className="w-full" value={email} onChange={setEmail}>
            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">Email</Label>
            <Input placeholder="email@example.com" className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none" />
          </TextField>

          {mode !== "forgot" && (
            <TextField isRequired type="password" ocean-by-ian-panelo className="w-full" value={password} onChange={setPassword}>
              <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">Password</Label>
              <Input placeholder="••••••••" className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none" />
            </TextField>
          )}

          {mode === "signin" && (
            <button type="button" onClick={() => setMode("forgot")} className="text-sm text-blue-ink hover:underline">
              Forgot password?
            </button>
          )}

          <button type="submit" disabled={loading} className="block mx-auto px-8 py-4 bg-blue-ink text-light-surface rounded-full font-bold hover:bg-blue-ink/90 disabled:opacity-50 transition-colors">
            {loading ? "Processing..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-sm text-blue-ink/70">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <span className="font-semibold text-blue-ink hover:underline">{mode === "signin" ? "Sign up!" : "Sign in!"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestLookupForm() {
  const router = useRouter();
  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFormattedRef = (raw: string) => {
    if (raw.length < 12) return raw.toUpperCase();
    const chars = raw.split("");
    chars.splice(2, 0, "-");
    chars.splice(9, 0, "-");
    return chars.join("").toUpperCase();
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const finalRef = getFormattedRef(bookingRef);

    try {
      // Query Firestore for booking with matching ref and email
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("bookingReference", "==", finalRef),
        where("reservationHolder.email", "==", email.toLowerCase())
      );

      const querySnapshot = await getDocs(bookingsQuery);

      if (querySnapshot.empty) {
        setError("No booking found with this reference and email combination.");
        return;
      }

      // Get the first matching booking
      const bookingDoc = querySnapshot.docs[0];
      const bookingId = bookingDoc.id;

      // Redirect to booking page
      router.push(`/book/booking/${bookingId}`);

    } catch (error) {
      console.error("Lookup error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
        
        {/* booking ref otp */}
        <div>
          <div className="flex flex-col justify-center items-start w-full max-w-md">
            <Label className="text-xs font-semibold uppercase text-blue-ink mb-2 text-left">
              Booking Reference
            </Label>
          </div>
          <InputOTP
            maxLength={12}
            value={bookingRef}
            onChange={setBookingRef}
            className="flex-wrap justify-center max-w-lg"
          >
            <InputOTP.Group>
              <InputOTP.Slot index={0} className="bg-blue-ink/5 h-9 w-7 border-none rounded-xl text-blue-ink font-semimedium " />
              <InputOTP.Slot index={1} className="bg-blue-ink/5 h-9 w-7 border-none rounded-xl text-blue-ink font-semimedium" />
            </InputOTP.Group>
            <InputOTP.Separator className="text-blue-ink/30 font-bold"/>
            <InputOTP.Group>
              {[...Array(6)].map((_, i) => (
                <InputOTP.Slot key={i + 2} index={i + 2} className="bg-blue-ink/5 h-9 w-7 border-none rounded-xl text-blue-ink font-semimedium " />
              ))}
            </InputOTP.Group>
            <InputOTP.Separator className="text-blue-ink/30 font-bold"/>
            <InputOTP.Group>
              {[...Array(4)].map((_, i) => (
                <InputOTP.Slot key={i + 8} index={i + 8} className="bg-blue-ink/5 h-9 w-7 border-none rounded-xl text-blue-ink font-semimedium text-base" />
              ))}
            </InputOTP.Group>
          </InputOTP>
        </div>

        <TextField isRequired type="email" className="w-full max-w-md" value={email} onChange={setEmail}>
          <Label className="text-xs font-semibold uppercase text-blue-ink mb-2">Email Address</Label>
          <Input placeholder="Enter your email address" className="h-12 w-full px-4 bg-blue-ink/5 border-none rounded-xl text-blue-ink text-sm outline-none placeholder:text-blue-ink/30" />
        </TextField>

        <DoubleStackButton type="submit" disabled={loading || bookingRef.length < 12}>
          {loading ? "Searching..." : "Find Booking"}
        </DoubleStackButton>
      </form>
    </div>
  );
}