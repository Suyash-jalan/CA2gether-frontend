import { Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';

const content = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain the rules for using CA2gether and keeping the community safe.',
    sections: [
      ['Eligibility', 'You must be at least 18 years old and provide accurate account information. Professional or ICAI verification badges may only be used by members whose credentials have been reviewed.'],
      ['Community conduct', 'Treat members respectfully. Harassment, impersonation, fraud, unsolicited promotion, and sharing another person’s private information are prohibited.'],
      ['Your content', 'You remain responsible for the profile information, photos, messages, posts, and event details you submit. Do not upload content you do not have permission to use.'],
      ['Safety and moderation', 'CA2gether may restrict or remove content and accounts that breach these terms or create a safety risk. Use block and report tools whenever an interaction feels unsafe.'],
      ['Account access', 'Keep your login details secure. You may deactivate your account from Settings. Service availability can change during maintenance or security incidents.'],
      ['Changes', 'Material changes to these terms will be presented in the application. Continued use after an effective-date update means you accept the revised terms.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy describes the information CA2gether uses to operate matching, messaging, verification, and community features.',
    sections: [
      ['Information you provide', 'We process account details, profile fields, photos, preferences, messages, lounge activity, reports, and verification documents that you choose to submit.'],
      ['How information is used', 'Information is used to authenticate accounts, suggest relevant profiles, enable matches and messages, review credentials, prevent abuse, and improve reliability.'],
      ['Visibility controls', 'Anonymous Mode, Hide from My Firm, and Exam Buddy Mode affect discovery. A match may still see information you shared before changing a setting.'],
      ['Sharing and service providers', 'Information is shared only as needed to run the service, comply with law, protect members, or work with infrastructure providers that process data on our behalf.'],
      ['Retention and security', 'We retain information while your account is active and as needed for safety, legal, and operational obligations. We use access controls and encryption for sensitive verification data.'],
      ['Your choices', 'You can update profile information, manage discovery settings, block members, and deactivate your account from the application.'],
    ],
  },
};

export default function Legal({ type }) {
  const page = content[type] || content.terms;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-warm-sm sm:p-10">
        <Link to="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary/10">
          <HiArrowLeft size={18} /> Back to CA2gether
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CA2gether</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-heading sm:text-4xl">{page.title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{page.intro}</p>
        <p className="mt-2 text-xs text-muted">Effective 1 October 2026</p>
        <div className="mt-8 space-y-7">
          {page.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-serif text-xl font-semibold text-heading">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
