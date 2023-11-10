const lemonadePublicKey = [
  "08ea870be3a405ef554d2b1ab50c496f1277e0fee0b3b2516ef405158cd44a02",
  "1d854a02e0324e02ec43703f2657eca621adc6af64043db705b743554ed8be04",
];

export function constructZupassPcdGetRequestUrl(
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

export function isLemonadePublicKey(publicKey: [string, string]): boolean {
  return lemonadePublicKey[0] === publicKey[0] && lemonadePublicKey[1] === publicKey[1];
}
