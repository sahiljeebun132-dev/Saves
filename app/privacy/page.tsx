"use client";

import React from "react";

const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
      <span role="img" aria-label="lock">🔐</span> Privacy Policy
    </h1>
    <p className="text-sm mb-4">
      <strong>Effective date:</strong> 31/01/2026<br />
      <strong>Website:</strong> <a href="https://www.mydoctor.mu" className="text-blue-600 underline">www.mydoctor.mu</a>
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Overview</h2>
    <p>
      This Privacy Policy describes how <strong>MyDoctor.mu</strong> collects, uses, discloses, and protects personal data when you use our Website or Services. We are committed to protecting your privacy in compliance with <strong>Mauritius Data Protection Act 2017 (DPA 2017)</strong>.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. Data We Collect</h2>
    <p>We may collect the following types of information:</p>
    <ul className="list-disc ml-6 mb-2">
      <li><strong>Personal Data</strong>
        <ul className="list-disc ml-6">
          <li>Name, email address, phone number</li>
          <li>Contact preferences</li>
          <li>Account information</li>
        </ul>
      </li>
      <li><strong>Usage Data</strong>
        <ul className="list-disc ml-6">
          <li>IP address, device type, browser, pages visited</li>
        </ul>
      </li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. How We Use Personal Data</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>Provide and improve our Services</li>
      <li>Communicate with you, including booking confirmations</li>
      <li>Comply with legal obligations</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">4. Legal Basis for Processing</h2>
    <p>We process Personal Data only if:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>You have given consent</li>
      <li>It is necessary to provide the Services</li>
      <li>It is required by law</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights Under DPA 2017</h2>
    <p>Under Mauritius law, data subjects have the right to:</p>
    <ul className="list-disc ml-6 mb-2">
      <li>Request access to their Personal Data</li>
      <li>Request correction or deletion</li>
      <li>Object to processing and direct marketing</li>
      <li>Withdraw consent at any time without affecting prior lawful processing</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies and Tracking</h2>
    <p>We may use cookies to enhance user experience. You may control cookie preferences through your browser settings.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">7. Sharing With Third Parties</h2>
    <p>We may share data with service providers that help deliver the Services (e.g., IT, hosting), but only as necessary and in compliance with applicable law.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">8. International Data Transfers</h2>
    <p>Data may be processed or stored outside Mauritius where appropriate safeguards are in place, or with your explicit consent.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">9. Data Security</h2>
    <p>We implement technical and organizational measures to protect your data; however, no system is completely secure.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">10. Retention of Data</h2>
    <p>We retain Personal Data only for as long as necessary for the purpose collected or required by law.</p>
    <h2 className="text-xl font-semibold mt-6 mb-2">11. Changes to This Policy</h2>
    <p>We may update this policy by posting the revised version on the Website.</p>
  </div>
);

export default PrivacyPolicy;
