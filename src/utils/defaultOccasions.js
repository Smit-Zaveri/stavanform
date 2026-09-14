// Built-in occasions of the Jain Dhun app (app/src/main/java/com/jaindhun/data/JainCalendar.kt), used to fill an empty
// "occasions" collection once. After that, Firestore is the source of truth.
export const DEFAULT_OCCASIONS = [
  {
    "id": "mahavir_janma",
    "name": [
      "મહાવીર જન્મ કલ્યાણક",
      "महावीर जन्म कल्याणक",
      "Mahavir Janma Kalyanak"
    ],
    "about": [
      "ક્ષત્રિયકુંડમાં રાજા સિદ્ધાર્થ અને રાણી ત્રિશલાને ત્યાં ૨૪મા તીર્થંકર ભગવાન મહાવીરનો જન્મ.",
      "क्षत्रियकुंड में राजा सिद्धार्थ और रानी त्रिशला के यहाँ 24वें तीर्थंकर भगवान महावीर का जन्म।",
      "Birth of Bhagwan Mahavir, the 24th Tirthankar, to King Siddharth and Queen Trishala at Kshatriyakund."
    ],
    "month": "Chaitra",
    "paksha": "Sud",
    "tithi": 13,
    "days": 1,
    "keywords": [
      "mahavir",
      "mahaveer",
      "vardhaman",
      "trishala"
    ],
    "dates": []
  },
  {
    "id": "chaitri_oli",
    "name": [
      "ચૈત્રી નવપદ ઓળી",
      "चैत्री नवपद ओली",
      "Chaitri Navpad Oli"
    ],
    "about": [
      "નવ દિવસ આયંબિલ સાથે નવપદની આરાધના: અરિહંત, સિદ્ધ, આચાર્ય, ઉપાધ્યાય, સાધુ, દર્શન, જ્ઞાન, ચારિત્ર અને તપ.",
      "नौ दिन आयंबिल के साथ नवपद की आराधना: अरिहंत, सिद्ध, आचार्य, उपाध्याय, साधु, दर्शन, ज्ञान, चारित्र और तप।",
      "Nine days of ayambil worshipping the Navpad: Arihant, Siddha, Acharya, Upadhyay, Sadhu, Darshan, Gyan, Charitra and Tap."
    ],
    "month": "Chaitra",
    "paksha": "Sud",
    "tithi": 7,
    "days": 9,
    "keywords": [
      "navpad",
      "siddhachakra",
      "ayambil",
      "shripal"
    ],
    "dates": []
  },
  {
    "id": "akshaya_tritiya",
    "name": [
      "અક્ષય તૃતીયા",
      "अक्षय तृतीया",
      "Akshaya Tritiya"
    ],
    "about": [
      "ભગવાન ઋષભદેવે શ્રેયાંસકુમારે વહોરાવેલા શેરડીના રસથી વર્ષીતપનું પારણું કર્યું; આજે વર્ષીતપના તપસ્વીઓ પારણું કરે છે.",
      "भगवान ऋषभदेव ने श्रेयांसकुमार द्वारा बहराए गन्ने के रस से वर्षीतप का पारणा किया; आज वर्षीतप के तपस्वी पारणा करते हैं।",
      "Bhagwan Rishabhdev broke his year-long fast with sugarcane juice offered by Shreyans Kumar; varshitap tapasvis do their parna today."
    ],
    "month": "Vaishakh",
    "paksha": "Sud",
    "tithi": 3,
    "days": 1,
    "keywords": [
      "akshay",
      "varshitap",
      "adinath",
      "adishwar",
      "rishabh"
    ],
    "dates": []
  },
  {
    "id": "mahavir_kevalgyan",
    "name": [
      "મહાવીર કેવળજ્ઞાન કલ્યાણક",
      "महावीर केवलज्ञान कल्याणक",
      "Mahavir Kevalgyan Kalyanak"
    ],
    "about": [
      "ઋજુવાલિકા નદીના કિનારે ભગવાન મહાવીરને કેવળજ્ઞાન પ્રાપ્ત થયું.",
      "ऋजुवालिका नदी के किनारे भगवान महावीर को केवलज्ञान प्राप्त हुआ।",
      "Bhagwan Mahavir attained kevalgyan (omniscience) on the bank of the Rujuvaluka river."
    ],
    "month": "Vaishakh",
    "paksha": "Sud",
    "tithi": 10,
    "days": 1,
    "keywords": [
      "mahavir",
      "mahaveer",
      "kevalgyan"
    ],
    "dates": []
  },
  {
    "id": "neminath_moksh",
    "name": [
      "નેમિનાથ મોક્ષ કલ્યાણક",
      "नेमिनाथ मोक्ष कल्याणक",
      "Neminath Moksh Kalyanak"
    ],
    "about": [
      "ગિરનાર પર્વત પર ભગવાન નેમિનાથ મોક્ષે પધાર્યા.",
      "गिरनार पर्वत पर भगवान नेमिनाथ मोक्ष पधारे।",
      "Bhagwan Neminath attained moksh on Mount Girnar."
    ],
    "month": "Ashadh",
    "paksha": "Sud",
    "tithi": 8,
    "days": 1,
    "keywords": [
      "neminath",
      "girnar"
    ],
    "dates": []
  },
  {
    "id": "ashadh_chaumasi",
    "name": [
      "અષાઢી ચોમાસી ચૌદસ",
      "आषाढ़ी चौमासी चौदस",
      "Ashadhi Chaumasi Chaudas"
    ],
    "about": [
      "ચાતુર્માસનો પ્રારંભ: સાધુ-સાધ્વીજી ચોમાસું એક સ્થળે રહે છે; ચૌમાસી પ્રતિક્રમણ થાય છે.",
      "चातुर्मास का प्रारंभ: साधु-साध्वी वर्षाकाल में एक स्थान पर रहते हैं; चौमासी प्रतिक्रमण होता है।",
      "Chaturmas begins: sadhus and sadhvis stay in one place for the monsoon; chaumasi pratikraman is performed."
    ],
    "month": "Ashadh",
    "paksha": "Sud",
    "tithi": 14,
    "days": 1,
    "keywords": [
      "chaumasi",
      "chaturmas",
      "pratikraman"
    ],
    "dates": []
  },
  {
    "id": "neminath_janma",
    "name": [
      "નેમિનાથ જન્મ કલ્યાણક",
      "नेमिनाथ जन्म कल्याणक",
      "Neminath Janma Kalyanak"
    ],
    "about": [
      "શૌરીપુરમાં ૨૨મા તીર્થંકર ભગવાન નેમિનાથનો જન્મ.",
      "शौरीपुर में 22वें तीर्थंकर भगवान नेमिनाथ का जन्म।",
      "Birth of Bhagwan Neminath, the 22nd Tirthankar, at Shauripur."
    ],
    "month": "Shravan",
    "paksha": "Sud",
    "tithi": 5,
    "days": 1,
    "keywords": [
      "neminath",
      "girnar"
    ],
    "dates": []
  },
  {
    "id": "paryushan",
    "name": [
      "પર્યુષણ",
      "पर्युषण",
      "Paryushan"
    ],
    "about": [
      "તપ, પ્રતિક્રમણ અને કલ્પસૂત્ર શ્રવણના આઠ દિવસ, જૈન વર્ષના સૌથી પવિત્ર દિવસો.",
      "तप, प्रतिक्रमण और कल्पसूत्र श्रवण के आठ दिन, जैन वर्ष के सबसे पवित्र दिन।",
      "Eight days of fasting, pratikraman and listening to the Kalpasutra, the holiest days of the Jain year."
    ],
    "month": "Shravan",
    "paksha": "Vad",
    "tithi": 12,
    "days": 8,
    "keywords": [
      "paryushan",
      "kalpasutra",
      "kshamapana"
    ],
    "dates": []
  },
  {
    "id": "samvatsari",
    "name": [
      "સંવત્સરી",
      "संवत्सरी",
      "Samvatsari"
    ],
    "about": [
      "સંવત્સરી પ્રતિક્રમણ: સર્વ જીવોની ક્ષમા માગવી અને આપવી, મિચ્છામિ દુક્કડમ્.",
      "संवत्सरी प्रतिक्रमण: सभी जीवों से क्षमा माँगना और देना, मिच्छामि दुक्कडम्।",
      "Samvatsari pratikraman: asking and giving forgiveness to every living being, Micchami Dukkadam."
    ],
    "month": "Bhadarvo",
    "paksha": "Sud",
    "tithi": 4,
    "days": 1,
    "keywords": [
      "samvatsari",
      "kshamapana",
      "michhami",
      "khamemi"
    ],
    "dates": []
  },
  {
    "id": "aso_oli",
    "name": [
      "આસો નવપદ ઓળી",
      "आसोज नवपद ओली",
      "Aso Navpad Oli"
    ],
    "about": [
      "નવ દિવસ આયંબિલ સાથે નવપદની આરાધના: અરિહંત, સિદ્ધ, આચાર્ય, ઉપાધ્યાય, સાધુ, દર્શન, જ્ઞાન, ચારિત્ર અને તપ.",
      "नौ दिन आयंबिल के साथ नवपद की आराधना: अरिहंत, सिद्ध, आचार्य, उपाध्याय, साधु, दर्शन, ज्ञान, चारित्र और तप।",
      "Nine days of ayambil worshipping the Navpad: Arihant, Siddha, Acharya, Upadhyay, Sadhu, Darshan, Gyan, Charitra and Tap."
    ],
    "month": "Aso",
    "paksha": "Sud",
    "tithi": 7,
    "days": 9,
    "keywords": [
      "navpad",
      "siddhachakra",
      "ayambil",
      "shripal"
    ],
    "dates": []
  },
  {
    "id": "diwali",
    "name": [
      "દિવાળી · મહાવીર નિર્વાણ",
      "दीपावली · महावीर निर्वाण",
      "Diwali · Mahavir Nirvan"
    ],
    "about": [
      "પાવાપુરીમાં ભગવાન મહાવીર નિર્વાણ પામ્યા; જ્ઞાનનો દીવો ગયો તેથી દીવા પ્રગટાવાય છે.",
      "पावापुरी में भगवान महावीर का निर्वाण हुआ; ज्ञान का दीपक बुझा, इसलिए दीप जलाए जाते हैं।",
      "Bhagwan Mahavir attained nirvan at Pavapuri; lamps are lit because the light of knowledge has gone."
    ],
    "month": "Aso",
    "paksha": "Vad",
    "tithi": 15,
    "days": 1,
    "keywords": [
      "diwali",
      "mahavir",
      "mahaveer",
      "nirvan"
    ],
    "dates": []
  },
  {
    "id": "new_year",
    "name": [
      "નૂતન વર્ષ · ગૌતમસ્વામી કેવળજ્ઞાન",
      "नूतन वर्ष · गौतम स्वामी केवलज्ञान",
      "New Year · Gautam Swami Kevalgyan"
    ],
    "about": [
      "ભગવાન મહાવીરના પ્રથમ ગણધર ગૌતમસ્વામીને કેવળજ્ઞાન; વીર સંવતનું નવું વર્ષ શરૂ થાય છે.",
      "भगवान महावीर के प्रथम गणधर गौतम स्वामी को केवलज्ञान; वीर संवत का नया वर्ष शुरू होता है।",
      "Gautam Swami, Bhagwan Mahavir's first ganadhar, attained kevalgyan; the Vir Samvat new year begins."
    ],
    "month": "Kartak",
    "paksha": "Sud",
    "tithi": 1,
    "days": 1,
    "keywords": [
      "gautam",
      "labdhi"
    ],
    "dates": []
  },
  {
    "id": "gyan_panchami",
    "name": [
      "જ્ઞાન પંચમી",
      "ज्ञान पंचमी",
      "Gyan Panchami"
    ],
    "about": [
      "જ્ઞાનની આરાધનાનો દિવસ: આગમ અને પુસ્તકોની પૂજા, અને સમ્યગ્ જ્ઞાન માટે ઉપવાસ.",
      "ज्ञान की आराधना का दिन: आगम और पुस्तकों की पूजा, और सम्यक् ज्ञान के लिए उपवास।",
      "The day to honour knowledge: worship of scriptures and books, and fasting for right knowledge."
    ],
    "month": "Kartak",
    "paksha": "Sud",
    "tithi": 5,
    "days": 1,
    "keywords": [
      "gyan",
      "gnan",
      "saraswati",
      "panchami"
    ],
    "dates": []
  },
  {
    "id": "kartak_chaumasi",
    "name": [
      "કારતકી ચોમાસી ચૌદસ",
      "कार्तिकी चौमासी चौदस",
      "Kartaki Chaumasi Chaudas"
    ],
    "about": [
      "ચાતુર્માસ પૂર્ણ થાય છે; ચૌમાસી પ્રતિક્રમણ પછી સાધુ-સાધ્વીજી ફરી વિહાર શરૂ કરે છે.",
      "चातुर्मास पूर्ण होता है; चौमासी प्रतिक्रमण के बाद साधु-साध्वी फिर विहार शुरू करते हैं।",
      "Chaturmas ends; after chaumasi pratikraman sadhus and sadhvis resume vihar."
    ],
    "month": "Kartak",
    "paksha": "Sud",
    "tithi": 14,
    "days": 1,
    "keywords": [
      "chaumasi",
      "pratikraman"
    ],
    "dates": []
  },
  {
    "id": "kartak_punam",
    "name": [
      "કારતકી પૂનમ",
      "कार्तिक पूर्णिमा",
      "Kartak Punam"
    ],
    "about": [
      "શત્રુંજય (પાલીતાણા) તીર્થની યાત્રા ફરી શરૂ થાય છે.",
      "शत्रुंजय (पालीताणा) तीर्थ की यात्रा फिर शुरू होती है।",
      "The Shatrunjay (Palitana) yatra reopens after chaturmas."
    ],
    "month": "Kartak",
    "paksha": "Sud",
    "tithi": 15,
    "days": 1,
    "keywords": [
      "shatrunjay",
      "siddhachal",
      "siddhagiri",
      "palitana"
    ],
    "dates": []
  },
  {
    "id": "maun_agiyaras",
    "name": [
      "મૌન એકાદશી",
      "मौन एकादशी",
      "Maun Agiyaras"
    ],
    "about": [
      "મૌન અને ઉપવાસ સાથે આરાધના; આ દિવસે તીર્થંકરોના ૧૫૦ કલ્યાણક આવે છે.",
      "मौन और उपवास के साथ आराधना; इस दिन तीर्थंकरों के 150 कल्याणक आते हैं।",
      "Observed in silence and fasting; 150 kalyanaks of the Tirthankars fall on this day."
    ],
    "month": "Magshar",
    "paksha": "Sud",
    "tithi": 11,
    "days": 1,
    "keywords": [
      "ekadashi",
      "agiyaras",
      "agyaras"
    ],
    "dates": []
  },
  {
    "id": "posh_dashmi",
    "name": [
      "પોષ દશમી",
      "पौष दशमी",
      "Posh Dashmi"
    ],
    "about": [
      "વારાણસીમાં ૨૩મા તીર્થંકર ભગવાન પાર્શ્વનાથનો જન્મ.",
      "वाराणसी में 23वें तीर्थंकर भगवान पार्श्वनाथ का जन्म।",
      "Birth of Bhagwan Parshvanath, the 23rd Tirthankar, in Varanasi."
    ],
    "month": "Magshar",
    "paksha": "Vad",
    "tithi": 10,
    "days": 1,
    "keywords": [
      "parshvanath",
      "parshwanath",
      "parasnath",
      "shankheshwar"
    ],
    "dates": []
  },
  {
    "id": "meru_teras",
    "name": [
      "મેરુ તેરસ",
      "मेरु तेरस",
      "Meru Teras"
    ],
    "about": [
      "અષ્ટાપદ પર્વત પર ભગવાન ઋષભદેવ નિર્વાણ પામ્યા.",
      "अष्टापद पर्वत पर भगवान ऋषभदेव का निर्वाण हुआ।",
      "Bhagwan Rishabhdev attained nirvan on Mount Ashtapad."
    ],
    "month": "Maha",
    "paksha": "Vad",
    "tithi": 13,
    "days": 1,
    "keywords": [
      "adinath",
      "adishwar",
      "rishabh",
      "ashtapad"
    ],
    "dates": []
  },
  {
    "id": "fagan_chaumasi",
    "name": [
      "ફાગણ ચોમાસી ચૌદસ",
      "फाल्गुन चौमासी चौदस",
      "Fagan Chaumasi Chaudas"
    ],
    "about": [
      "ઋતુ બદલાતાં ચૌમાસી પ્રતિક્રમણ થાય છે.",
      "ऋतु बदलने पर चौमासी प्रतिक्रमण होता है।",
      "Chaumasi pratikraman marking the change of season."
    ],
    "month": "Fagan",
    "paksha": "Sud",
    "tithi": 14,
    "days": 1,
    "keywords": [
      "chaumasi",
      "pratikraman"
    ],
    "dates": []
  },
  {
    "id": "varshitap",
    "name": [
      "વર્ષીતપ પ્રારંભ",
      "वर्षीतप प्रारंभ",
      "Varshitap begins"
    ],
    "about": [
      "ભગવાન ઋષભદેવનો જન્મ અને દીક્ષા કલ્યાણક; વર્ષીતપનો પ્રારંભ.",
      "भगवान ऋषभदेव का जन्म और दीक्षा कल्याणक; वर्षीतप का प्रारंभ।",
      "Janma and diksha kalyanak of Bhagwan Rishabhdev; the year-long varshitap begins."
    ],
    "month": "Fagan",
    "paksha": "Vad",
    "tithi": 8,
    "days": 1,
    "keywords": [
      "varshitap",
      "adinath",
      "adishwar",
      "rishabh"
    ],
    "dates": []
  }
];
