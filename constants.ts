import { Technique } from './types';

export const TECHNIQUES: Technique[] = [
  {
    id: 'vedic_astrology',
    name: 'Vedic Astrology',
    description: 'Ancient Indian system of astrology to understand planetary influences on your life.',
    enabled: true,
  },
  {
    id: 'numerology',
    name: 'Numerology',
    description: 'Explore the mystical relationship between numbers and life events based on your birth date.',
    enabled: true,
  },
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Algorithmic Tarot-style prediction for insights into your past, present, and future.',
    enabled: true,
  },
  {
    id: 'palmistry',
    name: 'Palmistry',
    description: 'Upload a photo of your palm to receive a personalized reading of your life lines and mounts.',
    enabled: true,
  },
];

export const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
];

export const GREETINGS: { [key: string]: (name: string, technique: string) => string } = {
    en: (name, technique) => `Greetings, ${name}. I am the Vibe Oracle. Using the ancient art of ${technique}, I will help you find clarity. What answers do you seek?`,
    hi: (name, technique) => `नमस्ते, ${name}। मैं वाइब ओरेकल हूं। ${technique} की प्राचीन कला का उपयोग करके, मैं आपको स्पष्टता खोजने में मदद करूंगी। आप क्या उत्तर चाहते हैं?`,
    es: (name, technique) => `Saludos, ${name}. Soy el Oráculo Vibe. Usando el antiguo arte de ${technique}, te ayudaré a encontrar claridad. ¿Qué respuestas buscas?`,
    fr: (name, technique) => `Salutations, ${name}. Je suis l'Oracle Vibe. En utilisant l'art ancien de ${technique}, je vous aiderai à trouver la clarté. Quelles réponses cherchez-vous ?`,
    mr: (name, technique) => `नमस्कार, ${name}. मी वाईब ओरेकल आहे. ${technique} च्या प्राचीन कलेचा वापर करून, मी तुम्हाला स्पष्टता शोधण्यात मदत करेन. तुम्ही कोणती उत्तरे शोधत आहात?`,
    ta: (name, technique) => `வணக்கம், ${name}. நான் வைப் ஆரக்கிள். ${technique} என்ற பண்டைய கலையைப் பயன்படுத்தி, தெளிவு பெற நான் உங்களுக்கு உதவுவேன். நீங்கள் என்ன பதில்களைத் தேடுகிறீர்கள்?`,
    te: (name, technique) => `నమస్కారం, ${name}. నేను వైబ్ ఒరాకిల్. ${technique} అనే ప్రాచీన కళను ఉపయోగించి, నేను మీకు స్పష్టతను కనుగొనడంలో సహాయం చేస్తాను. మీరు ఏ సమాధానాలను వెతుకుతున్నారు?`,
    bn: (name, technique) => `নমস্কার, ${name}. আমি ভাইব ওরাকল। ${technique}-এর প্রাচীন শিল্প ব্যবহার করে, আমি আপনাকে স্বচ্ছতা খুঁজে পেতে সাহায্য করব। আপনি কি উত্তর খুঁজছেন?`,
    gu: (name, technique) => `નમસ્તે, ${name}. હું વાઇબ ઓરેકલ છું. ${technique} ની પ્રાચીน કળાનો ઉપયોગ કરીને, હું તમને સ્પષ્ટતા શોધવામાં મદદ કરીશ. તમે કયા જવાબો શોધી રહ્યા છો?`,
    kn: (name, technique) => `ನಮಸ್ಕಾರ, ${name}. ನಾನು ವೈಬ್ ಒರಾಕಲ್. ${technique} ಎಂಬ ಪ್ರಾಚೀನ ಕಲೆಯನ್ನು ಬಳಸಿ, ಸ್ಪಷ್ಟತೆಯನ್ನು ಕಂಡುಕೊಳ್ಳಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನೀವು ಯಾವ ಉತ್ತರಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?`,
    ml: (name, technique) => `നമസ്കാരം, ${name}. ഞാൻ വൈബ് ഒറാക്കിൾ ആണ്. ${technique} എന്ന പുരാതന കല ഉപയോഗിച്ച്, വ്യക്തത കണ്ടെത്താൻ ഞാൻ നിങ്ങളെ സഹായിക്കും. നിങ്ങൾ എന്ത് ഉത്തരങ്ങളാണ് തേടുന്നത്?`,
    or: (name, technique) => `ନମସ୍କାର, ${name}. ମୁଁ ଭାଇବ୍ ଓରାକଲ୍। ${technique}ର ପ୍ରାଚୀନ କଳା ବ୍ୟବହାର କରି, ମୁଁ ଆପଣଙ୍କୁ ସ୍ପଷ୍ଟତା ପାଇବାରେ ସାହାଯ୍ୟ କରିବି। ଆପଣ କେଉଁ ଉତ୍ତର ଖୋଜୁଛନ୍ତି?`,
};

export const LOADING_MESSAGES: { [key: string]: string[] } = {
    en: [
        "Consulting the cosmic energies...",
        "Gazing into the astral plane...",
        "Decoding the whispers of the universe...",
        "Aligning the planetary charts...",
        "Interpreting the celestial signs...",
    ],
    hi: [
        "ब्रह्मांडीय ऊर्जाओं से परामर्श किया जा रहा है...",
        "सूक्ष्म जगत में झाँका जा रहा है...",
        "ब्रह्मांड की फुसफुसाहट को समझा जा रहा है...",
        "ग्रहों के चार्ट का मिलान किया जा रहा है...",
        "दिव्य संकेतों की व्याख्या की जा रही है...",
    ],
    es: [
        "Consultando las energías cósmicas...",
        "Mirando en el plano astral...",
        "Decodificando los susurros del universo...",
        "Alineando las cartas planetarias...",
        "Interpretando las señales celestiales...",
    ],
    fr: [
        "Consultation des énergies cosmiques...",
        "Regard dans le plan astral...",
        "Décodage des murmures de l'univers...",
        "Alignement des cartes planétaires...",
        "Interprétation des signes célestes...",
    ],
    mr: [
        "वैश्विक ऊर्जांचा सल्ला घेतला जात आहे...",
        "सूक्ष्म जगात डोकावत आहे...",
        "विश्वाच्या कुजबुजांचा उलगडा करत आहे...",
        "ग्रह तक्त्यांची जुळवाजुळव करत आहे...",
        "दिव्य चिन्हांचा अर्थ लावत आहे...",
    ],
    ta: [
        "பிரபஞ்ச ஆற்றல்களை ஆலோசிக்கிறது...",
        "வான்வழி விமானத்தில் பார்க்கிறது...",
        "பிரபஞ்சத்தின் கிசுகிசுக்களை டிகோட் செய்கிறது...",
        "கோள் விளக்கப்படங்களை சீரமைக்கிறது...",
        "வான அறிகுறிகளை விளக்குகிறது...",
    ],
    te: [
        "విశ్వ శక్తులను సంప్రదిస్తోంది...",
        "జ్యోతిష్య లోకంలోకి చూస్తోంది...",
        "విశ్వం యొక్క గుసగుసలను డీకోడ్ చేస్తోంది...",
        "గ్రహ పటాలను సమలేఖనం చేస్తోంది...",
        "దివ్య సంకేతాలను వివరిస్తోంది...",
    ],
    bn: [
        "মহাজাগতিক শক্তির সাথে পরামর্শ করা হচ্ছে...",
        "জ্যোতিষ তলে তাকানো হচ্ছে...",
        "মহাবিশ্বের ফিসফিস расшифровка করা হচ্ছে...",
        "গ্রহের চার্টগুলি সারিবদ্ধ করা হচ্ছে...",
        "স্বর্গীয় লক্ষণগুলির ব্যাখ্যা করা হচ্ছে...",
    ],
    gu: [
        "બ્રહ્માંડની ઉર્જાની સલાહ લેવામાં આવી રહી છે...",
        "સૂક્ષ્મ વિમાનમાં જોવામાં આવી રહ્યું છે...",
        "બ્રહ્માંડના ગણગણાટને સમજવામાં આવી રહ્યો છે...",
        "ગ્રહોના ચાર્ટ્સને સંરેખિત કરવામાં આવી રહ્યા છે...",
        "દૈવી સંકેતોનું અર્થઘટન કરવામાં આવી રહ્યું છે...",
    ],
    kn: [
        "ಬ್ರಹ್ಮಾಂಡದ ಶಕ್ತಿಗಳನ್ನು ಸಮಾಲೋಚಿಸಲಾಗುತ್ತಿದೆ...",
        "ಸೂಕ್ಷ್ಮ ಸಮತಲದಲ್ಲಿ ನೋಡಲಾಗುತ್ತಿದೆ...",
        "ಬ್ರಹ್ಮಾಂಡದ ಪಿಸುಮಾತುಗಳನ್ನು ಡಿಕೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        "ಗ್ರಹಗಳ ನಕ್ಷೆಗಳನ್ನು ಜೋಡಿಸಲಾಗುತ್ತಿದೆ...",
        "ದೈವಿಕ ಚಿಹ್ನೆಗಳನ್ನು ಅರ್ಥೈಸಲಾಗುತ್ತಿದೆ...",
    ],
    ml: [
        "പ്രപഞ്ച ഊർജ്ജങ്ങളുമായി ആലോചിക്കുന്നു...",
        "സൂക്ഷ്മ തലത്തിലേക്ക് നോക്കുന്നു...",
        "പ്രപഞ്ചത്തിന്റെ മന്ത്രങ്ങൾ ഡീകോഡ് ചെയ്യുന്നു...",
        "ഗ്രഹങ്ങളുടെ ചാർട്ടുകൾ വിന്യസിക്കുന്നു...",
        "ദിവ്യ ചിഹ്നങ്ങളെ വ്യാഖ്യാനിക്കുന്നു...",
    ],
    or: [
        "ବ୍ରହ୍ମାଣ୍ଡୀୟ ଶକ୍ତି ସହିତ ପରାମର୍ଶ କରାଯାଉଛି...",
        "ସୂକ୍ଷ୍ମ ବିମାନକୁ ଦେଖାଯାଉଛି...",
        "ବ୍ରହ୍ମାଣ୍ଡର ଗୁପ୍ତ କଥାକୁ ଡିକୋଡ୍ କରାଯାଉଛି...",
        "ଗ୍ରହ ଚାର୍ଟଗୁଡ଼ିକୁ ସମାନ୍ତରାଳ କରାଯାଉଛି...",
        "ଦିବ୍ୟ ସଙ୍କେତଗୁଡ଼ିକର ବ୍ୟାଖ୍ୟା କରାଯାଉଛି...",
    ],
};