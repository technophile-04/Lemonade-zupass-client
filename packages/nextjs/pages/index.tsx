import { useEffect } from "react";
import { useRouter } from "next/router";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { SignMessageButton } from "~~/components/SignMessageButton";
import { notification } from "~~/utils/scaffold-eth";

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
  const { query } = useRouter();

  const proof = query && query.proof && JSON.parse(decodeURIComponent(query.proof as string));

  useEffect(() => {
    const doDeserialization = async () => {
      const deserialized = proof && (await SemaphoreIdentityPCDPackage.deserialize(proof.pcd));
      const verified = await SemaphoreIdentityPCDPackage.verify(deserialized);
      console.log("PRC IS:", JSON.parse(proof.pcd));
      notification.success("Verfied");
      console.log("Deserialized", deserialized);
      console.log("Commitment", deserialized.claim.identity.commitment);
      console.log("verified", verified);
    };
    if (proof) {
      doDeserialization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(proof)]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="bg-base-100 flex items-center flex-col p-5 rounded-2xl">
          <div className="px-5">
            <h1 className="text-center mb-8">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">Lemonade ZuPass NFT Verification</span>
            </h1>
          </div>
          <SignMessageButton />
          <button
            className="btn btn-primary bg-opacity-25  m-4"
            onClick={() => {
              const result = constructZupassPcdGetRequestUrl(
                "https://zupass.org",
                "http://localhost:3000/",
                SemaphoreIdentityPCDPackage.name,
                pcdArgs,
              );

              console.log("result", result);

              window.location.href = result; //or you could have a pop up but it's more complicated
            }}
          >
            Get proof
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
