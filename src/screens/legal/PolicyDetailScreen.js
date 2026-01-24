import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeScreenContainer from '../../components/SafeScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, TOUCH_TARGETS, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from '../../context/TranslationContext';

const PolicyDetailScreen = ({ route, navigation }) => {
    const { t } = useTranslation();
  const { policyType, title } = route.params;

  // Redirect to PolicyUpdatesScreen if policy_updates is selected
  React.useEffect(() => {
    if (policyType === 'policy_updates') {
      navigation.replace('PolicyUpdates');
    }
  }, [policyType, navigation]);

  const getPolicyContent = () => {
    const policies = {
      policy_updates: {
        title: title || 'Policy Updates',
        content: `Policy Updates - January 2025

RoundBuy regularly updates its policies to reflect changes in our services, legal requirements, and user feedback.

Recent Updates:
- Privacy Policy updated: January 15, 2025
- Terms & Conditions updated: January 10, 2025
- Cookie Policy updated: January 5, 2025

You will be notified of significant policy changes via email and in-app notifications.

Version History:
All previous versions of our policies are available upon request. Contact support@roundbuy.in for access to historical policy documents.`,
      },
      terms: {
        title: title || 'Terms & Conditions',
        content: `Welcome to RoundBuy!

These terms and conditions outline the rules and regulations for the use of RoundBuy's App and Services.

By accessing this app, we assume you accept these terms and conditions. Do not continue to use RoundBuy if you do not agree to all of the terms and conditions stated on this page.

The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this app and compliant to the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.

License:
Unless otherwise stated, RoundBuy and/or its licensors own the intellectual property rights for all material on RoundBuy. All intellectual property rights are reserved.

You must not:
- Republish material from RoundBuy
- Sell, rent or sub-license material from RoundBuy
- Reproduce, duplicate or copy material from RoundBuy
- Redistribute content from RoundBuy

This Agreement shall begin on the date hereof.

© 2026 All Rights Reserved. RoundBuy Private Ltd.`,
      },
      license: {
        title: title || 'End User License Agreement',
        content: `END USER LICENSE AGREEMENT (EULA)

This End User License Agreement ("Agreement") is a binding agreement between you ("End User" or "you") and RoundBuy Private Ltd. ("Company").

This Agreement governs your use of RoundBuy (the "Application").

By clicking "I Accept" or by downloading, installing, or using the Application, you agree to be bound by the terms of this Agreement. If you do not agree to this Agreement, do not click "I Accept" and do not download, install, or use the Application.

1. LICENSE GRANT
The Company grants you a revocable, non-exclusive, non-transferable, limited license to download, install, and use the Application solely for your personal, non-commercial purposes strictly in accordance with this Agreement and the Application's documentation.

2. RESTRICTIONS
You agree not to, and you will not permit others to:
a) License, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Application
b) Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the Application
c) Remove, alter or obscure any proprietary notice of the Company

3. INTELLECTUAL PROPERTY
The Application, including without limitation all copyrights, patents, trademarks, trade secrets and other intellectual property rights are, and shall remain, the sole and exclusive property of the Company.

4. YOUR SUGGESTIONS
Any feedback, comments, ideas, improvements or suggestions provided by you to the Company with respect to the Application shall remain the sole and exclusive property of the Company.

© 2026 RoundBuy Private Ltd. All rights reserved.`,
      },
      privacy: {
        title: title || 'Privacy Policy',
        content: `PRIVACY POLICY

Last updated: January 2025

RoundBuy Private Ltd. ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.

INFORMATION WE COLLECT
We may collect information about you in a variety of ways, including:

Personal Data:
- Name, email address, phone number
- Demographic information such as age, gender
- Location data (with your permission)

Derivative Data:
- Information our servers automatically collect when you access the App, such as device type, operating system, browser type, IP address

TRACKING DATA
We use cookies and similar tracking technologies to track activity on our App and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.

USE OF YOUR INFORMATION
We may use information collected about you to:
- Create and manage your account
- Process your transactions
- Send you marketing and promotional communications
- Enable user-to-user communications
- Perform other business activities as needed
- Prevent fraudulent transactions and monitor against theft

DISCLOSURE OF YOUR INFORMATION
We may share information we have collected about you in certain situations:

By Law or to Protect Rights:
If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.

Third-Party Service Providers:
We may share your information with third parties that perform services for us or on our behalf.

SECURITY OF YOUR INFORMATION
We use administrative, technical, and physical security measures to help protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.

YOUR CONSENT
By using our App, you consent to our Privacy Policy and agree to its terms.

CONTACT US
If you have questions or comments about this Privacy Policy, please contact us at:
support@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      cookies: {
        title: title || 'Cookies Policy',
        content: `COOKIES POLICY

What Are Cookies?
Cookies are small text files that are placed on your device when you visit our website or use our app. They help us provide you with a better experience.

Types of Cookies We Use:

1. Necessary Cookies
These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas.

2. Functional Cookies
These cookies enable the website to provide enhanced functionality and personalization based on your interaction.

3. Analytics Cookies
These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.

4. Performance Cookies
These cookies are used to understand and analyze key performance indexes of the website.

5. Advertising Cookies
These cookies are used to deliver personalized advertisements based on your browsing activity and preferences.

6. Uncategorized Cookies
Cookies that we are in the process of classifying.

Managing Cookies:
You can control and manage cookies through your browser settings or through our Cookie Settings in the app.

For more information, email: support@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      att: {
        title: title || 'App Tracking Transparency (ATT)',
        content: `APP TRACKING TRANSPARENCY (ATT) POLICY

What is App Tracking Transparency?
App Tracking Transparency (ATT) is a privacy feature that requires apps to get your permission before tracking your activity across other companies' apps and websites.

Why We Request Tracking Permission:
RoundBuy may request permission to track you across apps and websites owned by other companies to:

1. Personalized Advertising
- Show you relevant ads based on your interests
- Measure ad effectiveness
- Improve ad targeting

2. Analytics and Insights
- Understand how you use our app
- Improve app performance
- Enhance user experience

3. Attribution
- Measure marketing campaign effectiveness
- Understand which channels bring users to RoundBuy
- Optimize our marketing spend

Your Choices:
You have full control over tracking permissions:

Allow Tracking:
- Receive personalized ads
- Help us improve our services
- Support free features through ad revenue

Ask App Not to Track:
- Limit data sharing with third parties
- Receive less personalized ads
- Maintain maximum privacy

How to Change Your Choice:
1. Go to Settings on your device
2. Select Privacy & Security
3. Select Tracking
4. Find RoundBuy and toggle your preference

What Data We Track:
When you allow tracking, we may collect:
- Device identifiers (IDFA)
- App usage patterns
- Purchase history
- Location data (with permission)
- Browsing behavior

Third-Party Partners:
We may share tracking data with:
- Advertising networks
- Analytics providers
- Marketing platforms
- Attribution services

Your Privacy Matters:
Whether you allow or deny tracking, we:
- Protect your personal information
- Follow all privacy laws and regulations
- Give you control over your data
- Maintain transparency about data usage

Questions About ATT?
Contact us at: privacy@roundbuy.in

Learn More:
Visit Apple's ATT documentation:
https://developer.apple.com/app-store/user-privacy-and-data-use/

© 2026 RoundBuy Private Ltd.`,
      },
      prohibited_items: {
        title: title || 'Prohibited & Restricted Items Policy',
        content: `PROHIBITED & RESTRICTED ITEMS POLICY

RoundBuy prohibits the listing and sale of certain items to ensure the safety and legality of transactions on our platform.

Prohibited Items:
- Illegal drugs and drug paraphernalia
- Weapons, firearms, and explosives
- Stolen goods
- Counterfeit items
- Adult content and services
- Live animals (except as permitted by law)
- Human remains and body parts
- Hazardous materials

Restricted Items:
- Alcohol (subject to local laws)
- Tobacco products
- Prescription medications
- Medical devices
- Currency and gift cards
- Tickets (subject to verification)

Consequences of Violation:
- Listing removal
- Account suspension or termination
- Legal action if applicable

Report Violations:
If you encounter prohibited items, please report them to:
support@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      seller_terms: {
        title: title || 'Seller Business Terms',
        content: `SELLER BUSINESS TERMS

These terms apply to users who wish to sell products or services on RoundBuy.

Seller Requirements:
- Must be at least 18 years old
- Valid identification
- Business registration (if applicable)
- Bank account for payments

Seller Responsibilities:
- Accurate product descriptions
- Timely shipping and delivery
- Customer service
- Compliance with all applicable laws

Fees and Payments:
- Listing fees may apply
- Transaction fees: [percentage]
- Payment processing fees
- Withdrawal methods and timelines

Product Standards:
- Authentic products only
- Accurate images and descriptions
- Proper categorization
- Competitive pricing

Performance Metrics:
- Order fulfillment rate
- Customer satisfaction ratings
- Response time requirements
- Return and refund handling

Account Termination:
RoundBuy reserves the right to terminate seller accounts for violations of these terms.

For seller support:
sellers@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      content_moderation: {
        title: title || 'Content & Moderation Policy',
        content: `CONTENT & MODERATION POLICY

RoundBuy maintains community standards to ensure a safe and respectful environment for all users.

Prohibited Content:
- Hate speech or discriminatory content
- Harassment or bullying
- Violence or threats
- Spam or misleading information
- Sexual or suggestive content
- Infringement of intellectual property

Moderation Process:
- Automated detection systems
- User reporting mechanisms
- Human review team
- Appeal process

User Generated Content:
- You retain ownership of your content
- You grant RoundBuy license to display your content
- Content must comply with our guidelines

Enforcement Actions:
- Content removal
- Account warnings
- Temporary suspension
- Permanent account termination

Report Content:
If you encounter inappropriate content:
moderation@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      subscriptions: {
        title: title || 'Subscriptions & Billing Policy',
        content: `SUBSCRIPTIONS & BILLING POLICY

RoundBuy offers various subscription plans for enhanced features and services.

Subscription Types:
- Free Plan
- Premium Plan
- Business Plan
- Enterprise Plan

Billing Cycle:
- Monthly billing
- Annual billing (with discount)
- Auto-renewal unless cancelled

Payment Methods:
- Credit/Debit cards
- Bank transfer

Cancellation:
- Cancel anytime
- No refund for partial months
- Access continues until end of billing period

Refund Policy:
- 7-day money-back guarantee
- Pro-rated refunds for annual plans
- No refunds for promotional periods

Price Changes:
- 30-day advance notice
- Option to cancel before change takes effect

For billing support:
billing@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      referral: {
        title: title || 'Referral & Credits Policy',
        content: `REFERRAL & CREDITS POLICY

Earn credits by referring new users to RoundBuy!

How It Works:
1. Share your unique referral code
2. New user signs up using your code
3. Both parties receive credits

Credit Values:
- Referrer: [amount] credits per successful referral
- Referee: [amount] credits upon signup

Credit Usage:
- Apply to purchases
- Reduce subscription costs
- No cash value
- Non-transferable

Eligibility:
- Account in good standing
- Referee must be new user
- One referral credit per unique user

Limitations:
- Maximum credits per month
- Credits expire after [period]
- Cannot be combined with certain promotions

Fraudulent Activity:
RoundBuy reserves the right to:
- Revoke credits
- Suspend referral privileges
- Terminate accounts

Questions?
referrals@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      register_record: {
        title: title || 'Register and Record Statement',
        content: `REGISTER AND RECORD STATEMENT

RoundBuy maintains registers and records in compliance with applicable laws and regulations.

Records Maintained:
- User registration information
- Transaction history
- Communication logs
- Compliance documentation

Data Retention:
- Active accounts: Indefinite
- Closed accounts: [period] years
- Transaction records: [period] years
- Legal requirements may extend retention

Access to Records:
- Users can request their data
- Response within [days] business days
- Identity verification required

Record Security:
- Encrypted storage
- Access controls
- Regular security audits
- Incident response procedures

Data Requests:
To request your records:
data@roundbuy.in

Legal Compliance:
Records may be disclosed:
- By court order
- Law enforcement requests
- Regulatory requirements

© 2026 RoundBuy Private Ltd.`,
      },
      ip_notice: {
        title: title || 'Intellectual Property & Notice Policy',
        content: `INTELLECTUAL PROPERTY & NOTICE POLICY

RoundBuy respects intellectual property rights and expects users to do the same.

Trademark Policy:
- RoundBuy trademarks are protected
- Unauthorized use is prohibited
- License required for commercial use

Copyright Protection:
- Original content is protected
- DMCA compliance
- Takedown procedures

Patent Information:
- RoundBuy holds various patents
- Patent pending technologies
- Third-party patent respect

Notice of Infringement:
If you believe your intellectual property has been infringed:

1. Provide written notice to: legal@roundbuy.in
2. Include:
   - Description of copyrighted work
   - Location of infringing material
   - Your contact information
   - Good faith statement
   - Statement of accuracy
   - Physical or electronic signature

Counter-Notice:
If you believe content was removed in error:
1. Submit counter-notice
2. Include required information
3. Allow 10-14 business days

© 2026 RoundBuy Private Ltd.`,
      },
      ip_register: {
        title: title || 'IP Register & Rights Management',
        content: `INTELLECTUAL PROPERTY REGISTER & RIGHTS MANAGEMENT STATEMENT

RoundBuy maintains a comprehensive register of intellectual property rights.

Registered Trademarks:
- RoundBuy® (Registered)
- Shop Round The Corner™ (Trademark)
- RB Logo (Design Mark)

Copyrights:
- Software code and algorithms
- User interface designs
- Marketing materials
- Documentation

Patents:
- E-commerce innovations
- Location-based discovery
- Social shopping features
- Payment processing methods

Trade Secrets:
- Proprietary algorithms
- Business methods
- Customer data protection

Rights Management:
We actively monitor and protect our IP through:
- Regular trademark searches
- DMCA takedown notices
- Cease and desist letters
- Legal action when necessary

Third-Party IP:
We respect third-party intellectual property and:
- Obtain proper licenses
- Provide attribution
- Respond to infringement claims

Licensing Inquiries:
For licensing our IP:
licensing@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      patents: {
        title: title || 'RoundBuy Patents',
        content: `ROUNDBUY PATENTS AND PENDING PATENTS

RoundBuy has developed innovative technologies that are protected by patents and patent applications.

Granted Patents:

1. Location-Based Product Discovery System
   Patent No: [Number]
   Filed: [Date]
   Granted: [Date]

2. Social Commerce Integration Platform
   Patent No: [Number]
   Filed: [Date]
   Granted: [Date]

3. Secure Peer-to-Peer Transaction Method
   Patent No: [Number]
   Filed: [Date]
   Granted: [Date]

Pending Patent Applications:

1. AI-Powered Product Recommendation Engine
   Application No: [Number]
   Filed: [Date]
   Status: Pending

2. Blockchain-Based Authenticity Verification
   Application No: [Number]
   Filed: [Date]
   Status: Pending

3. Augmented Reality Shopping Experience
   Application No: [Number]
   Filed: [Date]
   Status: Pending

Patent Notices:
This product is covered by one or more patents. Other patents pending.

Licensing:
For patent licensing inquiries:
patents@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
      infringement: {
        title: title || 'Infringement Report Policy',
        content: `INFRINGEMENT REPORT POLICY

How to Report Intellectual Property Infringement

If you believe your intellectual property rights have been violated on RoundBuy, please follow this process:

Step 1: Gather Information
- URL of infringing content
- Description of your intellectual property
- Proof of ownership
- Your contact information

Step 2: Submit Report
Email: infringement@roundbuy.in

Include:
1. Your full legal name
2. Your contact information
3. Description of copyrighted work
4. Location of infringing material (URL)
5. Statement of good faith belief
6. Statement under penalty of perjury
7. Physical or electronic signature

Step 3: Review Process
- We review within 2-3 business days
- May request additional information
- Notify alleged infringer
- Allow counter-notice period

Step 4: Resolution
- Remove infringing content, or
- Accept counter-notice and restore content, or
- Determine no infringement occurred

Repeat Infringers:
Accounts with multiple infringement violations may be permanently terminated.

False Claims:
False infringement claims may result in:
- Account termination
- Legal liability
- Damages

Questions?
legal@roundbuy.in

© 2026 RoundBuy Private Ltd.`,
      },
    };

    return policies[policyType] || {
      title: title || 'Policy',
      content: 'Policy content not found.'
    };
  };

  const policy = getPolicyContent();

  return (
    <SafeScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{policy.title}</Text>
      </View>

      {/* Content */}
      <>
        <Text style={styles.content}>{policy.content}</Text>
        <View style={styles.bottomSpacing} />
      </>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => console.log('Download PDF')}
        >
          <Text style={styles.downloadButtonText}>{t('Download PDF')}</Text>
        </TouchableOpacity>
      </View>
    </SafeScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.sm,
    minHeight: TOUCH_TARGETS.minHeight,
    justifyContent: 'center',
  },
  backArrow: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    textAlign: 'left',
  },
  content: {
    ...TYPOGRAPHY.styles.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
  footer: {
    paddingTop: SPACING.md,
    marginTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  downloadButton: {
    height: TOUCH_TARGETS.buttonHeight.medium,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.white,
  },
});

export default PolicyDetailScreen;