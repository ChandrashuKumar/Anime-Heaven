"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "@/store/AuthContext"; // Import our Auth context hook

const SignUp = () => {
  const router = useRouter();
  const { signUpWithEmail, googleSignIn, createUserError: firebaseError } = useAuth();

  // Define the validation schema using Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Please enter a valid email"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  // Set up React Hook Form with Yup validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // Helper to map Firebase error codes to custom messages
  const getErrorMessage = (error) => {
    switch (error?.code) {
      case "auth/email-already-in-use":
        return "The provided email is already in use by an existing user.";
      default:
        return error?.message || "An unexpected error occurred. Please try again.";
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await signUpWithEmail(data.email, data.password);
      console.log({ res });
      if (res) router.push("/sign-in");
    } catch (e) {
      console.error(e);
    }
  };

  const onGoogleSignUp = async () => {
    try {
      const res = await googleSignIn();
      console.log(res);
      if (res) router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/signup_backg.jpg')" }}>
      {/* Outer wrapper relative to both form and chibi */}
      <div className="relative">
        {/* Form container */}
        <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
          <h1 className="text-white text-2xl mb-5">Sign Up</h1>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email")}
                className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mb-4">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 mt-4 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Sign Up
            </button>
          </form>

          <button
            onClick={onGoogleSignUp}
            className="w-full p-3 mt-4 flex items-center justify-center text-white hover:text-gray-300 focus:outline-none"
            style={{ background: "none" }}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.67 1.23 9.17 3.23l6.87-6.87C35.78 3.16 30.16 1 24 1 14.62 1 6.52 5.48 2.36 12.29l7.77 6.04C11.63 12.14 17.12 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.64 24.5c0-1.58-.14-3.1-.4-4.5H24v8.55h12.76c-.55 3-2.23 5.5-4.74 7.21l7.68 5.94C44.82 36.38 46.64 30.66 46.64 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.13 28.27A13.58 13.58 0 0 1 9.5 24c0-1.26.22-2.48.63-3.63L2.36 12.29A23.09 23.09 0 0 0 1 24c0 3.91.94 7.62 2.64 10.89l7.49-6.61z"
              />
              <path
                fill="#34A853"
                d="M24 47c6.16 0 11.34-2.05 15.12-5.56l-7.21-5.94c-2.01 1.35-4.55 2.15-7.91 2.15-6.88 0-12.37-3.64-15.2-8.97l-7.49 6.61C6.52 42.52 14.62 47 24 47z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="font-medium">Sign Up with Google</span>
          </button>

          {firebaseError && (
            <p className="text-red-500 text-sm mt-2">
              {getErrorMessage(firebaseError)}
            </p>
          )}
        </div>

        {/* Chibi character moving around the border of the form container */}
        <img
          src="/chibi.png"
          alt="Chibi Character"
          className="absolute w-20 h-20 combinedAnimation"
        />
        <img
          src="/chibi-left.png"
          alt="Chibi Character Facing Left"
          className="absolute w-20 h-20 combinedAnimationLeft"
        />


        <style jsx>{`
            @keyframes chibiMotion {
            0% { top: -4.70rem; left: -3.5rem; }
            25% { top: -4.70rem; left: calc(100% - 1.25rem); }
            50% { top: calc(100% - 4.75rem); left: calc(100% - 1.25rem); }
            75% { top: calc(100% - 4.75rem); left: -3.5rem; }
            100% { top: -4.70rem; left: -3.5rem; }
          }
          @keyframes defaultOpacity {
            0%, 24.9%, 75%, 100% { opacity: 1; }
            25%, 74.9% { opacity: 0; }
          }
          @keyframes leftOpacity {
            0%, 24.9%, 75%, 100% { opacity: 0; }
            25%, 74.9% { opacity: 1; }
          }
          .combinedAnimation {
            animation: chibiMotion 20s linear infinite, defaultOpacity 20s linear infinite;
          }
          .combinedAnimationLeft {
            animation: chibiMotion 20s linear infinite, leftOpacity 20s linear infinite;
          }
        `}</style>

      </div>
    </div>
  );
};

export default SignUp;
