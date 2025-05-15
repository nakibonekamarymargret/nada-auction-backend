import React from 'react'

function TermsAndConditionsPage() {
  return (
    <>
     
      <div className="max-w-4xl mx-auto px-6 py-12  text-gray-800 font-tenor">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Terms and Conditions
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to our Auction Platform. These Terms and Conditions outline
            the rules and regulations for the use of our website and services.
            By accessing this site, you agree to be bound by these terms. If you
            disagree with any part, please do not use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">2. Eligibility</h2>
          <p className="text-muted-foreground">
            You must be at least 18 years old to register and participate in
            auctions. By using the platform, you warrant that you meet this
            requirement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            3. Account Responsibilities
          </h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your
            login credentials. Any activity that occurs under your account is
            your responsibility. Notify us immediately of any unauthorized use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">4. Auction Rules</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>All bids are final and binding.</li>
            <li>
              Sellers must provide accurate descriptions of their products.
            </li>
            <li>
              The platform reserves the right to cancel or suspend auctions at
              its discretion.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">5. Payments and Fees</h2>
          <p className="text-muted-foreground">
            Buyers are required to complete payment within the specified time
            after winning an auction. Additional fees such as service or
            transaction charges may apply, and will be clearly outlined.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">6. Termination</h2>
          <p className="text-muted-foreground">
            We reserve the right to suspend or terminate your account if you
            breach any of these Terms. Misuse of the platform or fraudulent
            activities may result in permanent bans.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">7. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may revise these Terms and Conditions at any time. Changes will
            be effective immediately once posted. Continued use of the platform
            means you accept the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms and Conditions, please
            contact us at{" "}
            <a
              href="mailto:support@auctionplatform.com"
              className="text-blue-600 hover:underline"
            >
              nada@support.com
            </a>
            .
          </p>
        </section>
      </div>
     
    </>
  );
}

export default TermsAndConditionsPage