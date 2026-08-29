/* ==========================================================================
   Oh! Gift — SITE CONFIGURATION
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT for the fill-in checklist.
   Everything marked TODO must be replaced before the site goes live.
   Search this file for "TODO" to find them all.
   ========================================================================== */

window.SITE_CONFIG = {

  /* --- 1. WhatsApp -------------------------------------------------------
     International format, digits only, no "+", no spaces, no dashes.
     Malaysia = country code 60, and you DROP the leading 0 of the local number.
     e.g. local 012-345 6789  ->  "60123456789"                              */
  WHATSAPP: "60XXXXXXXXX",                       // TODO: your WhatsApp number

  /* Pre-filled first message when someone taps WhatsApp with no gift in mind */
  WHATSAPP_DEFAULT_MSG:
    "Hi Oh! Gift, I'd like to enquire about your gifting options.",

  /* --- 2. Contact --------------------------------------------------------- */
  EMAIL: "hello@ohgift.com.my",                  // TODO: your business email
  PHONE_DISPLAY: "+60 XX-XXX XXXX",              // TODO: phone as shown on screen
  PHONE_TEL: "+60XXXXXXXXX",                     // TODO: phone for tel: links

  /* --- 3. Business details (footer + SEO schema) -------------------------- */
  BUSINESS_NAME: "Oh! Gift",
  LEGAL_NAME: "Oh! Gift Sdn Bhd",                // TODO: registered legal name
  SSM: "SSM Reg. No. [XXXXXXXX-X]",              // TODO: SSM registration number
  ADDRESS_STREET: "[Street address]",            // TODO
  ADDRESS_CITY: "George Town",
  ADDRESS_STATE: "Penang",
  ADDRESS_POSTCODE: "[10000]",                   // TODO
  ADDRESS_COUNTRY: "MY",
  HOURS: "Mon–Fri, 9.00am – 6.00pm (MYT)",

  /* --- 4. Socials — leave a value empty ("") to hide that icon ------------ */
  SOCIAL: {
    instagram: "https://instagram.com/",         // TODO
    facebook:  "https://facebook.com/",          // TODO
    tiktok:    "",
    linkedin:  ""
  },

  /* --- 5. Tagline --------------------------------------------------------- */
  TAGLINE: "Gifts worth an Oh!",                 // TODO: your real tagline

  /* --- 6. Form endpoints --------------------------------------------------
     Both forms POST here. Pick ONE approach and put the URL in.

     Formspree  : https://formspree.io  -> "https://formspree.io/f/xxxxxxxx"
     Netlify    : leave as "" and add   data-netlify="true" to the <form> tags
     Basin/other: any endpoint that accepts a normal POST

     While these are empty the forms fall back to opening the visitor's email
     client (mailto:) so nothing is ever lost during testing.                 */
  QUOTE_FORM_ENDPOINT: "",                       // TODO: request-a-quote endpoint
  LEAD_FORM_ENDPOINT: "",                        // TODO: catalogue-download endpoint

  /* --- 7. Catalogue PDF ---------------------------------------------------
     Drop your PDF in /assets keeping this filename, or change this path.     */
  CATALOGUE_PDF: "assets/catalogue.pdf",         // TODO: replace the actual file

  /* --- 8. Corporate terms shown on the site ------------------------------- */
  MOQ: 30,                                       // TODO: minimum order quantity
  LEAD_TIME: "7–14 working days",                // TODO: typical lead time

  /* --- 9. Site URL (for SEO / Open Graph) --------------------------------- */
  SITE_URL: "https://ohgift.com.my"              // TODO: your live domain
};
