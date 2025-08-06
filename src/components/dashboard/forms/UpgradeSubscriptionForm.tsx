'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UpgradeSubscriptionFormProps {
  className?: string;
  onSubmit?: (data: any) => void;
}

export function UpgradeSubscriptionForm({ className, onSubmit }: UpgradeSubscriptionFormProps) {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    notes: '',
    agreeToTerms: false,
    allowEmails: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ ...formData, plan: selectedPlan });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upgrade your subscription
        </h3>
        <p className="text-sm text-gray-600">
          You are currently on the free plan. Upgrade to the pro plan to get access to all features.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Evil Rabbit"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@acme.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
            placeholder="1234 1234 1234 1234"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={formData.expiry}
            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
            placeholder="MM/YY"
            className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={formData.cvc}
            onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
            placeholder="CVC"
            className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Select the plan that best fits your needs.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <label className={cn(
            "relative flex cursor-pointer rounded-lg border p-4 transition-all",
            selectedPlan === 'starter' 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          )}>
            <input
              type="radio"
              name="plan"
              value="starter"
              checked={selectedPlan === 'starter'}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="sr-only"
            />
            <div>
              <p className="font-medium text-gray-900">Starter Plan</p>
              <p className="text-sm text-gray-600">Perfect for small businesses.</p>
            </div>
          </label>
          <label className={cn(
            "relative flex cursor-pointer rounded-lg border p-4 transition-all",
            selectedPlan === 'pro' 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          )}>
            <input
              type="radio"
              name="plan"
              value="pro"
              checked={selectedPlan === 'pro'}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="sr-only"
            />
            <div>
              <p className="font-medium text-gray-900">Pro Plan</p>
              <p className="text-sm text-gray-600">More features and storage.</p>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Enter notes"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the terms and conditions
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.allowEmails}
            onChange={(e) => setFormData({ ...formData, allowEmails: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Allow us to send you emails
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </button>
      </div>
    </form>
  );
}