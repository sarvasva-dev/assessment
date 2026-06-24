// ClerkNextjs component import kar rahe hain custom sign-up page ke liye
import { SignUp } from "@clerk/nextjs";

/**
 * SignUpPage Component
 * Yeh page tab dikhega jab user '/sign-up' path par naya account banane aayega.
 * Ise bhi UI consistency ke liye center align kiya gaya hai.
 */
export default function SignUpPage() {
  return (
    // Screen ke center mein form dikhane ke liye flexbox layout
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      {/* Clerk ka pre-built SignUp component */}
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
