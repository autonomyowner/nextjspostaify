import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | POSTAIFY',
  description: 'Terms of Service for POSTAIFY. Read about acceptable use of our AI content generation platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: February 2025
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to POSTAIFY. These Terms of Service (&quot;Terms&quot;) govern your access to and use
              of the POSTAIFY website at postaify.com and all related services (collectively, the &quot;Service&quot;).
              POSTAIFY is operated by POSTAIFY (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing or using our Service, you agree to be bound by these Terms and our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              POSTAIFY is an AI-powered social media content generation platform that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI-generated text content for social media posts</li>
              <li>AI-powered image generation for marketing materials</li>
              <li>AI voice synthesis for voiceovers</li>
              <li>Brand profile management and content scheduling</li>
              <li>Content calendar and publishing tools</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Features may
              be added, modified, or removed at our discretion.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Account Registration and Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use certain features of the Service, you must create an account. When creating an account:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You must be at least 18 years old</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One person or entity may not maintain more than one free account</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may sign in using email/password or Google OAuth. By using Google Sign-In, you
              authorize us to access your basic profile information as described in our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Acceptable Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes. You may NOT:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Generate content that is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Create misleading, deceptive, or fraudulent content</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Generate content that exploits or harms minors</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Distribute malware, spam, or unsolicited communications</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated means to access the Service without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the Service for any competitive analysis</li>
            </ul>
          </section>

          {/* Fair Use Policy */}
          <section className="bg-card rounded-xl p-6 border border-primary">
            <h2 className="text-2xl font-semibold mb-4 text-primary">5. Fair Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To ensure quality service for all users, POSTAIFY implements fair use guidelines
              for AI-powered features. These guidelines help us maintain affordable pricing
              while preventing abuse.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Monthly Usage Limits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">Feature</th>
                    <th className="text-center py-2 text-muted-foreground">Free</th>
                    <th className="text-center py-2 text-muted-foreground">Pro ($19/mo)</th>
                    <th className="text-center py-2 text-muted-foreground">Business ($49/mo)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Posts</td>
                    <td className="text-center py-2">20</td>
                    <td className="text-center py-2">1,000</td>
                    <td className="text-center py-2">90,000</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">AI Images</td>
                    <td className="text-center py-2">5</td>
                    <td className="text-center py-2">200</td>
                    <td className="text-center py-2">1,000</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">AI Voiceovers</td>
                    <td className="text-center py-2">2</td>
                    <td className="text-center py-2">30</td>
                    <td className="text-center py-2">150</td>
                  </tr>
                  <tr>
                    <td className="py-2">Brands</td>
                    <td className="text-center py-2">2</td>
                    <td className="text-center py-2">5</td>
                    <td className="text-center py-2">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold mb-3 text-white">Prohibited Uses</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Automated bulk generation without human review</li>
              <li>Reselling AI-generated content as a standalone service</li>
              <li>Using multiple accounts to circumvent limits</li>
              <li>Sharing account credentials with third parties</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Content Ownership and License</h2>

            <h3 className="text-lg font-semibold mb-3 text-white">6.1 Your Content</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of all content you create using POSTAIFY, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI-generated text content and posts</li>
              <li>AI-generated images (subject to underlying AI model terms)</li>
              <li>AI-generated voiceovers</li>
              <li>Brand profiles and configurations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You grant POSTAIFY a limited, non-exclusive license to process, store, and display
              your content solely for the purpose of providing the Service. We do NOT use your
              content to train AI models.
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-6 text-white">6.2 Our Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, features, code, and documentation, is owned by
              POSTAIFY and protected by intellectual property laws. You may not copy, modify,
              distribute, or create derivative works without our written permission.
            </p>
          </section>

          {/* AI-Generated Content */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. AI-Generated Content Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AI-generated content requires human oversight. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI may occasionally produce inaccurate, inappropriate, or nonsensical content</li>
              <li>You are solely responsible for reviewing all generated content before use</li>
              <li>AI-generated images may contain artifacts or imperfections</li>
              <li>You must comply with platform disclosure requirements for AI content</li>
              <li>We do not guarantee that AI content is free from third-party IP claims</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              POSTAIFY is not liable for any damages arising from your use of AI-generated content.
            </p>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Payment Terms</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Paid subscriptions are billed monthly or annually in advance</li>
              <li>All prices are in US Dollars (USD) unless otherwise stated</li>
              <li>Payment is processed securely through Stripe</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel at any time; cancellation takes effect at the end of the billing period</li>
              <li>No refunds for partial months or unused features</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
              <li>Failed payments may result in service suspension</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Google:</strong> For authentication (Google Sign-In)</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>AI Providers:</strong> For content generation (OpenRouter, ElevenLabs, Runware, Fal.ai)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Your use of these services is subject to their respective terms and privacy policies.
              We are not responsible for third-party service availability or performance.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive for high availability but do not guarantee uninterrupted service.
              The Service may be temporarily unavailable due to maintenance, updates, or
              circumstances beyond our control. Third-party AI providers may experience
              downtime that affects our Service. We will make reasonable efforts to
              communicate significant service disruptions.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information
              is governed by our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. By using the Service, you
              consent to the collection and use of information as described in our Privacy Policy.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Abuse the Fair Use Policy repeatedly</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Create content that harms POSTAIFY&apos;s reputation</li>
              <li>Fail to pay for subscription services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may delete your account at any time from your dashboard settings. Upon
              termination, your right to use the Service ceases immediately. We may retain
              certain data as required by law or for legitimate business purposes.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE
              OF PERFORMANCE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR COMPLETELY SECURE.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">14. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSTAIFY SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR
              RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE
              AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">15. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless POSTAIFY and its officers, directors,
              employees, and agents from any claims, damages, losses, or expenses (including
              reasonable legal fees) arising from your use of the Service, violation of these
              Terms, or infringement of any third-party rights.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">16. Governing Law and Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable law,
              without regard to conflict of law principles. Any disputes arising from these
              Terms or the Service shall be resolved through good faith negotiation. If
              negotiation fails, disputes shall be resolved through binding arbitration or
              in a court of competent jurisdiction.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">17. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of material changes
              by posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
              For significant changes, we will provide notice via email or through the Service.
              Your continued use of the Service after changes constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">18. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that
              provision shall be limited or eliminated to the minimum extent necessary, and
              the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">19. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@postaify.com" className="text-primary hover:underline">
                support@postaify.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            By using POSTAIFY, you acknowledge that you have read and agree to these Terms of Service.
          </p>
          <Link
            href="/privacy"
            className="text-sm text-primary hover:underline"
          >
            Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
