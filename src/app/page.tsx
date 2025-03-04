"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Abstraxion, useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient, useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import "@burnt-labs/ui/dist/index.css";
import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";

const contractAddress = "xion1snacuj95w0gl9c9zyaqx0ph2svf8yphe74fraxpsv4vuhxkdh5dsm2dkln";

type ExecuteResultOrUndefined = ExecuteResult | undefined;

export default function Page(): JSX.Element {
  // Abstraxion hooks
  const { data: account } = useAbstraxionAccount();
  const { client, signArb, logout } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();

  useEffect(() => {
    console.log("Hello: ", queryClient);
    if (!window.XION) window.XION = {};
    if (queryClient) window.XION.queryClient = queryClient;
    if (client) window.XION.client = client;
    if (account) {
      window.XION.account = account;
      console.log(account);
      if (account && account.bech32Address && window.unityInstance) {
        console.log("SendMessage");
        window.unityInstance.SendMessage("XIONController", "HandleLogin", account.bech32Address);
      }
      //SendM
    }
    window.XION.contractAddress = contractAddress;
    window.XION.login = () => setShowModal(true);
    if (logout) window.XION.logout = () => logout();
  }, [queryClient, account, client, logout]);

  const [streak, setStreak] = useState<string | null>(null);

  // General state hooks
  const [, setShowModal]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useModal();
  const [loading, setLoading] = useState(false);
  const [executeResult, setExecuteResult] = useState<ExecuteResultOrUndefined>(undefined);

  const blockExplorerUrl = `https://explorer.burnt.com/xion-testnet-1/tx/${executeResult?.transactionHash}`;

  function getTimestampInSeconds(date: Date | null): number {
    if (!date) return 0;
    const d = new Date(date);
    return Math.floor(d.getTime() / 1000);
  }

  const getStreak = async () => {
    setLoading(true);

    try {
      if (!queryClient) {
        throw new Error("Query client is not initialized");
      }
      // Query the contract
      const response = await queryClient.queryContractSmart(contractAddress, {
        get_streak: { address: account.bech32Address },
      });

      setStreak(response.streak);

      console.log("Get Streak:", response);
    } catch (error) {
      console.error("Error querying contract:", error);
      //setError('Failed to query the contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const claimStreak = async () => {
    setLoading(true);
    const msg = { claim_streak: {} };

    try {
      const res = await client?.execute(account.bech32Address, contractAddress, msg, "auto");
      setExecuteResult(res);
      console.log("Transaction successful:", res);
      await getStreak(); // Refresh streak
    } catch (error) {
      console.error("Error executing transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  now.setSeconds(now.getSeconds() + 15);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  return (
    <main className="m-auto flex min-h-screen max-w-xs flex-col items-center justify-center gap-4 p-4">
      <Script
        src="rogues/Build/rogues.loader.js"
        onLoad={() => {
          console.log("Unity loaded");
          console.log(queryClient);
          createUnityInstance(document.querySelector("#unity-canvas"), {
            arguments: [],
            dataUrl: "rogues/Build/rogues.data.unityweb",
            frameworkUrl: "rogues/Build/rogues.framework.js.unityweb",
            codeUrl: "rogues/Build/rogues.wasm.unityweb",
            streamingAssetsUrl: "rogues/StreamingAssets",
            companyName: "RFG",
            productName: "Rogues",
            productVersion: "0.14",
            // matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
            // devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
          }).then((instance) => {
            console.log(instance);
            window.unityInstance = instance;
          });
        }}
      />
      <canvas id="unity-canvas" style={{ position: "absolute", zIndex: 0, width: "100%", height: "100%", backgroundColor: "grey" }} />
      {true && (
        <div>
          <Button
            onClick={async () => {
              console.log("test");
              console.log(queryClient);
              window.queryClient = queryClient;
              console.log(contractAddress);
              console.log(account.bech32Address);
              // const response = await queryClient.queryContractSmart(contractAddress, {
              //   get_streak: { address: account.bech32Address },
              // });
            }}
          >
            Test
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setShowModal(true);
            }}
            structure="base"
          >
            {account.bech32Address ? <div className="flex items-center justify-center">VIEW ACCOUNT</div> : "CONNECT"}
          </Button>
          {client ? (
            <>
              <Button
                disabled={loading}
                fullWidth
                onClick={() => {
                  void getStreak();
                }}
                structure="base"
              >
                {loading ? "LOADING..." : "Get Streak"}
              </Button>

              <Button disabled={loading} fullWidth onClick={claimStreak} structure="base">
                {loading ? "LOADING..." : "CLAIM STREAK"}
              </Button>

              {logout ? (
                <Button
                  disabled={loading}
                  fullWidth
                  onClick={() => {
                    logout();
                  }}
                  structure="base"
                >
                  LOGOUT
                </Button>
              ) : null}
            </>
          ) : null}
          <Abstraxion
            onClose={() => {
              setShowModal(false);
            }}
          />
          {streak != null ? (
            <div className="border-2 border-primary rounded-md p-4 flex flex-row gap-4">
              <div className="flex flex-row gap-6">
                <div>Streak:</div>
                <div>{streak}</div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
