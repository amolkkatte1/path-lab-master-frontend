"use client";

import Image from "next/image";
import { useState } from "react";

const monthlyPlans = [
  { id: "1m", label: "1 Month", price: 1000, maxBills: 1500 },
  { id: "3m", label: "3 Month", price: 2800, maxBills: 4599 },
  { id: "6m", label: "6 Month", price: 5500, maxBills: 9000 },
];

const yearlyPlan = { id: "1y", label: "1 Year", price: 10000, maxBills: 18000 };

export default function SubscriptionPage() {
  const [billingType, setBillingType] = useState<"yearly" | "monthly">(
    "monthly"
  );

  const [selectedPlan, setSelectedPlan] = useState("1m");

  const activePlans = billingType === "monthly" ? monthlyPlans : [yearlyPlan];
  const activePlan =
    activePlans.find((plan) => plan.id === selectedPlan) ?? activePlans[0];

  const handleBillingChange = (nextBillingType: "yearly" | "monthly") => {
    setBillingType(nextBillingType);
    setSelectedPlan(nextBillingType === "monthly" ? "1m" : "1y");
  };

  return (
    <div className="subscription-page">
      {/* ================= HEADER ================= */}
      <div className="section-header">RENEWAL PACKAGES</div>

      {/* ================= MAIN ================= */}
      <div className="subscription-content">
        <div className="left-section">
          <div className="renewal-title">
            Renewal plan is in your cart

            <div className="billing-toggle">
              <button
                className={billingType === "yearly" ? "active" : ""}
                onClick={() => handleBillingChange("yearly")}
              >
                Yearly
              </button>

              <button
                className={billingType === "monthly" ? "active" : ""}
                onClick={() => handleBillingChange("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* ================= PLAN BOX ================= */}
          <div className="plan-box">
            <div className="plan-heading">Select plan</div>

            {activePlans.map((plan) => (
              <div className="plan-row" key={plan.id}>
                <label className="plan-radio">
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                  />

                  <span>
                    {`${plan.label} - ${plan.price}`}
                    <span className="max-bills">(Max Bills: {plan.maxBills})</span>
                  </span>
                </label>

                <div className="plan-price">₹ {plan.price}</div>
              </div>
            ))}

            <div className="plan-description">
             
              {billingType === "monthly"
                ? `${activePlan.label} (INR ${activePlan.price})`
                : `1 Year (INR ${activePlan.price})`}
            </div>
          </div>
        </div>

        {/* ================= ORDER SUMMARY ================= */}
        <div className="order-summary">
          <h2>Order summary</h2>

          <div className="summary-box">
            <div className="summary-row">
              <strong>Total</strong>

              <span className="total-price">₹ {activePlan.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT HEADER ================= */}
      <div className="payment-header">PAY VIA NEFT OR UPI CODE</div>

      {/* ================= PAYMENT CONTENT ================= */}
      <div className="payment-section">
        <div className="bank-details">
          <p className="payment-note">
            After payment send payment details to Ph: <strong>+91 7972925658</strong>
          </p>

          <p>
            <strong>Bank Name :</strong> State Bank of India
          </p>

          <p>
            <strong>Name :</strong> Shivani Shivalinga Mahajan
          </p>

          <p>
            <strong>A/C No :</strong> 62369862204
          </p>

          <p>
            <strong>IFSC Code :</strong> SBIN0020307
          </p>

          <p>
            <strong>Branch :</strong> Tamsa Nanded - 431713, MH,
            India
          </p>
        </div>

        {/* ================= QR ================= */}
        <div className="qr-section">
          <div className="qr-title">Scan QR to pay</div>

          <div className="qr-content">
            <div className="upi-details">
              
            </div>

            <div className="qr-image-wrapper">
              <Image
                src="/PaymentQr.jpeg"
                alt="UPI Payment QR"
                width={220}
                height={220}
                className="qr-image"
              />
            </div>
          </div>

          <div className="qr-note">
            Scan the QR with any
            <br />
            BharatQR / UPI enabled app
          </div>
        </div>
      </div>
    </div>
  );
}