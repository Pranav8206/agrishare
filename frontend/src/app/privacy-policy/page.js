"use client";

export default function PrivacyPolicy() {
  const sections = [
    {
      num: "01",
      title: "Data We Collect",
      desc: "What information we gather",
      items: [
        {
          icon: "👤",
          label: "Personal",
          text: "Name, email, phone, profile, verification",
        },
        {
          icon: "📊",
          label: "Usage",
          text: "Pages, bookings, clicks, device info",
        },
        {
          icon: "📍",
          label: "Location",
          text: "Nearby equipment (with permission)",
        },
      ],
      note: "We also collect payment transaction IDs — never store full card details.",
    },
    {
      num: "02",
      title: "How We Use Data",
      desc: "Purpose of collection",
      items: [
        "📦 Provide services (accounts, bookings, payments)",
        "🎯 Personalize equipment recommendations",
        "⚡ Improve platform features & fix bugs",
        "📧 Send confirmations, receipts & updates (opt out anytime)",
        "🛡️ Detect fraud, verify identities, enforce terms",
        "⚖️ Comply with Indian laws",
      ],
    },
    {
      num: "03",
      title: "Information Sharing",
      desc: "When we share your data",
      items: [
        "🤝 With service providers (payment, cloud, analytics) under confidentiality",
        "🔄 Between Owners & Renters when booking confirmed",
        "⚖️ For legal compliance (court orders, government authorities)",
        "🏢 Business transfer — you'll be notified",
      ],
      highlight:
        "✅ We never sell, rent, or trade your personal data to third parties for marketing.",
    },
    {
      num: "04",
      title: "Cookies & Security",
      desc: "How we protect you",
      items: [
        "🍪 Essential, Analytics & Preference cookies used",
        "🔒 SSL/TLS encryption, secure cloud storage",
        "🛡️ Regular audits & strict access controls",
      ],
    },
    {
      num: "05",
      title: "Your Rights",
      desc: "Control over your data",
      items: [
        "📂 Access your data",
        "✏️ Correct inaccurate info",
        "🗑️ Delete your account",
        "📵 Opt out of marketing",
        "📦 Export your data",
        "📋 Withdraw consent",
      ],
      contact: "Contact support@agrishare.com — we respond within 30 days",
    },
    {
      num: "06",
      title: "Data Retention",
      desc: "How long we keep data",
      items: [
        "👤 Account data — until you delete",
        "💳 Transactions — up to 7 years (tax compliance)",
        "📊 Analytics — up to 24 months, then anonymized",
        "💬 Support records — up to 3 years",
      ],
    },
    {
      num: "07",
      title: "Your Privacy Rights",
      desc: "Important policies",
      items: [
        "🔗 Third-party links — we're not responsible for their practices",
        "👶 Not for users under 18 — contact us if child data provided",
        "📝 Policy updates — notified via email or platform notice",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Banner - Compact */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary-accent via-primary-accent/90 to-primary-accent/70 text-white pt-10 pb-8 px-6 text-center">
        <div className="relative z-10">
          <div className="text-3xl mb-1">🔒</div>
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-0.5 text-[0.6rem] font-semibold tracking-wider uppercase mb-2">
            Legal Document
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-bold mb-1">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-xs max-w-md mx-auto">
            Your data, your rights — transparent & simple
          </p>
          <p className="text-white/40 text-[0.6rem] italic mt-2">
            Last Updated: April 3, 2025
          </p>
        </div>
      </div>

      {/* Document Body - Very Compact */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Intro */}
        <p className="text-text-secondary text-xs leading-relaxed mb-4">
          At <strong className="text-primary-accent">AgriShare</strong>, we
          protect your privacy. This policy explains what data we collect, how
          we use it, and your rights. By using AgriShare, you agree to this
          policy.
        </p>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.num}
              className="border-b border-border-light pb-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary-accent/10 text-primary-accent text-[0.55rem] font-bold px-2 py-0.5 rounded-full">
                  {section.num}
                </span>
                <span className="text-text-tertiary text-[0.6rem] tracking-wide">
                  {section.desc}
                </span>
              </div>
              <h2 className="font-editorial text-base font-bold text-text-primary mb-1.5">
                {section.title}
              </h2>

              {section.items && (
                <div className="space-y-1">
                  {section.items.map((item, idx) =>
                    typeof item === "string" ? (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary-accent text-[0.7rem]">
                          ▸
                        </span>
                        <span className="text-text-secondary text-[0.7rem] leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-surface-hover rounded-lg p-1.5 border border-border-light"
                      >
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <span className="font-semibold text-text-primary text-[0.7rem]">
                            {item.label}:
                          </span>
                          <span className="text-text-secondary text-[0.65rem] ml-1">
                            {item.text}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {section.note && (
                <p className="text-text-tertiary text-[0.65rem] leading-relaxed mt-1.5">
                  {section.note}
                </p>
              )}

              {section.highlight && (
                <div className="mt-2 bg-primary-accent/5 border border-primary-accent/20 rounded p-1.5">
                  <p className="text-primary-accent-dark text-[0.65rem] leading-relaxed">
                    {section.highlight}
                  </p>
                </div>
              )}

              {section.contact && (
                <p className="text-text-tertiary text-[0.65rem] leading-relaxed mt-1.5">
                  📧 {section.contact}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 text-center border-t border-border-light">
          <p className="text-text-tertiary text-[0.65rem]">
            Questions?{" "}
            <a
              href="mailto:support@agrishare.com"
              className="text-primary-accent font-semibold"
            >
              support@agrishare.com
            </a>
          </p>
          <p className="text-text-tertiary/40 text-[0.55rem] italic mt-1 font-editorial">
            🌾 Empowering Farmers, Sharing Resources
          </p>
        </div>
      </div>
    </div>
  );
}
