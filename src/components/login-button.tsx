import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants } from "./ui/button";

type AuthProvider = {
  name: string;
  url: string;
  icon: string;
  className?: string;
};

const authProviders: Record<string, AuthProvider> = {
  github: {
    name: "GitHub",
    url: "/login/github",
    icon: "fa-brands fa-github",
    className:
      "bg-gray-900 text-white hover:bg-gray-800 border border-gray-700 shadow",
  },
  google: {
    name: "Google",
    url: "/login/google",
    icon: "fa-brands fa-google",
    className:
      "bg-white text-black hover:bg-gray-100 shadow border border-gray-300",
  },
};

type Props = {
  className?: string;
  provider: keyof typeof authProviders;
};

const LoginButton: React.FC<Props> = (props) => {
  const { className, provider } = props;
  const authProvider = authProviders[provider];
  return (
    <a
      className={cn(
        "relative",
        buttonVariants({ size: "lg", variant: "secondary" }),
        authProvider.className,
        className,
      )}
      href={authProvider.url}
    >
      <span className="absolute left-6">
        <i className={cn(authProvider.icon)} />
      </span>
      <span>Continue with {authProvider.name}</span>
    </a>
  );
};

export default LoginButton;