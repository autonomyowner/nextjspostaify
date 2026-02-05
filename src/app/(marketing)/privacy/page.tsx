import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | POSTAIFY',
  description: 'Privacy Policy for POSTAIFY. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: February 2025
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              POSTAIFY (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered social media content generation platform
              at postaify.com (the &quot;Service&quot;).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our Service, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with this policy, please do
              not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>

            <h3 className="text-lg font-semibold mb-3 text-white">2.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Brand names, descriptions, and preferences you configure</li>
              <li><strong>Content Data:</strong> Text, prompts, and other content you input for AI generation</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store full card numbers)</li>
              <li><strong>Communications:</strong> Messages you send to our support team</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-6 text-white">2.2 Information from Google Sign-In</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you sign in using Google OAuth, we receive and store:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Email Address:</strong> Your Google account email for authentication and communication</li>
              <li><strong>Display Name:</strong> Your name as set in your Google account</li>
              <li><strong>Profile Picture:</strong> Your Google profile image (optional, for display purposes only)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We only request the minimum permissions needed to authenticate you. We do NOT access
              your Google Drive, Gmail, Contacts, Calendar, or any other Google services.
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-6 text-white">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Usage Data:</strong> Features used, content generated, and interaction patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, and pages viewed</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information solely to provide and improve our Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service Delivery:</strong> To authenticate you, process your requests, and generate AI content</li>
              <li><strong>Account Management:</strong> To manage your subscription, usage limits, and billing</li>
              <li><strong>Communication:</strong> To send service updates, security alerts, and support responses</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve our features (aggregated, non-personal data)</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, or security threats</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4 font-semibold">
              We do NOT use your data to train AI models. Your content remains yours.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. How We Share Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do NOT sell, rent, or trade your personal information. We share data only in these limited circumstances:
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">4.1 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We use trusted third-party services to operate our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Convex:</strong> Database and backend infrastructure</li>
              <li><strong>Stripe:</strong> Payment processing (PCI-compliant)</li>
              <li><strong>OpenRouter/AI Providers:</strong> AI content generation (prompts are processed, not stored by providers)</li>
              <li><strong>ElevenLabs:</strong> Voice synthesis for voiceovers</li>
              <li><strong>Runware/Fal.ai:</strong> Image generation</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These providers only process data as necessary to provide their services and are
              contractually obligated to protect your information.
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-6 text-white">4.2 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose information if required by law, court order, or government request,
              or to protect our rights, safety, or property.
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-6 text-white">4.3 Business Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, user data may be transferred.
              We will notify you before your data becomes subject to a different privacy policy.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your data only as long as necessary:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Generated Content:</strong> Stored until you delete it or your account</li>
              <li><strong>Usage Logs:</strong> Retained for up to 12 months for security and analytics</li>
              <li><strong>Payment Records:</strong> Retained as required by tax and accounting laws (typically 7 years)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              When you delete your account, we delete or anonymize your personal data within 30 days,
              except where retention is required by law.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-card rounded-xl p-6 border border-primary">
            <h2 className="text-2xl font-semibold mb-4 text-primary">6. Your Rights and Choices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information in your account settings</li>
              <li><strong>Deletion:</strong> Delete your account and associated data from your dashboard settings</li>
              <li><strong>Export:</strong> Request an export of your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Revoke Google OAuth access at any time via your Google Account settings</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (service emails cannot be opted out)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@postaify.com" className="text-primary hover:underline">
                privacy@postaify.com
              </a>
              {' '}or use the self-service options in your account settings.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All data transmitted over HTTPS (TLS encryption)</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>OAuth tokens are securely stored and regularly rotated</li>
              <li>Access controls limit employee access to personal data</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              While we strive to protect your data, no method of transmission over the Internet
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling essential cookies
              may prevent you from using the Service.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              POSTAIFY is not intended for users under 18 years of age. We do not knowingly
              collect personal information from children. If we learn that we have collected
              data from a child under 18, we will delete it promptly. If you believe a child
              has provided us with personal information, please contact us.
            </p>
          </section>

          {/* International */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be processed in countries other than your own, including the United States.
              These countries may have different data protection laws. By using our Service, you
              consent to the transfer of your data to these countries. We ensure appropriate
              safeguards are in place to protect your information.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service may contain links to third-party websites or services. We are not
              responsible for the privacy practices of these third parties. We encourage you
              to read their privacy policies before providing any personal information.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date. For material changes, we will provide notice via email
              or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mt-4">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@postaify.com" className="text-primary hover:underline">
                  privacy@postaify.com
                </a>
              </li>
              <li>
                <strong>General Support:</strong>{' '}
                <a href="mailto:support@postaify.com" className="text-primary hover:underline">
                  support@postaify.com
                </a>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We will respond to privacy inquiries within 30 days.
            </p>
          </section>

          {/* Google API Disclosure */}
          <section className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-white">14. Google API Services Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              POSTAIFY&apos;s use and transfer of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Specifically, we limit our use of Google user data to providing authentication
              services. We do not use Google data for advertising, do not sell Google data,
              and do not use Google data for any purpose other than providing and improving
              user-facing features of our Service.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By using POSTAIFY, you acknowledge that you have read and understand this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
