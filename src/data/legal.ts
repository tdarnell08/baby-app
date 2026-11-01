export type LegalDocId = 'privacy' | 'terms' | 'medical';

export type LegalSection = { heading: string; body: string[] };

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const UPDATED = 'October 31, 2026';

export const privacyPolicy: LegalDoc = {
  id: 'privacy',
  title: 'Privacy Policy',
  updated: UPDATED,
  intro:
    'Lulla is built so that your baby’s information stays with you. There are no accounts, no ads, no analytics, and no tracking. This policy explains exactly what the app stores and when anything leaves your device.',
  sections: [
    {
      heading: 'The short version',
      body: [
        'Everything you enter into Lulla is stored on your device. We do not have a server that receives your baby’s information.',
        'We do not sell or share your information, do not show ads, and do not track you across other apps or websites.',
        'The only network activity is checking and processing a Lulla Plus purchase, described below.',
      ],
    },
    {
      heading: 'What Lulla stores on your device',
      body: [
        'Baby profile: an optional name, birth date or age, interests, and your preferred play time. Lulla does not ask for or store your baby’s weight.',
        'Milestones: the milestones you check off and the date you checked them.',
        'Sleep log: the start and end times of the naps and night sleep you log, kept for up to 90 days, and your sleep reminder choices.',
        'Sick Day medicine log: the medicine name, dose, waiting time, and schedule exactly as you type them from the label, your log of doses given with the names you enter for who gave each dose, and notes. This includes antibiotic courses and as-needed medicines such as fever reducers. Lulla never calculates or suggests a dose.',
        'Sick Day symptom log: illness episodes you start, with the temperatures (and how they were taken), fluids, wet diapers, sleep notes, behavior, and notes you enter, as a timeline.',
        'Package dosing charts: the product name, ingredient, any table you type from the package, and any photo of the package chart you choose to save. Lulla does not read the photo or interpret the chart.',
        'Memory book: the titles, notes, and dates you write, plus any photos and voice clips you attach. Photos are resized and saved as files in the app’s private storage.',
        'Settings: whether app lock is on, and your Lulla Plus status.',
        'Voice recordings: only if you choose to record your voice for First words. Recordings are saved as files on your device and are never uploaded.',
      ],
    },
    {
      heading: 'How it is protected',
      body: [
        'Your baby profile, milestones, sleep log, medicine log, symptom log, package chart text, and memory text are kept in the secure storage built into your phone (the iOS Keychain, or the Android Keystore). On iPhone these items are set to this-device-only, so they are not copied to iCloud backups or to a new device.',
        'You can turn on an app lock in Settings. Lulla then asks for Face ID, Touch ID, or your device passcode when you open it, and hides its screen in the app switcher. Lulla never receives your biometric data; your phone handles it.',
        'Photos of memories and package charts, memory voice clips, and First words voice recordings are stored as files in the app’s private storage, which your phone protects with device encryption and which may be included in your encrypted device backups.',
        'Reminders are local notifications created on your phone. Medicine reminders say only “Medicine reminder,” so the medicine name never appears on your lock screen. Reminders are not sent through any server.',
      ],
    },
    {
      heading: 'What leaves your device',
      body: [
        'Nothing you enter about your baby is sent to us or to anyone else.',
        'Lulla Plus purchases are handled by Apple. We use RevenueCat to confirm whether a purchase is active. RevenueCat receives an anonymous app user ID, your purchase and subscription status, and standard technical information such as your IP address, device model, and app version. It does not receive your baby’s information.',
        'The microphone is used only while you press record. Audio is not sent anywhere.',
        'Photos are read only when you choose them from your library or take them with the camera. Lulla saves a resized copy and never uploads it. When you export a keepsake PDF, a medicine record, or a Sick Day doctor summary, the text or PDF is made on your phone and goes only where you choose to share it.',
      ],
    },
    {
      heading: 'Children’s privacy',
      body: [
        'Lulla is designed for parents and caregivers, not for children. Information about your baby is entered by you and stays on your device. We do not knowingly collect personal information from children.',
      ],
    },
    {
      heading: 'Your choices',
      body: [
        'You can change or remove anything in the app at any time.',
        'In Settings, “Export my data” gives you a copy of what Lulla stores, and “Delete all my data” erases the profile, milestones, sleep log, medicine log, symptom log, package dosing charts, memories with their photos and voice clips, voice recordings, scheduled reminders, and app lock setting from your device.',
        'On iPhone, Keychain items can remain after an app is deleted. For a complete removal, use “Delete all my data” before you uninstall Lulla.',
        'Lulla Plus subscriptions can be managed or canceled in your Apple ID account settings.',
      ],
    },
    {
      heading: 'Keeping data',
      body: [
        'Your information is kept on your device until you delete it. Sleep entries expire after 90 days, finished medicines after about five months, and illness logs after one year. Memories stay until you delete them. Purchase records are kept by Apple and RevenueCat under their own policies.',
      ],
    },
    {
      heading: 'Changes to this policy',
      body: [
        'If we change how Lulla handles information, we will update this policy in the app and change the date above. We will not start collecting your baby’s information without telling you first.',
      ],
    },
  ],
};

export const termsOfUse: LegalDoc = {
  id: 'terms',
  title: 'Terms of Use',
  updated: UPDATED,
  intro:
    'These terms apply when you use Lulla. They work together with Apple’s Standard License Agreement for apps downloaded from the App Store.',
  sections: [
    {
      heading: 'Using Lulla',
      body: [
        'Lulla is for personal, non-commercial use by parents and caregivers. You are responsible for how you use the information in the app and for supervising your baby at all times.',
        'Do not copy, resell, or reverse engineer the app or its content.',
      ],
    },
    {
      heading: 'Not medical advice',
      body: [
        'Lulla provides general information and tools. It is not medical advice and does not create a doctor-patient relationship. Always follow your pediatrician’s guidance. See the Medical Disclaimer for details.',
      ],
    },
    {
      heading: 'Lulla Plus',
      body: [
        'Lulla is free to use with core features. Lulla Plus unlocks extra features and is available as an auto-renewing subscription (monthly or yearly) or a one-time lifetime purchase. Prices are shown in the app before you buy and may vary by country.',
        'Payment is charged to your Apple ID. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. You can manage or cancel in your Apple ID account settings. Free trials, when offered, convert to a paid subscription unless canceled before the trial ends.',
        'Refunds are handled by Apple under its policies. If prices change, Apple will notify you and ask for your consent where required.',
        'Safety and health tracking features, including milestones, food and choking safety, the whole Sick Day section (medicine log with antibiotic courses and reminders, symptom log, when to call the doctor, comfort tips, package dosing charts, and the doctor summary), and privacy controls, stay free. Free accounts can save up to 10 memories, and Plus unlocks more.',
      ],
    },
    {
      heading: 'Sleep sounds',
      body: [
        'Keep sound at a low volume and the speaker well away from your baby’s crib. Never use sound as a substitute for safe sleep practices. Follow current safe sleep guidance from your pediatrician and the American Academy of Pediatrics.',
      ],
    },
    {
      heading: 'No warranty and limits of liability',
      body: [
        'Lulla is provided “as is.” We work hard to keep the content accurate, but we cannot guarantee that it is complete or error free or that it fits your child’s needs.',
        'To the extent the law allows, we are not liable for any indirect or consequential loss arising from use of the app. Nothing in these terms limits liability that cannot be limited by law.',
      ],
    },
    {
      heading: 'Changes',
      body: [
        'We may update these terms. If changes are significant, we will tell you in the app. Continued use after an update means you accept it.',
      ],
    },
  ],
};

export const medicalDisclaimer: LegalDoc = {
  id: 'medical',
  title: 'Medical Disclaimer',
  updated: UPDATED,
  intro:
    'Lulla shares general information for parents and caregivers. It is not a substitute for professional medical advice, diagnosis, or treatment.',
  sections: [
    {
      heading: 'Talk to your pediatrician',
      body: [
        'Always ask your pediatrician or another qualified health professional about your baby’s health, development, feeding, sleep, and medicines. Never ignore professional advice or delay care because of something you read in Lulla.',
        'In an emergency, call your local emergency number (911 in the US). For poisoning or a medicine mix-up in the US, call Poison Control at 1-800-222-1222.',
      ],
    },
    {
      heading: 'Sick Day',
      body: [
        'Sick Day helps you keep records and find public guidance. It does not diagnose illness, does not tell you whether your baby is sick or well, and does not calculate, suggest, or check the amount of any medicine.',
        'Medicine log: you type the medicine, the dose, the waiting time between doses, and any daily limit exactly as printed on the label or given by your doctor or pharmacist. Lulla only shows these back to you and compares your log with the waiting time you typed. It cannot know your baby’s weight, age, health conditions, or other medicines. You are responsible for checking the label before every dose.',
        'Package dosing charts: Lulla keeps the chart that is printed on the package, as a photo you took or a table you typed. Lulla does not choose a line for your baby and does not convert weight or age into an amount. Charts depend on the product and strength, and the right amount can be different for your child. Confirm with your pediatrician or pharmacist before giving any medicine.',
        'Reminders and “next allowed” times are aids and can fail, for example if notifications are off or your phone is off. If a dose is missed or your baby vomits after a dose, call your pharmacist or pediatrician before giving another one. Finish an antibiotic course unless your doctor tells you to stop.',
        'When to call the doctor and comfort tips are summaries of public guidance from the American Academy of Pediatrics, the CDC, the FDA, and the NHS, and each item shows its source. They do not cover every situation. A baby can be seriously ill without matching any warning sign. If you are worried, call your pediatrician, a nurse line, or 911.',
        'Fever notices in the symptom log are based on the temperatures you enter and your baby’s age. Thermometers and techniques vary, and underarm readings can be lower than the true temperature. For a baby under 3 months, call your pediatrician about any fever of 100.4°F (38°C) or higher, and before giving any medicine.',
        'Call right away or seek emergency care for hives, swelling of the face or lips, trouble breathing, blue or gray skin, a seizure, being very hard to wake, or a rash that does not fade when pressed.',
      ],
    },
    {
      heading: 'Sleep coach',
      body: [
        'Wake windows and nap counts are common ranges, not rules, and predictions are estimates from the sleeps you log. Babies vary a lot. Total sleep ranges come from the American Academy of Sleep Medicine and the National Sleep Foundation.',
        'Follow safe sleep guidance: back to sleep, on a firm, flat surface, with nothing else in the crib. Talk to your pediatrician if you are worried about your baby’s sleep or breathing.',
      ],
    },
    {
      heading: 'Development, food, and movement',
      body: [
        'Milestones are common signs, not deadlines or a diagnosis. Babies develop at their own pace. If you have a concern, raise it with your pediatrician.',
        'Food and choking guidance is general. Introduce foods when your baby is ready and always stay with your baby while eating. Talk with your pediatrician before introducing allergens, especially if your baby has eczema or a family history of food allergy.',
      ],
    },
    {
      heading: 'Sources',
      body: [
        'Where Lulla cites research or guidance, such as the American Academy of Pediatrics, the CDC, the WHO, and the FDA, we aim to summarize it faithfully. Guidance changes, so check current recommendations.',
      ],
    },
  ],
};

export const legalDocs: Record<LegalDocId, LegalDoc> = {
  privacy: privacyPolicy,
  terms: termsOfUse,
  medical: medicalDisclaimer,
};

export function legalToMarkdown(doc: LegalDoc): string {
  const lines = [`# Lulla ${doc.title}`, '', `_Last updated: ${doc.updated}_`, '', doc.intro, ''];
  for (const section of doc.sections) {
    lines.push(`## ${section.heading}`, '');
    for (const paragraph of section.body) lines.push(`- ${paragraph}`);
    lines.push('');
  }
  return lines.join('\n');
}
