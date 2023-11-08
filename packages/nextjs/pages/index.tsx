import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { isAddress } from "viem";
import { mainnet, useAccount, useSignMessage } from "wagmi";
import { AddSubscriptionURL } from "~~/components/AddSubscriptionURL";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
const API_BASE_URL = "http://192.168.1.233:4000";

const pcdArgs = {
  identity: {
    argumentType: ArgumentTypeName.PCD,
    pcdType: SemaphoreIdentityPCDPackage.name,
    value: undefined,
    userProvided: true,
  },
  fieldsToReveal: {
    argumentType: ArgumentTypeName.ToggleList,
    value: {},
    userProvided: false,
    hideIcon: true,
  },
};

function constructZupassPcdGetRequestUrl(
  zupassClientUrl: string,
  returnUrl: string,
  pcdType: any,
  args: any,
  options?: any,
) {
  const req: any = {
    type: "Get",
    returnUrl: returnUrl,
    args: args,
    pcdType,
    options,
  };
  const encReq = encodeURIComponent(JSON.stringify(req));
  return `${zupassClientUrl}#/prove?request=${encReq}`;
}

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { query } = useRouter();
  const [messageToSign, setMessageToSign] = useState("");
  const [subscriptionURL, setSubscriptionURL] = useState("");
  const [inputAddress, setInputAddress] = useState("");

  const {
    data: signMessageData,
    error,
    isLoading,
    signMessageAsync,
    isSuccess: isSigningMessageSuccessfull,
  } = useSignMessage({
    message: messageToSign,
  });

  const proof = query && query.proof && JSON.parse(decodeURIComponent(query.proof as string));

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

  const generateSubscriptionURL = () => {
    if (!proof) {
      notification.error("Please get the proof first");
      return;
    }
    if (!isAddress(inputAddress)) {
      notification.error("Please enter a valid address");
      return;
    }
    const base64EncodedPaylod = window.btoa(
      JSON.stringify({ account: address, signature: signMessageData, pcd: proof.pcd }),
    );

    const url = `${API_BASE_URL}/feeds/${mainnet.id}/${inputAddress}/${base64EncodedPaylod}`;
    setSubscriptionURL(url);
  };

  useEffect(() => {
    const getSigningMessage = async () => {
      try {
        if (!address) {
          notification.error("Please connect your wallet");
          return;
        }
        console.log("The connected address is", address);
        const base64EncodedPCD = window.btoa(proof.pcd);
        console.log("Base64 encoded PCD is", base64EncodedPCD);
        const response = await fetch(`${API_BASE_URL}/message?account=${address}&pcd=${base64EncodedPCD}`);
        const resJson = await response.json();
        console.log("The message received is", resJson.message);
        setMessageToSign(resJson.message);
        notification.success(
          <>
            <p className="font-bold m-0">Proof received!</p>
            <p className="m-0">Please sign the message</p>
          </>,
        );
      } catch (e) {
        console.log("Error while receiving message", e);
        notification.error("Error while receiving message");
      }
    };
    if (proof && address) {
      getSigningMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proof), address]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col p-10 space-y-8">
        <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
          <div className="px-5 text-white">
            <h1 className="text-center mb-4">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Lemonade ZuPass NFT Verification</span>
            </h1>
          </div>
          {isConnected ? (
            <>
              {messageToSign && !isSigningMessageSuccessfull && (
                <button
                  className={`btn btn-primary btn-outline ${isLoading ? "loading" : ""}`}
                  onClick={() => handleSign()}
                >
                  {isLoading ? "Check Wallet" : "Sign Message"}
                </button>
              )}
              {!proof && (
                <button
                  className="btn btn-primary btn-outline"
                  onClick={() => {
                    const result = constructZupassPcdGetRequestUrl(
                      "https://zupass.org",
                      process.env.NEXT_PUBLIC_VERCEL_URL
                        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`
                        : "http://localhost:3000",
                      SemaphoreIdentityPCDPackage.name,
                      pcdArgs,
                    );

                    console.log("result", result);

                    window.location.href = result; //or you could have a pop up but it's more complicated
                  }}
                >
                  Get proof
                </button>
              )}
            </>
          ) : (
            <button className="btn btn-primary btn-outline" onClick={openConnectModal}>
              Connect Wallet
            </button>
          )}
          {isConnected && isSigningMessageSuccessfull && (
            <div className="flex flex-col space-y-4">
              <AddressInput onChange={setInputAddress} value={inputAddress} placeholder="Enter NFT contract Address" />
              <button className="btn btn-primary btn-outline" onClick={() => generateSubscriptionURL()}>
                Get subscription URL
              </button>
            </div>
          )}
        </div>
        {isSigningMessageSuccessfull && isConnected && subscriptionURL && (
          <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
            <div className="px-5 text-white">
              <p className="text-2xl mb-2 text-center">Success 🥳!</p>
              <p className="text-xl">
                Please copy the below URL and paste it at{" "}
                <a
                  href="https://zupass.org/#/add-subscription"
                  className="underline-offset-4 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://zupass.org/add-subscription
                </a>
              </p>
            </div>
            <AddSubscriptionURL url={subscriptionURL} />
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
