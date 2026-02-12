import { SignIn, SignUp } from '@clerk/clerk-react';

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn redirectUrl="/post-auth" />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp redirectUrl="/post-auth" />
    </div>
  );
}
