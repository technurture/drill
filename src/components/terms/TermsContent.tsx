import React from "react";
import ContentSection from "./ContentSection";

const TermsContent = () => {
  return (
    <>
      <ContentSection id="introduction" title="Terms of Service">
        <p className="text-lg font-semibold mb-4">
          Effective Date: September 2025
        </p>
        <p className="leading-7">
          Welcome to SheBalance! By accessing or using our platform, you agree to
          be bound by these Terms of Service (the "Terms"). These Terms
          constitute a legally binding agreement between you ("User," "you," or
          "your") and SheBalance ("we," "our," or "us"). If you do not agree to
          these Terms, you must not use our platform.
        </p>
      </ContentSection>

      <ContentSection id="introduction" title="1. Introduction">
        <p className="leading-7">
          This document outlines the rules and regulations for using SheBalance, a
          platform designed to help store owners manage inventory, track sales,
          monitor employee activities, and perform other business-related tasks.
          These Terms apply to all users, including registered account holders,
          employees, and administrators.
        </p>
        <p className="leading-7 mt-4">
          By using our platform, you represent that you are at least 18 years
          old or have the legal authority to bind your organization to these
          Terms.
        </p>
        <p className="leading-7 mt-4">
          We may update these Terms from time to time. It is your responsibility
          to review them periodically for changes. Continued use of our platform
          after updates indicates your acceptance of the revised Terms.
        </p>
      </ContentSection>

      <ContentSection
        id="account-responsibilities"
        title="2. Account Registration"
      >
        <h3 className="text-lg font-semibold mb-2">2.1 Eligibility</h3>
        <p className="leading-7">
          To create an account, you must provide accurate and complete
          information during the registration process. You are solely
          responsible for ensuring the information you provide is correct and up
          to date.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          2.2 Account Security
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials, including your username and password.
          </li>
          <li>
            You must notify us immediately of any unauthorized access to your
            account or breach of security.
          </li>
          <li>
            SheBalance is not liable for losses resulting from unauthorized use of
            your account.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          2.3 Multiple Accounts
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Each user is permitted to have only one account unless explicitly
            approved by us.
          </li>
          <li>Sharing accounts across multiple users is prohibited.</li>
        </ul>
      </ContentSection>

      <ContentSection id="billing" title="3. Subscription and Billing">
        <h3 className="text-lg font-semibold mb-2">3.1 Subscription Plans</h3>
        <p className="leading-7">
          SheBalance operates on a subscription basis. By registering for a
          subscription, you agree to pay the applicable fees for your selected
          plan, which may include monthly or annual billing cycles.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Payment</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Payments are processed through third-party services, and you must
            provide valid and up-to-date payment information.
          </li>
          <li>
            By subscribing, you authorize us to charge the subscription fee to
            your payment method on a recurring basis.
          </li>
          <li>
            Failure to process payment due to invalid details may result in
            account suspension or termination.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Refund Policy</h3>
        <p className="leading-7">
          All subscription fees are non-refundable, except where required by
          law. We reserve the right to evaluate refund requests on a
          case-by-case basis.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          3.4 Changes to Subscription Plans
        </h3>
        <p className="leading-7">
          We reserve the right to change subscription fees or features of any
          plan with prior notice. Any changes will take effect at the end of
          your current billing cycle.
        </p>
      </ContentSection>

      <ContentSection id="usage" title="4. Usage Restrictions">
        <p className="leading-7">
          By using SheBalance, you agree to the following restrictions:
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          Prohibited Activities: You must not:
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Reverse-engineer, decompile, or disassemble any part of the
            platform.
          </li>
          <li>
            Attempt unauthorized access to our servers, databases, or other
            resources.
          </li>
          <li>Use the platform for illegal or fraudulent activities.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">Data Integrity:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You may not upload or share content that is false, misleading, or
            harmful.
          </li>
          <li>
            Manipulating data to generate false reports is strictly prohibited.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          Sharing and Redistribution:
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You may not sell, license, or share access to the platform without
            our written consent.
          </li>
          <li>
            Failure to comply with these restrictions may result in the
            suspension or termination of your account.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="ownership" title="5. Data and Content Ownership">
        <h3 className="text-lg font-semibold mb-2">5.1 User Data</h3>
        <p className="leading-7">
          As a user, you retain ownership of all data and content you upload to
          SheBalance. However, you grant us a non-exclusive, royalty-free license
          to use your data solely for the purpose of providing and improving our
          services.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.2 Platform Content
        </h3>
        <p className="leading-7">
          All content, trademarks, and intellectual property on the platform are
          owned by SheBalance. You may not copy, distribute, or modify any part of
          the platform without prior authorization.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          5.3 Data Responsibility
        </h3>
        <p className="leading-7">
          While we take all reasonable precautions to protect your data, we are
          not liable for data loss caused by user negligence, third-party
          breaches, or force majeure events.
        </p>
      </ContentSection>

      <ContentSection id="termination" title="6. Termination">
        <h3 className="text-lg font-semibold mb-2">
          6.1 User-Initiated Termination
        </h3>
        <p className="leading-7">
          You may terminate your account at any time by contacting customer
          support or through the account settings page.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.2 Termination by SheBalance
        </h3>
        <p className="leading-7">
          We reserve the right to terminate your account immediately if:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You violate these Terms.</li>
          <li>We detect fraudulent or unauthorized activities.</li>
          <li>
            Your subscription payments are overdue beyond the grace period.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          6.3 Effect of Termination
        </h3>
        <p className="leading-7">Upon termination:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You will lose access to your account and associated data.</li>
          <li>Subscription fees for the remaining term are non-refundable.</li>
        </ul>
      </ContentSection>

      <ContentSection id="liability" title="7. Limitation of Liability">
        <p className="leading-7">To the fullest extent permitted by law:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            SheBalance shall not be held liable for indirect, incidental, or
            consequential damages, including loss of profits, data, or business
            opportunities.
          </li>
          <li>
            Our total liability for any claim arising from these Terms shall not
            exceed the total amount of fees you paid to SheBalance in the 12 months
            preceding the claim.
          </li>
        </ul>
      </ContentSection>

      <ContentSection id="dispute" title="8. Dispute Resolution">
        <h3 className="text-lg font-semibold mb-2">8.1 Arbitration</h3>
        <p className="leading-7">
          All disputes arising from or related to these Terms will be resolved
          through binding arbitration under the rules of Nigerian Institute of
          Chartered Arbitrators, and local customs and traditions.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.2 Governing Law</h3>
        <p className="leading-7">
          These Terms shall be governed by and construed in accordance with the
          laws of the Federal Republic of Nigeria.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">8.3 Exception</h3>
        <p className="leading-7">
          You may seek relief in small claims court for disputes that qualify.
        </p>
      </ContentSection>

      <ContentSection id="changes" title="9. Changes to Terms">
        <p className="leading-7">
          We reserve the right to update these Terms at any time. Significant
          changes will be communicated to users via email or through a notice on
          the platform.
        </p>
        <p className="leading-7 mt-4">
          Continued use of SheBalance after changes to these Terms indicates your
          acceptance of the revised Terms. If you do not agree, you must stop
          using the platform immediately.
        </p>
        <p className="leading-7 mt-4">
          By using SheBalance, you acknowledge that you have read, understood, and
          agree to these Terms of Service. If you have any questions, please
          contact us at support@SheBalance.ng.
        </p>
      </ContentSection>
    </>
  );
};

export default TermsContent;
