"use client";

export default function TermsAndConditions() {
  const sections = [
    {
      num: "01",
      title: "Definitions",
      desc: "Key terms used in this agreement.",
      items: [
        {
          term: "Platform",
          def: "AgriShare website, mobile app & digital services",
        },
        { term: "User", def: "Registered individual or entity" },
        { term: "Owner", def: "Lists equipment for rental" },
        { term: "Renter", def: "Books equipment from Owners" },
        { term: "Equipment", def: "Agricultural machinery & tools" },
      ],
    },
    {
      num: "02",
      title: "Eligibility & Accounts",
      desc: "Who can use and how.",
      items: [
        "Must be 18+ years old",
        "Legally capable under Indian law",
        "Provide accurate, current information",
        "Keep login credentials confidential",
        "Notify unauthorized access immediately",
      ],
    },
    {
      num: "03",
      title: "Platform Rules",
      desc: "What you cannot do.",
      items: [
        "Illegal, fraudulent, or unauthorized purposes",
        "Fake listings or misleading descriptions",
        "Bypassing security features",
        "Scraping data without permission",
        "Using bots or automated tools",
      ],
    },
    {
      num: "04",
      title: "Listings & Payments",
      desc: "For Owners & Renters.",
      items: [
        "Listings must be accurate, honest, and up to date",
        "All payments through AgriShare system only",
        "Prices in INR, taxes applicable",
        "Platform fee displayed before confirmation",
      ],
      highlight:
        "⚠️ AgriShare is a marketplace. Verify equipment details before booking.",
    },
    {
      num: "05",
      title: "Cancellation Policy",
      desc: "Refund based on policy type.",
      items: [
        "🟢 Flexible: Full refund if cancelled 24+ hours before start",
        "🟡 Moderate: Full refund 72+ hours before / 50% within 72h",
        "🔴 Strict: No refund if cancelled less than 7 days before",
      ],
    },
    {
      num: "06",
      title: "Responsibilities",
      desc: "Renters & Owners.",
      items: [
        "Renter: Use carefully, return same condition, liable for damage/loss",
        "Owner: Ensure equipment safe, provide instructions, maintain regularly",
      ],
    },
    {
      num: "07",
      title: "Liability & Reviews",
      desc: "Important legal terms.",
      items: [
        "Renter liable for repair/replacement of damaged equipment",
        "AgriShare does not provide insurance",
        "Reviews must be honest — no fake or retaliatory reviews",
        "AgriShare not liable for damages from equipment use",
      ],
      highlight: "AgriShare acts as a marketplace intermediary only.",
    },
    {
      num: "08",
      title: "Policies",
      desc: "Account & legal terms.",
      items: [
        "Violation may lead to suspension or termination",
        "Terms may be updated — continued use = acceptance",
        "Governed by Indian law, jurisdiction: Indian courts",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2d3e2d] via-[#4a6741] to-primary-accent text-white pt-10 pb-8 px-6 text-center">
        <div className="relative z-10">
          <div className="text-3xl mb-1">🌿</div>
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-0.5 text-[0.6rem] font-semibold tracking-wider uppercase mb-2">
            Legal Document
          </div>
          <h1 className="font-editorial text-2xl md:text-3xl font-bold mb-1">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/70 text-xs max-w-md mx-auto">
            Read before using AgriShare platform
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
          Welcome to <strong className="text-primary-accent">AgriShare</strong>.
          By accessing or using our platform, you agree to these Terms. If you
          do not agree, please do not use AgriShare.
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
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary-accent text-[0.7rem]">
                          ▸
                        </span>
                        <span className="text-text-secondary text-[0.7rem] leading-relaxed">
                          <strong className="text-text-primary">
                            {item.term}:
                          </strong>{" "}
                          {item.def}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              {section.highlight && (
                <div className="mt-2 bg-primary-accent/5 border border-primary-accent/20 rounded p-1.5">
                  <p className="text-primary-accent-dark text-[0.65rem] leading-relaxed">
                    {section.highlight}
                  </p>
                </div>
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
