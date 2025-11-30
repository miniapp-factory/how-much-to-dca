"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Calculator() {
  const [totalTokens, setTotalTokens] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [pairAddress, setPairAddress] = useState("");
  const [option, setOption] = useState("target");
  const [targetAverage, setTargetAverage] = useState("");
  const [availableToInvest, setAvailableToInvest] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!pairAddress) return;
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/base/${pairAddress}`);
      const data = await res.json();
      if (data && data.pairs && data.pairs[0] && data.pairs[0].priceUsd) {
        setCurrentPrice(data.pairs[0].priceUsd);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculate = () => {
    const T = parseFloat(totalTokens);
    const C = parseFloat(totalCost);
    const P = parseFloat(currentPrice);

    if (isNaN(T) || isNaN(C) || isNaN(P)) {
      setResult("Please enter valid numbers for tokens, cost, and price.");
      return;
    }

    if (option === "target") {
      const A = parseFloat(targetAverage);
      if (isNaN(A)) {
        setResult("Please enter a valid target average.");
        return;
      }
      if (P === A) {
        setResult("Current price equals target average; no purchase needed.");
        return;
      }
      const n = (A * T - C) / (P - A);
      if (n <= 0) {
        setResult("Target average already achieved or unreachable with current price.");
        return;
      }
      const spend = n * P;
      setResult(
        `You need to buy ${n.toFixed(4)} tokens, spending $${spend.toFixed(2)} to reach an average of $${A.toFixed(2)}.`
      );
    } else {
      const M = parseFloat(availableToInvest);
      if (isNaN(M)) {
        setResult("Please enter a valid amount to invest.");
        return;
      }
      const newTokens = M / P;
      const newTotalTokens = T + newTokens;
      const newTotalCost = C + M;
      const newAvg = newTotalCost / newTotalTokens;
      setResult(
        `After investing $${M.toFixed(2)}, you can buy ${newTokens.toFixed(4)} tokens, and your new average price will be $${newAvg.toFixed(2)}.`
      );
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>How Much to DCA</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="totalTokens">Total Tokens Owned</Label>
          <Input
            id="totalTokens"
            type="number"
            value={totalTokens}
            onChange={(e) => setTotalTokens(e.target.value)}
            placeholder="e.g., 100"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="totalCost">Total Cost for All Tokens</Label>
          <Input
            id="totalCost"
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="e.g., 5000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="averagePrice">Average Price per Token</Label>
          <Input
            id="averagePrice"
            type="number"
            value={totalTokens && totalCost ? (parseFloat(totalCost)/parseFloat(totalTokens)).toFixed(4) : ""}
            readOnly
            placeholder="Average"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pairAddress">Pair Address</Label>
          <Input
            id="pairAddress"
            type="text"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            placeholder="e.g., 0x..."
          />
        </div>
        <div className="grid gap-2">
          <Button onClick={fetchPrice} className="w-full">
            Fetch Price
          </Button>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentPrice">Current Price of the Token</Label>
          <Input
            id="currentPrice"
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="e.g., 50"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="option">Calculation Option</Label>
          <Select
            value={option}
            onValueChange={(value) => setOption(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="target">Target Average Shares</SelectItem>
              <SelectItem value="available">Amount Available to Invest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {option === "target" && (
          <div className="grid gap-2">
            <Label htmlFor="targetAverage">Target Average Price</Label>
            <Input
              id="targetAverage"
              type="number"
              value={targetAverage}
              onChange={(e) => setTargetAverage(e.target.value)}
              placeholder="e.g., 45"
            />
          </div>
        )}
        {option === "available" && (
          <div className="grid gap-2">
            <Label htmlFor="availableToInvest">Amount Available to Invest</Label>
            <Input
              id="availableToInvest"
              type="number"
              value={availableToInvest}
              onChange={(e) => setAvailableToInvest(e.target.value)}
              placeholder="e.g., 2000"
            />
          </div>
        )}
        <Button onClick={handleCalculate} className="w-full">
          CALCULATE
        </Button>
        {result && (
          <div className="mt-4 p-2 bg-muted rounded">
            <p>{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
