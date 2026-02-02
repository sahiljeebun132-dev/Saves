"use client";

import React from "react";

const TermsAndConditions = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
      <span role="img" aria-label="document">📄</span> Terms and Conditions
    </h1>
    <p className="text-sm mb-4">
      <strong>Effective date:</strong> 31/01/2026<br />
      <strong>Website:</strong> <a href="https://www.mydoctor.mu" className="text-blue-600 underline">www.mydoctor.mu</a>
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
    <p>
      Welcome to <strong>MyDoctor.mu</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the mydoctor.mu website (&quot;Website&quot;) and services provided through it (&quot;Services&quot;). By accessing or using the Website, you agree to comply with and be bound by these Terms. If you do not agree, do not use the Website.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">2. Eligibility</h2>
    <p>
      You must be at least 18 years old to use this Website or certain Services. By using the Website, you confirm that you are 18 or older and have the legal right to enter into a binding agreement.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">3. Use of the Website</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>You agree to use the Website only for lawful purposes and in accordance with these Terms.</li>
      <li>You must not use the Website to upload, post, or transmit unlawful, harmful, defamatory, or offensive content.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">4. Accounts and Registration</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>Some Services may require you to create an account.</li>
      <li>You agree to provide accurate, current, and complete information and to keep it updated.</li>
      <li>You are responsible for safeguarding your account credentials and any activity under your account.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">5. Appointment Booking and Healthcare Services</h2>
    <ul className="list-disc ml-6 mb-2">
      <li><strong>MyDoctor.mu</strong> acts as a <em>platform intermediary</em> facilitating connections between users and healthcare providers. We do not provide medical consultation, diagnosis, or treatment.</li>
      <li>Users should exercise independent judgment and verify provider credentials before booking or engaging a professional.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">6. Intellectual Property</h2>
    <p>
      All Website content (&quot;Content&quot;), including text, graphics, logos, and software, is owned by us or our licensors. You may not copy, distribute, or modify any Content without our express permission.
    </p>
    <h2 className="text-xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>To the maximum extent permitted by law, MyDoctor.mu and its affiliates are not liable for indirect, consequential, or punitive damages arising from your use of the Website or Services.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">8. Modification of Terms</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>We may update these Terms at any time by posting the revised Terms on the Website. Continued use after changes constitutes acceptance of the new Terms.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-6 mb-2">9. Governing Law</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>These Terms are governed by the laws of <strong>Mauritius</strong>. Any disputes will be resolved in a court of competent jurisdiction in Mauritius.</li>
    </ul>
  </div>
);

export default TermsAndConditions;
