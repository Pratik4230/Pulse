import type { LucideIcon } from "lucide-react"
import { CalendarDays, Inbox, Mail } from "lucide-react"

export type StarterSuggestion = {
  lang: string
  text: string
}

export type StarterSuggestionGroup = {
  id: string
  title: string
  icon: LucideIcon
  items: StarterSuggestion[]
}

/** One Gmail, Calendar, or combined prompt per major language. */
export const STARTER_SUGGESTION_GROUPS: StarterSuggestionGroup[] = [
  {
    id: "inbox",
    title: "Inbox",
    icon: Inbox,
    items: [
      {
        lang: "English",
        text: "List my 5 most recent unread emails. For each, give sender, subject, and a one-line summary.",
      },
      {
        lang: "Hindi",
        text: "मेरे 5 सबसे हाल के unread emails दिखाओ। हर email के लिए sender, subject और 1 लाइन summary दो।",
      },
      {
        lang: "Marathi",
        text: "माझे 5 सर्वात अलीकडचे unread emails दाखवा. प्रत्येकासाठी sender, विषय, आणि 1 ओळीचा सारांश द्या.",
      },
      {
        lang: "Bengali",
        text: "আমার ৫টি সবচেয়ে সাম্প্রতিক unread ইমেইল দেখাও। প্রতিটির জন্য sender, subject এবং ১ লাইনের সারাংশ দাও।",
      },
      {
        lang: "Tamil",
        text: "எனது 5 சமீபத்திய unread emails பட்டியல் செய். ஒவ்வொன்றிற்கும் sender, subject, மற்றும் 1-வரி summary சொல்லு.",
      },
      {
        lang: "Telugu",
        text: "నా 5 తాజా unread ఇమెయిల్స్ చూపించు. ప్రతి దానికి sender, subject, మరియు 1 లైన్ సారాంశం ఇవ్వు.",
      },
      {
        lang: "Kannada",
        text: "ನನ್ನ 5 ಇತ್ತೀಚಿನ unread ಇಮೇಲ್‌ಗಳನ್ನು ತೋರಿಸಿ. ಪ್ರತಿ ಒಂದಕ್ಕೂ sender, subject, ಮತ್ತು 1 ಸಾಲಿನ ಸಾರಾಂಶ ನೀಡಿ.",
      },
      {
        lang: "Punjabi",
        text: "ਮੇਰੇ 5 ਸਭ ਤੋਂ ਨਵੇਂ unread emails ਦਿਖਾਓ। ਹਰ ਇੱਕ ਲਈ sender, subject ਅਤੇ 1 ਲਾਈਨ summary ਦਿਓ।",
      },
      {
        lang: "Gujarati",
        text: "મારા 5 સૌથી તાજેતરના unread ઇમેઈલ્સ બતાવો. દરેક માટે sender, subject અને 1 લાઈન સારાંશ આપો.",
      },
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: CalendarDays,
    items: [
      {
        lang: "English",
        text: "What events do I have this week? If anything overlaps, highlight the conflicts.",
      },
      {
        lang: "Hindi",
        text: "इस हफ्ते मेरे calendar पर क्या events हैं? अगर overlap हो, तो conflicts बताओ।",
      },
      {
        lang: "Marathi",
        text: "या आठवड्यात माझ्या calendar वर कोणती events आहेत? ओव्हरलॅप असल्यास conflict दाखवा.",
      },
      {
        lang: "Bengali",
        text: "এই সপ্তাহে আমার calendar-এ কী কী events আছে? overlap থাকলে conflicts দেখাও।",
      },
      {
        lang: "Tamil",
        text: "இந்த week எனக்கு என்ன calendar events இருக்கின்றன? overlap இருந்தால் conflicts சொல்லு.",
      },
      {
        lang: "Telugu",
        text: "ఈ వారం నా calendar లో ఏ events ఉన్నాయి? overlap అయితే conflicts చెప్పు.",
      },
      {
        lang: "Kannada",
        text: "ಈ ವಾರ ನನ್ನ calendar ನಲ್ಲಿ ಯಾವ events ಇವೆ? overlap ಇದ್ದರೆ conflicts ತೋರಿಸಿ.",
      },
      {
        lang: "Punjabi",
        text: "ਇਸ ਹਫ਼ਤੇ ਮੇਰੇ calendar 'ਤੇ ਕਿਹੜੇ events ਹਨ? ਜੇ overlap ਹੋਵੇ ਤਾਂ conflicts ਦੱਸੋ।",
      },
      {
        lang: "Gujarati",
        text: "આ અઠવાડિયે મારા calendar પર કયા events છે? overlap હોય તો conflicts બતાવો.",
      },
    ],
  },
  {
    id: "schedule-email",
    title: "Schedule + email",
    icon: Mail,
    items: [
      {
        lang: "English",
        text: "Schedule a 30-minute interview with pratikjadhav9534@gmail.com on Friday at 10:00am, send a confirmation email, and include the agenda (2 bullets).",
      },
      {
        lang: "Hindi",
        text: "शुक्रवार 10:00am पर pratikjadhav9534@gmail.com के साथ 30-मिनट इंटरव्यू शेड्यूल करो, confirmation email भेजो, और agenda 2 बिंदु में लिखो।",
      },
      {
        lang: "Marathi",
        text: "शुक्रवारी सकाळी 10:00 वाजता pratikjadhav9534@gmail.com सोबत 30-मिनिट इंटरव्यू शेड्यूल करा, confirmation email पाठवा, आणि agenda 2 पॉइंट्समध्ये द्या।",
      },
      {
        lang: "Bengali",
        text: "শুক্রবার সকাল ১০:০০টায় pratikjadhav9534@gmail.com-এর সাথে ৩০ মিনিটের ইন্টারভিউ শেডিউল করো, confirmation ইমেইল পাঠাও, এবং agenda ২টা পয়েন্টে লিখো।",
      },
      {
        lang: "Tamil",
        text: "வெள்ளிக்கிழமை காலை 10:00க்கு pratikjadhav9534@gmail.com-க்கு 30 நிமிட interview schedule பண்ணு, confirmation email அனுப்பு, agenda-வை 2 bullets-ஆ சொல்லு.",
      },
      {
        lang: "Telugu",
        text: "శుక్రవారం ఉదయం 10:00కి pratikjadhav9534@gmail.com‌తో 30 నిమిషాల ఇంటర్వ్యూ షెడ్యూల్ చేయి, confirmation email పంపి, agenda ని 2 పాయింట్లలో ఉంచు.",
      },
      {
        lang: "Kannada",
        text: "ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ 10:00ಕ್ಕೆ pratikjadhav9534@gmail.com ಜೊತೆ 30 ನಿಮಿಷದ interview ಶೆಡ್ಯೂಲ್ ಮಾಡಿ, confirmation email ಕಳುಹಿಸಿ, agenda ಅನ್ನು 2 bullets ನಲ್ಲಿ ಸೇರಿಸಿ.",
      },
      {
        lang: "Punjabi",
        text: "ਸ਼ੁੱਕਰਵਾਰ 10:00am ਨੂੰ pratikjadhav9534@gmail.com ਨਾਲ 30 ਮਿੰਟ ਦੀ interview schedule ਕਰੋ, confirmation email ਭੇਜੋ, ਅਤੇ agenda 2 bullets ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ।",
      },
      {
        lang: "Gujarati",
        text: "શુક્રવારે સવારે 10:00 વાગ્યે pratikjadhav9534@gmail.com સાથે 30 મિનિટનું interview શેડ્યૂલ કરો, confirmation email મોકલો, અને agenda 2 bulletsમાં ઉમેરો.",
      },
    ],
  },
]

/** Seven curated prompts for the Pulse empty state (one list). */
export const STARTER_SUGGESTIONS: StarterSuggestion[] = [
  STARTER_SUGGESTION_GROUPS[0].items[0],
  STARTER_SUGGESTION_GROUPS[1].items[0],
  STARTER_SUGGESTION_GROUPS[2].items[0],
  STARTER_SUGGESTION_GROUPS[0].items[1],
  STARTER_SUGGESTION_GROUPS[1].items[1],
  STARTER_SUGGESTION_GROUPS[2].items[1],
  STARTER_SUGGESTION_GROUPS[0].items[2],
]

export const STARTER_LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Punjabi",
  "Gujarati",
] as const
