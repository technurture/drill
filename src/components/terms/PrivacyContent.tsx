import React from "react";
import ContentSection from "./ContentSection";

const PrivacyContent = () => {
  return (
    <>
      <ContentSection id="privacy-intro" title="Privacy Policy">
        <p className="text-lg font-semibold mb-4">
          Effective Date: September 2025
        </p>
        <p className="leading-7">
          Welcome to SheBalance! Your privacy is important to us. This Privacy
          Policy explains how we collect, use, share, and protect your personal
          information when you use our platform. By accessing or using SheBalance,
          you agree to the practices outlined in this policy. If you do not
          agree, please refrain from using our services.
        </p>
      </ContentSection>

      <ContentSection id="privacy-intro" title="1. Privacy Introduction">
        <p className="leading-7">
          This Privacy Policy describes the types of information we collect from
          users, how it is processed, and your rights regarding your data.
          SheBalance is committed to protecting your privacy and ensuring
          compliance with applicable data protection laws.
        </p>
        <p className="leading-7 mt-4">
          We collect and use information solely for providing and improving our
          services. We never sell your personal information to third parties.
        </p>
      </ContentSection>

      <ContentSection
        id="information-collection"
        title="2. Information We Collect"
      >
        <p className="leading-7">
          We collect information in several ways, including when you provide it
          directly to us, automatically through your use of the platform, or
          through third-party integrations.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          2.1 Information You Provide
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Account Information: Name, email address, phone number, and other
            details provided during registration.
          </li>
          <li>
            Billing Information: Payment details, such as credit card
            information, billing address, and transaction history.
          </li>
          <li>
            User-Generated Content: Data you upload, such as sales records,
            inventory details, and employee profiles.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          2.2 Information Collected Automatically
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Device Information: IP address, browser type, operating system, and
            device identifiers.
          </li>
          <li>
            Usage Data: Details of your interactions with the platform,
            including navigation paths, features used, and time spent on pages.
          </li>
          <li>
            Location Data: Approximate location derived from your IP address.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          2.3 Information from Third Parties
        </h3>
        <p className="leading-7">
          If you integrate third-party services (e.g., payment gateways or
          analytics tools) with SheBalance, we may collect data shared by those
          services, such as payment confirmations or user behavior analytics.
        </p>
      </ContentSection>

      <ContentSection id="information-usage" title="3. How We Use Information">
        <p className="leading-7">
          We use your data to provide, maintain, and enhance our services, as
          well as to support business operations.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          3.1 Service Provision and Optimization
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>To create and manage your account.</li>
          <li>To process payments and handle subscription billing.</li>
          <li>
            To deliver notifications, including subscription reminders and sales
            updates.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Communication</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>To respond to inquiries and provide customer support.</li>
          <li>To send updates, promotions, and important policy changes.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          3.3 Analytics and Improvements
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            To understand how users interact with the platform and improve user
            experience.
          </li>
          <li>To develop new features and services based on user needs.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          3.4 Legal and Security Purposes
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>To comply with legal obligations and enforce our terms.</li>
          <li>To detect, prevent, and address fraud or security breaches.</li>
        </ul>
      </ContentSection>

      <ContentSection
        id="information-sharing"
        title="4. How We Share Information"
      >
        <p className="leading-7">
          We share your data only in limited circumstances, as outlined below:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          4.1 With Service Providers
        </h3>
        <p className="leading-7">
          We may share information with third-party vendors and partners who
          perform services on our behalf, such as payment processors, cloud
          storage providers, or customer support platforms.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          4.2 With Business Partners
        </h3>
        <p className="leading-7">
          If you integrate third-party tools or services, we may share relevant
          information to enable those integrations.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          4.3 For Legal and Safety Reasons
        </h3>
        <p className="leading-7">We may disclose your data if required to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Comply with applicable laws or government requests.</li>
          <li>
            Protect our rights, property, or users from harm or illegal
            activity.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          4.4 In Case of Business Transfers
        </h3>
        <p className="leading-7">
          In the event of a merger, acquisition, or sale of SheBalance's assets,
          user information may be transferred to the new entity under the same
          privacy protections.
        </p>
      </ContentSection>

      <ContentSection id="data-security" title="5. Data Security">
        <p className="leading-7">
          We take the security of your data seriously and employ
          industry-standard measures to safeguard it, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Encryption: All sensitive information is encrypted during
            transmission and at rest.
          </li>
          <li>
            Access Controls: Access to your data is restricted to authorized
            personnel only.
          </li>
          <li>
            Regular Audits: We regularly review our systems for vulnerabilities
            and unauthorized access.
          </li>
        </ul>
        <p className="leading-7 mt-4">
          However, no system is completely secure. While we strive to protect
          your information, we cannot guarantee absolute security.
        </p>
      </ContentSection>

      <ContentSection id="your-rights" title="6. Your Rights">
        <p className="leading-7">
          You have specific rights regarding your personal data, including:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.1 Access and Correction
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You can access your personal information at any time through your
            account settings.
          </li>
          <li>
            If any information is inaccurate or incomplete, you may request
            corrections.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Deletion</h3>
        <p className="leading-7">
          You can request the deletion of your data. Note that we may retain
          certain information to comply with legal obligations or resolve
          disputes.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.3 Restriction of Processing
        </h3>
        <p className="leading-7">
          You may request to restrict how we use your information in certain
          circumstances.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.4 Data Portability
        </h3>
        <p className="leading-7">
          Upon request, we can provide your data in a structured, commonly used,
          and machine-readable format.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.5 Opt-Out of Communications
        </h3>
        <p className="leading-7">
          You can unsubscribe from promotional emails at any time.
        </p>
        <p className="leading-7 mt-4">
          To exercise any of these rights, contact us at support@SheBalance.ng.
        </p>
      </ContentSection>

      <ContentSection id="cookies" title="7. Cookies">
        <p className="leading-7">
          SheBalance uses cookies and similar tracking technologies to enhance user
          experience and gather analytics.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          7.1 What Are Cookies?
        </h3>
        <p className="leading-7">
          Cookies are small files stored on your device to identify you and
          improve your experience.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          7.2 Types of Cookies We Use
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Essential Cookies: Required for the platform to function properly.
          </li>
          <li>
            Performance Cookies: Used to track user activity and optimize
            performance.
          </li>
          <li>Functional Cookies: Remember your preferences and settings.</li>
        </ul>
        <p className="leading-7 mt-4">
          You can manage or disable cookies through your browser settings, but
          doing so may affect platform functionality.
        </p>
      </ContentSection>

      <ContentSection id="third-party" title="8. Third-Party Services">
        <p className="leading-7">
          Our platform may include links or integrations with third-party
          services, such as payment processors or analytics tools. These
          services operate independently and have their own privacy policies.
        </p>
        <p className="leading-7 mt-4">
          We are not responsible for the practices or content of third-party
          services. We encourage you to review their policies before interacting
          with them.
        </p>
      </ContentSection>

      <ContentSection id="privacy-updates" title="9. Updates to Privacy Policy">
        <p className="leading-7">
          We reserve the right to modify this Privacy Policy at any time.
          Significant changes will be communicated via email or notifications on
          the platform.
        </p>
        <p className="leading-7 mt-4">
          The "Effective Date" at the top of this page indicates when this
          policy was last updated. Continued use of the platform after updates
          constitutes acceptance of the revised Privacy Policy.
        </p>
      </ContentSection>

      <ContentSection id="contact" title="10. Contact Information">
        <p className="leading-7">
          If you have any questions or concerns about this Privacy Policy,
          please contact us:
        </p>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Email:</strong> support@SheBalance.ng
          </p>
          <p>
            <strong>Address:</strong> Kwara State, Nigeria
          </p>
        </div>
      </ContentSection>
    </>
  );
};

export default PrivacyContent;
