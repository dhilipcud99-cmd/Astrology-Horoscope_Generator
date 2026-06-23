// Detailed predictions database for the 27 Nakshatras in Tamil and English

const starData = {
    ta: [
        {
            name: "அஸ்வினி",
            general: "நீங்கள் எதிலும் சுறுசுறுப்பாகவும் விரைவாகவும் செயல்படும் குணம் கொண்டவர். கம்பீரமான தோற்றமும், பிறருக்கு உதவும் நல்ல மனமும் கொண்டவர். புதிய முயற்சிகளைத் தொடங்குவதில் ஆர்வம் காட்டுவீர்கள்.",
            career: "மருத்துவம், காவல்துறை, ராணுவம், இயந்திரவியல், விளையாட்டு மற்றும் சொந்தத் தொழில் போன்றவற்றில் சிறந்து விளங்குவீர்கள்.",
            health: "தலைவலி, நரம்புத் தளர்ச்சி மற்றும் இரத்த அழுத்தம் தொடர்பான பிரச்சனைகளில் கவனம் தேவை.",
            compatibility: "பரணி, பூசம், அஸ்தம் மற்றும் கேட்டை நட்சத்திரங்களுடன் நல்ல பொருத்தம் அமையும்."
        },
        {
            name: "பரணி",
            general: "நீங்கள் வைராக்கியம் மற்றும் நேர்மை குணம் கொண்டவர். கலைகளில் ஆர்வம், ஆடம்பர வாழ்வில் நாட்டம் உடையவர். சுயமாக சிந்தித்து முடிவெடுப்பீர்கள், எதற்கும் அஞ்ச மாட்டீர்கள்.",
            career: "கலைத்துறை, சமையற்கலை, நீதித்துறை, மேலாண்மை மற்றும் இரசாயனத் துறைகளில் வெற்றி பெறுவீர்கள்.",
            health: "உடல் சூடு, கண் கோளாறுகள் மற்றும் செரிமானப் பாதையில் கவனம் செலுத்துவது நல்லது.",
            compatibility: "அஸ்வினி, கார்த்திகை, பூரம் மற்றும் அனுஷம் நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "கார்த்திகை",
            general: "நீங்கள் கூர்மையான அறிவும், கம்பீரமான பேச்சும் கொண்டவர். கோபமும் அன்பும் கலந்த குணமுடையவர். எதையும் பகுத்தாய்ந்து அறியும் திறன் உங்களுக்கு உண்டு.",
            career: "அரசுப் பணி, அரசியல், பாதுகாப்புத் துறை, உலோகம் சார்ந்த தொழில்கள் மற்றும் கற்பித்தல் பணிகளில் சாதிப்பீர்கள்.",
            health: "காய்ச்சல், தொண்டை வலி மற்றும் முகத்தில் சிறு காயங்கள் ஏற்பட வாய்ப்புள்ளது.",
            compatibility: "பரணி, ரோகிணி, அஸ்தம் மற்றும் பூராடம் நட்சத்திரங்களுடன் இணக்கம் அதிகம்."
        },
        {
            name: "ரோகிணி",
            general: "நீங்கள் மென்மையான பேச்சும், கவரும் தோற்றமும் கொண்டவர். கற்பனை வளம் மற்றும் கலை உணர்வு மிக்கவர். குடும்பத்தின் மீது மிகுந்த பாசம் கொண்டிருப்பீர்கள்.",
            career: "திரைப்படம், இசை, ஆடை வடிவமைப்பு, விவசாயம், திரவப் பொருட்கள் வர்த்தகம் மற்றும் மக்கள் தொடர்பு துறைகள் சாதகமானவை.",
            health: "சளித் தொல்லை, தொண்டை வலி மற்றும் மன அழுத்தம் சார்ந்த உபாதைகள் வரலாம்.",
            compatibility: "மிருகசீரிடம், புனர்பூசம், சித்திரை மற்றும் உத்திராடம் பொருத்தமானவை."
        },
        {
            name: "மிருகசீரிடம்",
            general: "நீங்கள் ஆராய்ச்சி மனப்பான்மை மற்றும் எதையும் தேடி அறியும் குணம் கொண்டவர். அமைதியானவர் ஆனால் அவசியமான போது உறுதியாக செயல்படுவீர்கள். பயணங்களை விரும்புவீர்கள்.",
            career: "கல்வித் துறை, பத்திரிக்கை, தகவல் தொழில்நுட்பம், நிலத் தரகு மற்றும் வடிவமைப்புத் துறைகளில் பிரகாசிப்பீர்கள்.",
            health: "தோள்பட்டை வலி, காது கோளாறுகள் மற்றும் ஒவ்வாமை (Allergy) பிரச்சனைகள் ஏற்படலாம்.",
            compatibility: "ரோகிணி, ஆயில்யம், சுவாதி மற்றும் திருவோணம் நட்சத்திரங்கள் இணக்கமானவை."
        },
        {
            name: "திருவாதிரை",
            general: "நீங்கள் சவால்களை எதிர்கொள்வதில் வல்லவர். விடாமுயற்சியும் கூர்மையான புத்தியும் கொண்டவர். சில நேரங்களில் பிடிவாதம் அதிகமாக இருக்கும்.",
            career: "ஆராய்ச்சி, மென்பொருள் தயாரிப்பு, கணக்கியல், தூதரகப் பணிகள் மற்றும் மருந்து தயாரிப்புத் துறைகள் ஏற்றவை.",
            health: "தோல் நோய்கள், நரம்பு உபாதைகள் மற்றும் மூச்சுக்குழல் தொடர்பான பிரச்சனைகளில் விழிப்புடன் இருக்கவும்.",
            compatibility: "மிருகசீரிடம், புனர்பூசம், விசாகம் மற்றும் பூரட்டாதி நட்சத்திரங்கள் நலம் தரும்."
        },
        {
            name: "புனர்பூசம்",
            general: "நீங்கள் அமைதி, இரக்கம் மற்றும் ஆன்மீக நாட்டம் கொண்டவர். சகிப்புத்தன்மை அதிகம் உடையவர். எப்போதும் நேர்மறையான எண்ணங்களை விரும்புவீர்கள்.",
            career: "ஆசிரியப் பணி, வங்கித் துறை, சட்டம், இலக்கியம் மற்றும் ஆலோசனை வழங்கும் பணிகளில் பெரும் புகழ் பெறுவீர்கள்.",
            health: "நுரையீரல், வயிறு உபாதைகள் மற்றும் உடல் சோர்வு ஏற்பட வாய்ப்புண்டு.",
            compatibility: "ரோகிணி, பூசம், அனுஷம் மற்றும் உத்திரட்டாதி நட்சத்திரங்களுடன் நல்ல பொருத்தம் உண்டு."
        },
        {
            name: "பூசம்",
            general: "நீங்கள் ஒழுக்கமும், கடமை உணர்வும் கொண்டவர். பிறருக்கு வழிகாட்டும் ஆளுமை கொண்டவர். கடின உழைப்பால் வாழ்வில் முன்னேறுவீர்கள்.",
            career: "அரசு நிர்வாகம், நீதித்துறை, சுரங்கத் தொழில், கல்வி நிறுவனங்கள் மற்றும் ஆன்மீகப் பணிகளில் உயர் பதவி கிட்டும்.",
            health: "செரிமானக் கோளாறுகள், மார்புச் சளி மற்றும் மூட்டு வலி வரலாம்.",
            compatibility: "அஸ்வினி, புனர்பூசம், ஆயில்யம் மற்றும் ரேவதி நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "ஆயில்யம்",
            general: "நீங்கள் தந்திரமான அறிவும், வாக்கு வன்மையும் கொண்டவர். எதையும் சாதுரியமாக கையாளுவீர்கள். தலைமை தாங்கும் பண்பு உங்களுக்கு இயல்பாகவே இருக்கும்.",
            career: "வியாபாரம், தூதரகம், தணிக்கை (Auditing), மென்பொருள் வடிவமைப்பு மற்றும் உளவுத் துறைகளில் வெற்றி பெறுவீர்கள்.",
            health: "வயிறு மற்றும் நரம்பு மண்டலம் தொடர்பான உபாதைகளில் கவனம் தேவை.",
            compatibility: "மிருகசீரிடம், பூசம், மகம் மற்றும் அவிட்டம் நட்சத்திரங்கள் இணக்கமானவை."
        },
        {
            name: "மகம்",
            general: "நீங்கள் கம்பீரமும், தாராள மனமும் கொண்டவர். முன்னோர்களை மதிப்பவர் மற்றும் பாரம்பரியத்தில் பற்றுடையவர். சுயமரியாதைக்கு முக்கியத்துவம் தருவீர்கள்.",
            career: "அரசியல், உயர் நிர்வாகப் பதவிகள், நீதித்துறை, தொல்பொருள் ஆராய்ச்சி மற்றும் குடும்பத் தொழில் போன்றவைகளில் ஜொலிப்பீர்கள்.",
            health: "இதய ஆரோக்கியம், முதுகெலும்பு மற்றும் கண் பார்வையில் அக்கறை காட்டவும்.",
            compatibility: "பரணி, பூரம், சித்திரை மற்றும் கேட்டை நட்சத்திரங்கள் சிறந்தவை."
        },
        {
            name: "பூரம்",
            general: "நீங்கள் கலைநயம், நகைச்சுவை உணர்வு மற்றும் கவரும் பேச்சுத் திறன் கொண்டவர். மகிழ்ச்சியான வாழ்வை விரும்புவீர்கள். நட்பு வட்டாரத்தில் செல்வாக்கு மிக்கவர்.",
            career: "திரைத்துறை, ஆடை, ஆபரண வணிகம், சுற்றுலாத் துறை மற்றும் பெண்கள் சார்ந்த பொருட்கள் உற்பத்தி மற்றும் விற்பனை ஏற்றவை.",
            health: "இரத்த ஓட்டம், சர்க்கரை நோய் மற்றும் சிறுநீரகப் பிரச்சனைகளில் விழிப்புணர்வு அவசியம்.",
            compatibility: "மகம், உத்திரம், சுவாதி மற்றும் அனுஷம் நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "உத்திரம்",
            general: "நீங்கள் நேர்மையும், கடமை தவறாத குணமும் கொண்டவர். பொறுமையும் நிதானமும் உடையவர். பிறருக்கு உதவி செய்வதில் மகிழ்ச்சி காண்பீர்கள்.",
            career: "அரசு வேலை, மேலாண்மை, கல்வித் துறை, சமூக சேவை மற்றும் நிதி நிறுவனங்களில் சாதிக்கலாம்.",
            health: "குடல் கோளாறுகள், இடுப்பு வலி மற்றும் ஒற்றைத் தலைவலி வரலாம்.",
            compatibility: "கார்த்திகை, பூரம், அஸ்தம் மற்றும் விசாகம் நட்சத்திரங்களுடன் நற்பொருத்தம் உண்டு."
        },
        {
            name: "அஸ்தம்",
            general: "நீங்கள் சுறுசுறுப்பும், நகைச்சுவை உணர்வும் கொண்டவர். சிறந்த பேச்சாற்றல் மற்றும் கைத்தொழில்களில் ஆர்வம் உடையவர். எதையும் எளிதில் கற்றுக்கொள்வீர்கள்.",
            career: "வர்த்தகம், எழுத்து, ஜோதிடம், கைவினைப் பொருட்கள் தயாரிப்பு, விற்பனை மற்றும் தூதரகப் பணிகள் ஏற்றவை.",
            health: "வாயுத் தொல்லை, சளி மற்றும் மன சோர்வு போன்றவற்றில் கவனம் தேவை.",
            compatibility: "அஸ்வினி, கார்த்திகை, சித்திரை மற்றும் உத்திராடம் இணக்கமானவை."
        },
        {
            name: "சித்திரை",
            general: "நீங்கள் கலை உணர்வும், தைரியமும் கொண்டவர். சவால்களை விரும்பும் குணம் கொண்டவர். கவர்ச்சிகரமான தோற்றமும், கூர்மையான புத்தியும் உடையவர்.",
            career: "பொறியியல், கட்டிடக்கலை, நகை வடிவமைப்பு, காவல் மற்றும் ஊடகத் துறைகளில் சிறந்து விளங்குவீர்கள்.",
            health: "இரத்தக் கசிவு, சிறுநீரகக் கற்கள் மற்றும் தோல் ஒவ்வாமை ஏற்படலாம்.",
            compatibility: "ரோகிணி, மகம், அஸ்தம், சுவாதி மற்றும் சதயம் நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "சுவாதி",
            general: "நீங்கள் சுதந்திரத்தை விரும்புபவர், நேர்மையானவர். இனிமையான பேச்சால் அனைவரையும் கவர்வீர்கள். நியாயத்திற்கும் தர்மத்திற்கும் கட்டுப்படுவீர்கள்.",
            career: "நீதிமன்றப் பணி, பொது வர்த்தகம், போக்குவரத்து, கலைத்துறை மற்றும் ஆன்மீக போதனைகளில் வெற்றி காண்பீர்கள்.",
            health: "மூட்டு வலிகள், சிறுநீரகப் பிரச்சனைகள் மற்றும் வாயு உபாதைகள் வரலாம்.",
            compatibility: "மிருகசீரிடம், பூரம், சித்திரை, விசாகம் மற்றும் பூரட்டாதி நட்சத்திரங்கள் ஏற்றவை."
        },
        {
            name: "விசாகம்",
            general: "நீங்கள் குறிக்கோளை அடைவதில் உறுதியானவர். அதிக அறிவாற்றலும், தலைமைப் பண்பும் கொண்டவர். எதையும் திட்டமிட்டு நேர்த்தியாக செய்வீர்கள்.",
            career: "வங்கித் துறை, அரசியல், ஆலோசனை மையம், கல்வித்துறை மற்றும் பெரிய நிறுவனங்களில் தலைமைப் பதவிகளை வகிப்பீர்கள்.",
            health: "உடல் பருமன், கல்லீரல் கோளாறுகள் மற்றும் நீரிழிவு நோய்ப் பாதிப்புகளில் கவனம் தேவை.",
            compatibility: "திருவாதிரை, உத்திரம், சுவாதி, அனுஷம் மற்றும் உத்திரட்டாதி உகந்தவை."
        },
        {
            name: "அனுஷம்",
            general: "நீங்கள் சகிப்புத்தன்மை, அமைதி மற்றும் பொறுமை மிக்கவர். வெளிநாடு செல்லும் யோகம் கொண்டவர். நட்பிற்கு இலக்கணமானவர்.",
            career: "ஏற்றுமதி-இறக்குமதி, எண்ணெய் மற்றும் எரிவாயு துறை, தத்துவம், வெளிநாட்டுப் பணிகள் மற்றும் ஆராய்ச்சி ஏற்றவை.",
            health: "உடல் சோர்வு, பற்கள் மற்றும் எலும்பு வலி தொடர்பான பிரச்சனைகள் வரலாம்.",
            compatibility: "பரணி, புனர்பூசம், விசாகம், கேட்டை மற்றும் ரேவதி நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "கேட்டை",
            general: "நீங்கள் கூர்மையான அறிவும், தலைமை தாங்கும் திறனும் கொண்டவர். சுயமரியாதை அதிகம் உடையவர். மற்றவர்களின் எண்ணங்களை எளிதில் கணிப்பீர்கள்.",
            career: "இராணுவம், உளவுத் துறை, பத்திரிக்கை, சட்டம் மற்றும் அரசு உயர் பதவிகள் உங்களுக்கு எளிதில் கைக்கூடும்.",
            health: "அடிவயிறு பிரச்சனைகள், மூல நோய் மற்றும் நரம்புத் தளர்ச்சி ஆகியவற்றில் கவனம் தேவை.",
            compatibility: "அஸ்வினி, மகம், அனுஷம், மூலம் மற்றும் உத்திராடம் நட்சத்திரங்கள் இணக்கமானவை."
        },
        {
            name: "மூலம்",
            general: "நீங்கள் ஆன்மீக நாட்டம், ஆராய்ச்சி எண்ணம் மற்றும் பிடிவாதக் குணம் கொண்டவர். சுய உழைப்பால் முன்னேறுவீர்கள். கொள்கைவாதியாக இருப்பீர்கள்.",
            career: "தத்துவம், ஆன்மீகப் பணி, சட்டம், மூலிகை மருத்துவம் மற்றும் நீதித்துறை போன்றவற்றில் சாதனை படைப்பீர்கள்.",
            health: "இடுப்பு வலி, நரம்பு சுளுக்கு மற்றும் மூட்டுப் பிடிப்பு வரலாம்.",
            compatibility: "கேட்டை, பூராடம், திருவோணம் மற்றும் ரேவதி நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "பூராடம்",
            general: "நீங்கள் கலகலப்பானவர், எப்போதும் சுறுசுறுப்பானவர். கலைகளில் ஈடுபாடு, அழகான தோற்றம் கொண்டவர். வாக்குவாதங்களில் வெல்லும் திறன் படைத்தவர்.",
            career: "கலைத்துறை, ஆடை வடிவமைப்பு, சுற்றுலா, கப்பல் போக்குவரத்து மற்றும் விளம்பரத் துறைகளில் சாதிப்பீர்கள்.",
            health: "சிறுநீரகக் கோளாறுகள், சர்க்கரை மற்றும் கால்களில் வலிகள் வரலாம்.",
            compatibility: "கார்த்திகை, மூலம், உத்திராடம் மற்றும் பூரட்டாதி நட்சத்திரங்கள் உகந்தவை."
        },
        {
            name: "உத்திராடம்",
            general: "நீங்கள் அமைதியானவர், அனைவரிடமும் பழகும் குணம் கொண்டவர். பொறுமையும் விடாமுயற்சியும் உங்கள் பலம். எதிலும் நேர்மையை எதிர்பார்ப்பீர்கள்.",
            career: "அரசு நிர்வாகம், நிதித்துறை, நீதித்துறை, சமூகப் பணிகள் மற்றும் கற்பித்தல் பணிகளில் ஜொலிப்பீர்கள்.",
            health: "செரிமானம், கண் பார்வை மற்றும் தோல் வறட்சி போன்றவற்றில் அக்கறை காட்டவும்.",
            compatibility: "ரோகிணி, அஸ்தம், கேட்டை, பூராடம், திருவோணம் மற்றும் உத்திரட்டாதி பொருத்தமானவை."
        },
        {
            name: "திருவோணம்",
            general: "நீங்கள் அறிவாளி, ஒழுக்கம் மிக்கவர். பிறரை மதித்து நடப்பீர்கள். நல்ல பேச்சாளராகவும் ஆன்மீகத்தில் பற்றுடையவராகவும் இருப்பீர்கள்.",
            career: "கல்வித் துறை, ஊடகம், இசை, ஆன்மீகம், மக்கள் தொடர்பு மற்றும் அரசுப் பணிகளில் வெற்றி காண்பீர்கள்.",
            health: "காது வலி, தோல் வியாதிகள் மற்றும் வாயுப் பிடிப்புகளில் கவனம் செலுத்த வேண்டும்.",
            compatibility: "மிருகசீரிடம், மூலம், உத்திராடம், அவிட்டம் மற்றும் சதயம் நட்சத்திரங்கள் ஏற்றவை."
        },
        {
            name: "அவிட்டம்",
            general: "நீங்கள் தைரியமும், சுறுசுறுப்பும் கொண்டவர். கலை, இசையில் ஆர்வம் உடையவர். பிறருக்கு வாரி வழங்கும் வள்ளல் குணம் கொண்டவர்.",
            career: "பொறியியல், இசைத்துறை, நிலம் சார்ந்த தொழில்கள், காவல்துறை மற்றும் மேலாண்மைத் துறைகளில் பெரும் புகழுடன் வாழ்வீர்கள்.",
            health: "இரத்த சோகை, பற்கள் வலி மற்றும் கணுக்கால் உபாதைகள் ஏற்படலாம்.",
            compatibility: "ஆயில்யம், திருவோணம், சதயம் மற்றும் பூரட்டாதி நட்சத்திரங்கள் நல்ல பொருத்தம்."
        },
        {
            name: "சதயம்",
            general: "நீங்கள் ஆராய்ச்சி குணம் மற்றும் கூர்மையான அறிவு கொண்டவர். அமைதியானவர் ஆனால் எதையும் ஆழமாக சிந்தித்து முடிவெடுப்பீர்கள். ரகசியம் காப்பதில் வல்லவர்.",
            career: "விஞ்ஞானி, மருத்துவர், கணினி மென்பொருள், விண்வெளித் துறை மற்றும் ஜோதிடத் துறைகளில் சாதிக்கலாம்.",
            health: "இதயம், மூட்டு வலி மற்றும் ஒவ்வாமை தொடர்பான உபாதைகளில் விழிப்புடன் இருக்கவும்.",
            compatibility: "சித்திரை, திருவோணம், அவிட்டம், பூரட்டாதி மற்றும் ரேவதி நட்சத்திரங்கள் உகந்தவை."
        },
        {
            name: "பூரட்டாதி",
            general: "நீங்கள் நேர்மையும், கம்பீரமான பேச்சும் கொண்டவர். ஆன்மீகம் மற்றும் தத்துவத்தில் ஆர்வம் உடையவர். சுயக்கட்டுப்பாடு மிக்கவர்.",
            career: "ஆசிரியப் பணி, நிதித்துறை, சட்டம், மத போதகர் மற்றும் சமூக சேவைப் பணிகளில் பெரும் மதிப்பு பெறுவீர்கள்.",
            health: "கல்லீரல், கால்களில் நீர் வீக்கம் மற்றும் வயிற்றுப் போக்கு உபாதைகள் வரலாம்.",
            compatibility: "திருவாதிரை, சுவாதி, பூராடம், சதயம் மற்றும் உத்திரட்டாதி நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "உத்திரட்டாதி",
            general: "நீங்கள் அமைதி, பொறுமை மற்றும் கருணை உள்ளம் கொண்டவர். அனைவரையும் சமமாக நடத்துவீர்கள். குடும்பத்தின் மீது பற்று அதிகம் உடையவர்.",
            career: "எழுத்துத் துறை, நீதித்துறை, ஆன்மீகம், நதி நீர் திட்டங்கள் மற்றும் சமூக நலத் துறைகளில் வெற்றி காண்பீர்கள்.",
            health: "பாதங்களில் வலி, தூக்கமின்மை மற்றும் ஒவ்வாமை ஆகியவற்றில் கவனம் தேவை.",
            compatibility: "புனர்பூசம், விசாகம், உத்திராடம், பூரட்டாதி மற்றும் ரேவதி நட்சத்திரங்கள் பொருத்தமானவை."
        },
        {
            name: "ரேவதி",
            general: "நீங்கள் கனிவான பேச்சும், அழகான தோற்றமும் கொண்டவர். கலைகளில் தேர்ச்சி, ஆன்மீக பக்தி உடையவர். அனைவருக்கும் உதவும் நல்ல மனமுடையவர்.",
            career: "கலைத்துறை, ஜோதிடம், கல்வி, தூதரகப் பணிகள், வங்கித் துறை மற்றும் கடல் சார்ந்த வர்த்தகத்தில் சிறப்படைவீர்கள்.",
            health: "காது வலி, பாத வெடிப்புகள் மற்றும் செரிமானக் கோளாறுகளில் கவனம் செலுத்தவும்.",
            compatibility: "பூசம், அனுஷம், மூலம், சதயம், உத்திரட்டாதி நட்சத்திரங்கள் பொருத்தமானவை."
        }
    ],
    en: [
        {
            name: "Ashwini",
            general: "You are energetic, active, and quick in all actions. Possess a majestic look and a helpful nature. Always enthusiastic about starting new ventures.",
            career: "Excel in medicine, police, military, engineering, sports, and entrepreneurship.",
            health: "Watch out for headaches, nervous tension, and blood pressure issues.",
            compatibility: "Compatible with Bharani, Pushya, Hasta, and Jyeshtha."
        },
        {
            name: "Bharani",
            general: "You are determined, honest, and value-driven. Possess a great taste for arts and luxury. Independent thinker who makes bold decisions.",
            career: "Suited for creative arts, culinary fields, judiciary, management, and chemical industries.",
            health: "Take care of body heat, eye issues, and digestion.",
            compatibility: "Compatible with Ashwini, Krittika, Poorva Phalguni, and Anuradha."
        },
        {
            name: "Krittika",
            general: "You possess sharp intelligence, strong expression, and a combination of anger and affection. Analytical and truth-seeking.",
            career: "Excel in government services, politics, defense, metal trades, and teaching.",
            health: "Prone to fevers, throat pain, and minor facial injuries.",
            compatibility: "Compatible with Bharani, Rohini, Hasta, and Poorvashadha."
        },
        {
            name: "Rohini",
            general: "Possess polite speech, attractive appearance, and rich imagination. Highly creative and deeply attached to family.",
            career: "Arts, cinema, music, fashion design, agriculture, and public relations.",
            health: "Prone to colds, throat infections, and mental stress.",
            compatibility: "Compatible with Mrigashirsha, Punarvasu, Chitra, and Uttarashadha."
        },
        {
            name: "Mrigashirsha",
            general: "You are highly analytical, curious, and search for truth. Calm yet firm when needed. Love traveling and learning.",
            career: "Education, journalism, IT, real estate, and design industries.",
            health: "Watch out for shoulder pains, ear disorders, and allergies.",
            compatibility: "Compatible with Rohini, Ashlesha, Swati, and Shravana."
        },
        {
            name: "Ardra",
            general: "Capable of handling major challenges. Determined, sharp-witted, and can be stubborn at times.",
            career: "Research, software development, finance, diplomacy, and pharmaceuticals.",
            health: "Prone to skin allergies, nervous disorders, and respiratory issues.",
            compatibility: "Compatible with Mrigashirsha, Punarvasu, Vishakha, and Poorva Bhadrapada."
        },
        {
            name: "Punarvasu",
            general: "You are peaceful, compassionate, and spiritually inclined. Patient and always maintain a positive outlook.",
            career: "Teaching, banking, law, literature, and advisory/consultancy positions.",
            health: "Prone to lung sensitivity, stomach issues, and fatigue.",
            compatibility: "Compatible with Rohini, Pushya, Anuradha, and Uttara Bhadrapada."
        },
        {
            name: "Pushya",
            general: "Disciplined, dutiful, and possess leadership qualities. Achieve success through consistent hard work.",
            career: "Administration, judiciary, mining, education, and spiritual leadership.",
            health: "Prone to digestive disorders, chest congestion, and joint pains.",
            compatibility: "Compatible with Ashwini, Punarvasu, Ashlesha, and Revati."
        },
        {
            name: "Ashlesha",
            general: "Possess shrewd intelligence and powerful communication. Clever, strategic, and leadership comes naturally to you.",
            career: "Business, diplomacy, auditing, software architecture, and intelligence services.",
            health: "Pay attention to digestive and nervous systems.",
            compatibility: "Compatible with Mrigashirsha, Pushya, Magha, and Dhanishta."
        },
        {
            name: "Magha",
            general: "Majestic, generous, and respect traditions. Hold high self-respect and family pride.",
            career: "Politics, top executive management, judiciary, archaeology, and family business.",
            health: "Take care of heart health, spine, and eyesight.",
            compatibility: "Compatible with Bharani, Poorva Phalguni, Chitra, and Jyeshtha."
        },
        {
            name: "Poorva Phalguni",
            general: "Artistic, humorous, and charming talker. Value comfort and maintain a strong social circle.",
            career: "Entertainment, textile and jewelry trade, tourism, and lifestyle industries.",
            health: "Prone to blood circulation issues, diabetes, and kidney troubles.",
            compatibility: "Compatible with Magha, Uttara Phalguni, Swati, and Anuradha."
        },
        {
            name: "Uttara Phalguni",
            general: "Honest, reliable, patient, and systematic. Find joy in helping others and fulfilling duties.",
            career: "Government positions, management, education, social service, and finance.",
            health: "Prone to intestinal issues, backaches, and migraines.",
            compatibility: "Compatible with Krittika, Poorva Phalguni, Hasta, and Vishakha."
        },
        {
            name: "Hasta",
            general: "Active, cheerful, and witty. Possess excellent communication and craftsmanship skills.",
            career: "Trade, writing, astrology, handicrafts, sales, and diplomacy.",
            health: "Watch out for gastric issues, colds, and minor mental anxiety.",
            compatibility: "Compatible with Ashwini, Krittika, Chitra, and Uttarashadha."
        },
        {
            name: "Chitra",
            general: "Artistic, courageous, and love challenges. Possess an attractive personality and a sharp intellect.",
            career: "Engineering, architecture, jewelry design, police, and media.",
            health: "Prone to minor blood issues, kidney stones, and skin allergies.",
            compatibility: "Compatible with Rohini, Magha, Hasta, Swati, and Shatabhisha."
        },
        {
            name: "Swati",
            general: "Value freedom and honesty. Capture others with sweet speech and commit to justice.",
            career: "Legal services, general trade, transportation, arts, and spiritual teaching.",
            health: "Prone to joint pains, kidney health, and gastric troubles.",
            compatibility: "Compatible with Mrigashirsha, Poorva Phalguni, Chitra, Vishakha, and Poorva Bhadrapada."
        },
        {
            name: "Vishakha",
            general: "Goal-oriented, determined, and possess strong leadership qualities. Highly intellectual and systematic.",
            career: "Banking, politics, consultancy, academics, and executive leadership.",
            health: "Control weight, liver health, and blood sugar levels.",
            compatibility: "Compatible with Ardra, Uttara Phalguni, Swati, Anuradha, and Uttara Bhadrapada."
        },
        {
            name: "Anuradha",
            general: "Patient, peaceful, and cooperative. Enjoy traveling and have international success. True friend.",
            career: "Imports-exports, petroleum/energy sector, philosophy, foreign affairs, and research.",
            health: "Prone to bodily exhaustion, dental issues, and bone aches.",
            compatibility: "Compatible with Bharani, Punarvasu, Vishakha, Jyeshtha, and Revati."
        },
        {
            name: "Jyeshtha",
            general: "Sharp-witted, protective, and natural leaders. High self-esteem and good at analyzing people.",
            career: "Defense, intelligence, journalism, law, and high-level government administration.",
            health: "Prone to lower abdominal troubles, piles, and nervous exhaustion.",
            compatibility: "Compatible with Ashwini, Magha, Anuradha, Mula, and Uttarashadha."
        },
        {
            name: "Mula",
            general: "Spiritually inclined, investigative, and strong-willed. Achieve success through self-reliance.",
            career: "Philosophy, theology, law, herbal medicine, and judiciary.",
            health: "Prone to backaches, nerve sprains, and joint stiffness.",
            compatibility: "Compatible with Jyeshtha, Poorvashadha, Shravana, and Revati."
        },
        {
            name: "Poorvashadha",
            general: "Cheerful, active, and charming. Interested in arts and possess argumentative success.",
            career: "Creative arts, fashion, travel, shipping, and advertising.",
            health: "Watch out for bladder issues, diabetes, and leg pains.",
            compatibility: "Compatible with Krittika, Mula, Uttarashadha, and Poorva Bhadrapada."
        },
        {
            name: "Uttarashadha",
            general: "Calm, friendly, and systematic. Patience and persistence are your strengths. Expect honesty.",
            career: "Public administration, finance, judiciary, social work, and teaching.",
            health: "Take care of digestion, eyesight, and dry skin issues.",
            compatibility: "Compatible with Rohini, Hasta, Jyeshtha, Poorvashadha, Shravana, and Uttara Bhadrapada."
        },
        {
            name: "Shravana",
            general: "Intellectual, well-behaved, and respectful. Good speaker, spiritual, and value-driven.",
            career: "Education, media, music, religion, public relations, and government administration.",
            health: "Prone to ear issues, skin conditions, and gas problems.",
            compatibility: "Compatible with Mrigashirsha, Mula, Uttarashadha, Dhanishta, and Shatabhisha."
        },
        {
            name: "Dhanishta",
            general: "Courageous, active, and charitable. Interested in music and performing arts.",
            career: "Engineering, music, real estate, police, and executive management.",
            health: "Prone to anemia, dental pains, and ankle injuries.",
            compatibility: "Compatible with Ashlesha, Shravana, Shatabhisha, and Poorva Bhadrapada."
        },
        {
            name: "Shatabhisha",
            general: "Possess research abilities and deep intellect. Secretive, analytical, and reserved.",
            career: "Scientific research, medicine, software engineering, space research, and astrology.",
            health: "Take care of heart health, arthritis, and allergies.",
            compatibility: "Compatible with Chitra, Shravana, Dhanishta, Poorva Bhadrapada, and Revati."
        },
        {
            name: "Poorva Bhadrapada",
            general: "Honest, direct, and principled. Drawn to philosophy, spirituality, and self-control.",
            career: "Academics, finance, law, religious counseling, and social reforms.",
            health: "Prone to liver sensitivity, swollen legs, and stomach upsets.",
            compatibility: "Compatible with Ardra, Swati, Poorvashadha, Shatabhisha, and Uttara Bhadrapada."
        },
        {
            name: "Uttara Bhadrapada",
            general: "Calm, patient, and highly compassionate. Treat everyone equally. Attached to home and family.",
            career: "Literature, judiciary, spirituality, water-management projects, and social welfare.",
            health: "Prone to foot pain, insomnia, and cold allergies.",
            compatibility: "Compatible with Punarvasu, Vishakha, Uttarashadha, Poorva Bhadrapada, and Revati."
        },
        {
            name: "Revati",
            general: "Polite, attractive, and artistic. Possess deep faith and love helping others.",
            career: "Fine arts, astrology, education, diplomacy, banking, and maritime trade.",
            health: "Prone to earaches, feet issues, and sluggish digestion.",
            compatibility: "Compatible with Pushya, Anuradha, Mula, Shatabhisha, and Uttara Bhadrapada."
        }
    ]
};

export function getPredictions(starIndex, lang) {
    const list = starData[lang] || starData['en'];
    return list[starIndex] || list[0];
}
