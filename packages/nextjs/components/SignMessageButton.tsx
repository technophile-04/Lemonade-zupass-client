import * as React from "react";
import { recoverMessageAddress } from "viem";
import { useSignMessage } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

export const SignMessageButton = () => {
  const {
    data: signMessageData,
    error,
    isLoading,
    signMessageAsync,
    variables,
  } = useSignMessage({
    message: "Welcome to Limonade",
  });
  const [recorveredAddress, setRecoveredAddress] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        });
        setRecoveredAddress(recoveredAddress);
      }
    })();
  }, [signMessageData, variables?.message]);

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
      {signMessageData && (
        <div>
          <div>Recovered Address: {recorveredAddress}</div>
          <div>Signature: {signMessageData}</div>
        </div>
      )}
    </>
  );
};
