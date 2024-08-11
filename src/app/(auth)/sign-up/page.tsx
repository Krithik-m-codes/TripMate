"use client";
// import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import Image from "next/image";

// sign up page
const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  const router = useRouter();

  // Handle sign up form submission
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Handle form submission
    const { fullName, username, email, password } = formData;
    const avatar = `https://eu.ui-avatars.com/api/?name=${username}`;

    const response = await fetch("/api/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fullName,
        username,
        email,
        password,
        avatar,
      }),
    });

    const data = await response.json();
    // console.log("Data from server sign up : ", data);
    // Handle response
    if (response) {
      console.log("User signed up successfully");

      //send email verification
      const emailResponse = await sendVerificationEmail(
        email,
        fullName,
        data.verifyCode
      );

      // Handle email response
      if (!emailResponse.success) {
        console.log("Failed to send email");
      } else {
        console.log("Email sent successfully");

        // Redirect to verify email page
        router.push(`/verify-email/?username=${username}`);
      }
    } else {
      console.log("Failed to sign up");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-bg-sign-up bg-cover bg-center flex justify-center items-center text-black shadow">
      <motion.div
        className="flex flex-col-reverse gap-4 md:gap-0 md:flex-row justify-center items-center m-auto md:m-0 h-2/4 md:min-h-[69%] bg-gray-500 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 md:px-6 md:py-4 rounded-md "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <div className="bg-transparent rounded p-4 md:p-10 max-w-md md:w-full">
          <div className="flex justify-center items-center mb-8 gap-2">
            <Image
              src="/tripmate-logo.png"
              alt="alt"
              width={60}
              height={60}
              className=" rounded-full"
            />
            <h1 className=" text-3xl md:text-4xl font-bold text-center">
              TripMate
            </h1>
          </div>
          <form
            onSubmit={handleSignUp}
            className="
          border border-gray-200 p-4 md:p-8 rounded-md bg-white shadow-md
          "
          >
            <div className="mb-4">
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Eg. Surya Alexander"
                className="w-[90%] md:w-full px-2 py-1 md:px-3 md:py-2 border rounded focus:outline-none focus:border-black"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Eg. SuryaAlexander234"
                className="w-[90%] md:w-full px-2 py-1 md:px-3 md:py-2  border rounded focus:outline-none focus:border-black"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="mb-3 md:mb-6">
              <label className="block text-gray-700">Email</label>
              <label className=" block my-2 text-xs text-red-700">
                Please enter a valid email id, use the OTP to verify
              </label>
              <input
                type="email"
                placeholder="Eg. 0UqoK@example.com"
                className="w-[90%] md:w-full px-2 py-1 md:px-3 md:py-2  border rounded focus:outline-none focus:border-black"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="mb-3 md:mb-6">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-[90%] md:w-full px-2 py-1 md:px-3 md:py-2  border rounded focus:outline-none focus:border-black"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="flex justify-around md:justify-between mt-6 md:mt-0">
              <button
                type="button"
                className=" px-3 py-1 md:px-6 md:py-2 bg-primary hover:bg-[#153831] text-white font-semibold rounded-lg"
                onClick={() => router.back()}
              >
                Go Back
              </button>
              <button
                type="submit"
                className="px-3 py-1 md:px-6 md:py-2 bg-primary hover:bg-[#153831] text-white font-semibold rounded-lg"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <motion.div
          className="md:block md:w-1/2 mx-4 md:mx-0 md:ml-4 md:mr-0
        transition duration-500 ease-in-out transform hover:scale-105
        filter drop-shadow-lg md:filter-none md:drop-shadow-none
        "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <Image
            src="/sign-up-illustration.png"
            alt="Illustration"
            width={700}
            height={650}
            className="bg-transparent bg-center bg-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
