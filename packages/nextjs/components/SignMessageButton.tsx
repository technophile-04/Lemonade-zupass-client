import * as React from "react";
import { useSignMessage } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

export const SignMessageButton = ({ message }: { message: string }) => {
  const { error, isLoading, signMessageAsync } = useSignMessage({
    message,
  });

  const handleSign = async () => {
    try {
      await signMessageAsync();
      notification.success("Message signed successfully");
    } catch (e) {
      notification.error("An Error happend while signing the message");
      console.log("An Error happend while signing the message", e);
      console.log("Error", error?.cause);
    }
  };

  return (
    <>
      <button className={`btn btn-primary btn-outline ${isLoading ? "loading" : ""}`} onClick={() => handleSign()}>
        {isLoading ? "Check Wallet" : "Sign Message"}
      </button>
    </>
  );
};
