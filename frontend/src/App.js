import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useCustomContractWrite from "./hooks/useCustomContractWrite";
import useCustomContractRead from "./hooks/useCustomContractRead";
import nUSD_ABI from "./config/nUSD_ABI.json";
import { nUSD_ADDRESS } from "./config";
import { formatEther, parseEther } from "viem";
import { toast } from "react-toastify";

function App() {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const { data: ethBalance } = useBalance({
    address: address,
    enabled: address != undefined,
  });
  const {
    _useContractWrite: depositContractWrite,
    _useWaitForTransaction: depositWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: nUSD_ADDRESS,
    Abi: nUSD_ABI,
    FuncName: "deposit",
    Value: parseEther(depositAmount),
    isEnabled: address != undefined && depositAmount != "",
  });

  const {
    _useContractWrite: redeemContractWrite,
    _useWaitForTransaction: redeemWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: nUSD_ADDRESS,
    Abi: nUSD_ABI,
    FuncName: "redeem",
    Args: [parseEther(redeemAmount)],
    isEnabled: address != undefined && redeemAmount != "",
  });

  const { data: totalSupply } = useCustomContractRead({
    Adrress: nUSD_ADDRESS,
    Abi: nUSD_ABI,
    FuncName: "totalSupply",
    isWatch: true,
  });

  const { data: userTokenBalance } = useCustomContractRead({
    Adrress: nUSD_ADDRESS,
    Abi: nUSD_ABI,
    FuncName: "balanceOf",
    Args: [address],
    isEnabled: address != undefined,
    isWatch: true,
  });

  const { data: getEthPriceInUsd } = useCustomContractRead({
    Adrress: nUSD_ADDRESS,
    Abi: nUSD_ABI,
    FuncName: "getEthPriceInUsd",
    isWatch: true,
  });

  const calculateReceivedTokenValue = () => {
    return (
      (Number(depositAmount === "" ? "0" : depositAmount) *
        Number(formatEther?.(getEthPriceInUsd))) /
      2
    );
  };
  const calculateReceivedETHValue = () => {
    return (
      (Number(redeemAmount === "" ? "0" : redeemAmount) /
        Number(formatEther?.(getEthPriceInUsd))) *
      2
    );
  };

  useEffect(() => {
    if (depositWaitForTransaction?.isSuccess) {
      toast?.success(JSON.stringify("Deposit Successfully"));
      const newTransaction = {
        hash: depositWaitForTransaction?.data?.transactionHash,
        time: Date.now(),
      };
      setTransactions?.([...transactions, newTransaction]);
      localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
    }

    if (redeemWaitForTransaction?.isSuccess) {
      toast?.success(JSON.stringify("Redeem Successfully"));
      const newTransaction = {
        hash: redeemWaitForTransaction?.data?.transactionHash,
        time: Date.now(),
      };
      setTransactions?.([...transactions, newTransaction]);
      localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
    }
  }, [
    depositWaitForTransaction?.isSuccess,
    redeemWaitForTransaction?.isSuccess,
    depositWaitForTransaction?.data?.transactionHash,
    redeemWaitForTransaction?.data?.transactionHash

  ]);

  function TransactionTable({ transactions }) {
    return (
      <table>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th>Transaction Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map((transaction, index) => (
            <tr key={index}>
              <td>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transaction?.hash}`}
                  target="_blank"
                >
                  {transaction?.hash}
                </a>
              </td>
              <td>
                {new Date(transaction?.time).toLocaleString("en-US", {
                  timeZone: "UTC",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Load transactions from local storage on component mount
  useEffect(() => {
    const storedTransactions = localStorage.getItem?.("transactions");
    if (storedTransactions) {
      setTransactions?.(JSON.parse(storedTransactions));
    }
  }, []);



  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 12,
        }}
      >
        <h3>Stable Coin</h3>

        <ConnectButton />
      </div>
      {/* Deposit & Redeem */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          padding: 12,
        }}
      >
        <div>
          <h1>Deposit ETH</h1>
          <input
            type="number"
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button
            disabled={
              !address ||
              depositWaitForTransaction?.isLoading ||
              depositContractWrite?.isLoading
            }
            onClick={async () => {
              try {
                await depositContractWrite?.writeAsync?.();
              } catch (err) {}
            }}
          >
            {(depositWaitForTransaction?.isLoading ||
            depositContractWrite?.isLoading)
              ? "Deposit..."
              : "Deposit"}
          </button>

          {ethBalance && (Number(ethBalance?.formatted) <= 0 && depositAmount !== "") && (
            <p>Insuffucient ETH Balance For Deposit</p>
          )}

          {ethBalance && (calculateReceivedTokenValue?.() > 0 &&
            Number(ethBalance?.formatted) > 0) && (
              <p>
                You will received{" "}
                {Number(calculateReceivedTokenValue?.()).toFixed(4)} nUSD Token
              </p>
            )}
        </div>

        <div>
          <h1>Redeem ETH</h1>
          <input
            type="number"
            placeholder="Amount"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
          />
          <button
            disabled={
              !address ||
              (redeemWaitForTransaction?.isLoading ||
              redeemContractWrite?.isLoading)
            }
            onClick={async () => {
              try {
                await redeemContractWrite?.writeAsync?.();
              } catch (err) {}
            }}
          >
            {(redeemWaitForTransaction?.isLoading ||
            redeemContractWrite?.isLoading)
              ? "Redeem..."
              : "Redeem"}
          </button>
          { userTokenBalance && (Number(formatEther?.(userTokenBalance)) < Number(redeemAmount===""?"0":redeemAmount)) && (
            <p>Insuffucient nUSD Token Balance For Redeem</p>
          )}

          {userTokenBalance && (calculateReceivedETHValue?.() > 0 &&
            Number(formatEther?.(userTokenBalance)) >= Number(redeemAmount===""?"0":redeemAmount)) && (
              <p>
                You will received{" "}
                {Number(calculateReceivedETHValue?.()).toFixed(4)} ETH Token
              </p>
            )}
        </div>
      </div>

      {/* totalSupply & User Token Balance */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: 12,
        }}
      >
        <div>
          <h3>
            Your nUSD Balance:{" "}
            {Number(userTokenBalance)>0
              ? Number(formatEther?.(userTokenBalance)).toFixed(4)
              : 0}{" "}
          </h3>
        </div>

        <div>
          <h3>
            Total nUSD Supply: {totalSupply && Number(formatEther?.(totalSupply)).toFixed(4)}
          </h3>
        </div> 
       </div>
      {transactions?.length > 0 && (
        <>
          <h3>Your Latest Transaction:</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              padding: 12,
            }}
          >
            <TransactionTable transactions={transactions} />
          </div>
        </>
      )}
    </>
  );
}

export default App;