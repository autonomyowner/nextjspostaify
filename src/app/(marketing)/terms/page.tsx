import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | POSTAIFY',
  description: 'Terms of Service and Fair Use Policy for POSTAIFY. Read about acceptable use of our AI content generation platform.',
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
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to POSTAIFY. By using our service, you agree to these Terms of Service.
              POSTAIFY provides AI-powered content generation tools for social media, including
              text content creation, image generation, and voiceover synthesis.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Account Terms</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all content generated under your account</li>
              <li>One person or entity may not maintain more than one free account</li>
              <li>You may not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          {/* Fair Use Policy */}
          <section className="bg-card rounded-xl p-6 border border-primary">
            <h2 className="text-2xl font-semibold mb-4 text-primary">3. Fair Use Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To ensure quality service for all users, POSTAIFY implements fair use guidelines
              for AI-powered features. These guidelines help us maintain affordable pricing
              while preventing abuse.
            </p>

            <h3 className="text-lg font-semibold mb-3 text-white">Monthly Usage Guidelines</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">Feature</th>
                    <th className="text-center py-2 text-muted-foreground">Free</th>
                    <th className="text-center py-2 text-muted-foreground">Pro ($19/mo)</th>
                    <th className="text-center py-2 text-muted-foreground">Agency ($49/mo)</th>
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
                    <td className="text-center py-2">100</td>
                    <td className="text-center py-2">500</td>
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

            <h3 className="text-lg font-semibold mb-3 text-white">What This Means</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>These are soft limits designed for typical business use</li>
              <li>You will receive notifications when approaching limits (80% usage)</li>
              <li>Occasional overages are fine - we won't cut you off mid-project</li>
              <li>Consistently exceeding limits may require an upgrade or custom plan</li>
              <li>We reserve the right to contact users with unusual usage patterns</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-4 text-white">Prohibited Uses</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Automated bulk generation without human review</li>
              <li>Reselling AI-generated content as a service</li>
              <li>Using multiple accounts to circumvent limits</li>
              <li>Generating content that violates platform policies or laws</li>
              <li>Creating misleading, harmful, or deceptive content</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Payment Terms</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Paid plans are billed monthly or annually in advance</li>
              <li>All prices are in US Dollars (USD)</li>
              <li>You can cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of your billing period</li>
              <li>No refunds for partial months of service</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Content Ownership</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of all content you create using POSTAIFY, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI-generated text content and posts</li>
              <li>AI-generated images (subject to underlying model terms)</li>
              <li>AI-generated voiceovers</li>
              <li>Brand profiles and configurations you create</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You grant POSTAIFY a limited license to process your content solely for
              providing the service. We do not use your content to train AI models.
            </p>
          </section>

          {/* AI-Generated Content */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. AI-Generated Content Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Content generated by AI tools should be reviewed before publishing:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI may occasionally produce inaccurate or inappropriate content</li>
              <li>You are responsible for reviewing and approving all generated content</li>
              <li>AI-generated images may not be suitable for all purposes</li>
              <li>We recommend disclosing AI involvement where required by platform policies</li>
            </ul>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive for high availability but do not guarantee uninterrupted service.
              Third-party AI providers may experience downtime or changes that affect our
              service. We will communicate any significant service disruptions through
              our status page and email notifications.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Abuse the Fair Use Policy repeatedly</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Create content that harms POSTAIFY's reputation</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You may delete your account at any time from your dashboard settings.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              POSTAIFY is provided "as is" without warranties of any kind. We are not
              liable for any indirect, incidental, or consequential damages arising from
              your use of the service. Our total liability is limited to the amount you
              paid for the service in the past 12 months.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. We will notify you of significant
              changes via email or through the service. Continued use of the service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@postaify.com" className="text-primary hover:underline">
                support@postaify.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            By using POSTAIFY, you acknowledge that you have read and agree to these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
