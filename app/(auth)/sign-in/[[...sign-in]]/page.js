// ClerkNextjs component import kar rahe hain custom sign-in page ke liye
import { SignIn } from "@clerk/nextjs";

/**
 * SignInPage Component
 * Yeh page tab dikhega jab user '/sign-in' path par jayega.
 * Ise humne center align kiya hai taaki aesthetic look barkarar rahe.
 */
export default function SignInPage() {
  return (
    // Screen ke center mein form dikhane ke liye flexbox ka use
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      {/* Clerk ka pre-built SignIn component render kar rahe hain */}
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
