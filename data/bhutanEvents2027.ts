import type { FestivalEvent } from './bhutanEvents2026';

// Tentative dates — Bhutanese festivals follow the lunar calendar and shift
// slightly year to year; confirm exact dates closer to travel. Sourced from
// Druk Asia, Breathe Bhutan and CalendarLabs 2027 festival/holiday listings.
// Trongsa Tshechu falls in early Jan 2028 this lunar cycle, so it has no
// date within calendar-year 2027.

export const allEvents2027: FestivalEvent[] = [

  // ── FESTIVALS ─────────────────────────────────────────────────────────────

  { id: 'punakha-drubchen',    title: 'Punakha Drubchen',           location: 'Punakha Dzong',                    type: 'festival', start: '2027-02-13', end: '2027-02-15', color: '#3B82F6',
    description: "A dramatic re-enactment of the 17th-century battle in which Bhutanese forces repelled Tibetan invaders, performed by local militia in traditional armour at Punakha Dzong." },
  { id: 'punakha-tshechu',     title: 'Punakha Tshechu',            location: 'Punakha Dzong',                    type: 'festival', start: '2027-02-16', end: '2027-02-18', color: '#3B82F6',
    description: "One of Bhutan's most colourful Tshechus, held in the mild winter climate of the Punakha valley, with sacred mask dances and the unfurling of a giant Thongdrel depicting Zhabdrung Ngawang Namgyal." },
  { id: 'chhorten-kora-1',     title: 'Chhorten Kora Festival',     location: 'Trashiyangtse',                    type: 'festival', start: '2027-02-20', end: '2027-02-20', color: '#E11D48',
    description: "Pilgrims and devotees, including Dakpa people from across the Indian border, circumambulate the sacred Chorten Kora stupa in Trashiyangtse to earn merit." },
  { id: 'chhorten-kora-2',     title: 'Chhorten Kora Festival',     location: 'Trashiyangtse',                    type: 'festival', start: '2027-03-08', end: '2027-03-08', color: '#E11D48',
    description: "The second, larger day of the Chorten Kora pilgrimage, drawing crowds from eastern Bhutan and neighbouring Arunachal Pradesh for all-night circumambulation of the stupa." },
  { id: 'paro-tshechu',        title: 'Paro Tshechu',               location: 'Rinpung Dzong, Paro',              type: 'festival', start: '2027-03-18', end: '2027-03-22', color: '#D97706',
    description: "Bhutan's most famous festival, held in the courtyard of Rinpung Dzong. The final morning brings the pre-dawn unfurling of the giant Guru Thongdrel, said to cleanse the sins of all who see it." },
  { id: 'rhododendron',        title: 'Rhododendron Festival',      location: 'Lamperi Botanical Park, Thimphu',  type: 'festival', start: '2027-04-22', end: '2027-04-23', color: '#E11D48',
    description: "A celebration of Bhutan's national flower at Lamperi Botanical Park, with guided nature walks through blooming rhododendron forest, food stalls, and cultural performances." },
  { id: 'ura-yakchoe',         title: 'Ura Yakchoe',                location: 'Ura Lhakhang, Bumthang',           type: 'festival', start: '2027-04-18', end: '2027-04-22', color: '#0D9488',
    description: "A five-day festival unique to the Ura valley in Bumthang, centred on the display of a sacred relic, accompanied by folk dances performed by local villagers in traditional dress." },
  { id: 'nimalung-tshechu',    title: 'Nimalung Tshechu',           location: 'Nimalung Dratshang, Bumthang',     type: 'festival', start: '2027-06-12', end: '2027-06-14', color: '#0D9488',
    description: "A three-day Tshechu at Nimalung Dratshang monastery in Bumthang, with mask dances performed by resident monks and the unveiling of a large Thongdrel on the final day." },
  { id: 'kurjey-tshechu',      title: 'Kurjey Tshechu',             location: 'Kurjey Lhakhang, Bumthang',        type: 'festival', start: '2027-06-14', end: '2027-06-14', color: '#10B981',
    description: "A one-day festival at Kurjey Lhakhang, one of Bhutan's most sacred temples, marking Guru Rinpoche's visit with mask dances performed by local villagers." },
  { id: 'thimphu-drubchen',    title: 'Thimphu Drubchen',           location: 'Tashichho Dzong, Thimphu',         type: 'festival', start: '2027-10-05', end: '2027-10-05', color: '#7C3AED',
    description: "The ceremonial prelude to Thimphu Tshechu, featuring Dromche ritual dances performed by monks at Tashichho Dzong to invoke protective deities." },
  { id: 'wangdue-tshechu',     title: 'Wangdue Tshechu',            location: 'Wangduephodrang',                  type: 'festival', start: '2027-10-08', end: '2027-10-10', color: '#6366F1',
    description: "A three-day masked-dance festival held within Wangdue Phodrang Dzong, honouring the teachings of Guru Rinpoche." },
  { id: 'thimphu-tshechu',     title: 'Thimphu Tshechu',            location: 'Tashichho Dzong, Thimphu',         type: 'festival', start: '2027-10-10', end: '2027-10-12', color: '#7C3AED',
    description: "Bhutan's largest and most attended Tshechu, held since 1670 in the courtyard of Tashichho Dzong, with elaborate mask dances performed before thousands of spectators." },
  { id: 'gangtey-tshechu',     title: 'Gangtey Tshechu',            location: 'Gangtey Gonpa, Phobjikha',         type: 'festival', start: '2027-10-13', end: '2027-10-15', color: '#0EA5E9',
    description: "A festival performed by lay monks (gomchen) rather than monastic dancers, held at Gangtey Gonpa overlooking the glacial Phobjikha valley." },
  { id: 'royal-highland',      title: 'Royal Highland Festival',    location: 'Laya, Gasa',                       type: 'festival', start: '2027-10-23', end: '2027-10-24', color: '#E11D48',
    description: "Held at nearly 4,000m in the remote village of Laya, this festival celebrates highlander life with yak dances, archery, and horse races among the Layap and Lunana communities." },
  { id: 'jambay-lhakhang',     title: 'Jambay Lhakhang Drup',       location: 'Jambay Lhakhang, Bumthang',        type: 'festival', start: '2027-11-14', end: '2027-11-17', color: '#0D9488',
    description: "Centred on one of Bhutan's oldest temples, the highlight is the Mewang fire-blessing ceremony and the midnight Tercham 'naked dance', believed to bless women seeking children." },
  { id: 'black-necked-crane',  title: 'Black-Necked Crane Festival',location: 'Phobjikha Valley',                 type: 'festival', start: '2027-11-11', end: '2027-11-11', color: '#0EA5E9',
    description: "A one-day festival in the Phobjikha valley celebrating the arrival of endangered black-necked cranes that winter there, with crane-themed masked dances performed by local schoolchildren." },
  { id: 'mongar-tshechu',      title: 'Mongar Tshechu',             location: 'Mongar Dzong',                     type: 'festival', start: '2027-12-06', end: '2027-12-08', color: '#EA580C',
    description: "A three-day eastern Bhutan Tshechu at Mongar Dzong featuring sacred mask dances and closing with the unveiling of a large Thongdrel." },
  { id: 'trashigang-tshechu',  title: 'Trashigang Tshechu',         location: 'Trashigang Dzong',                 type: 'festival', start: '2027-12-07', end: '2027-12-09', color: '#EA580C',
    description: "An eastern Bhutan Tshechu at Trashigang Dzong that draws highlanders from Merak and Sakten in their distinctive yak-hair clothing." },
  { id: 'druk-wangyel',        title: 'Druk Wangyel Tshechu',       location: 'Dochula Pass',                     type: 'festival', start: '2027-12-13', end: '2027-12-13', color: '#E11D48',
    description: "A modern Tshechu performed by Royal Bhutan Army soldiers rather than monks, held at the 108-chorten Dochula Pass to commemorate Bhutan's 2003 military operation against insurgent camps." },

  // ── PUBLIC HOLIDAYS ───────────────────────────────────────────────────────

  { id: 'nyilo',               title: 'Winter Solstice (Nyilo)',            location: '', type: 'holiday', start: '2027-01-02', end: '2027-01-02', color: '#16A34A',
    description: "Marks the winter solstice per the ancient Bumthang calendar, traditionally the day early forms of Buddhism are said to have been introduced to Bhutan." },
  { id: 'offerings-day',       title: 'Traditional Day of Offerings',       location: '', type: 'holiday', start: '2027-01-08', end: '2027-01-08', color: '#16A34A',
    description: "A day of ritual offerings and prayers observed nationwide to accumulate merit and mark the changing season." },
  { id: 'losar',               title: 'Losar (Bhutanese New Year)',          location: '', type: 'holiday', start: '2027-02-07', end: '2027-02-08', color: '#16A34A',
    description: "Bhutanese New Year, celebrated with family gatherings, archery matches, prayer ceremonies, and traditional feasting across the country." },
  { id: 'king-birthday',       title: "HM The King's Birthday",              location: '', type: 'holiday', start: '2027-02-21', end: '2027-02-23', color: '#16A34A',
    description: "A national holiday celebrating the birthday of His Majesty the King of Bhutan, marked with flag-raising ceremonies and cultural events." },
  { id: 'zhabdrung',           title: 'Zhabdrung Kuchoe',                   location: '', type: 'holiday', start: '2027-04-16', end: '2027-04-16', color: '#16A34A',
    description: "Commemorates the death anniversary of Zhabdrung Ngawang Namgyal, the 17th-century founder and unifier of Bhutan, with special prayers held in temples nationwide." },
  { id: '3rd-king',            title: 'Birth Anniversary of 3rd King',       location: '', type: 'holiday', start: '2027-05-02', end: '2027-05-02', color: '#16A34A',
    description: "Marks the birth anniversary of His Late Majesty Jigme Dorji Wangchuck, the 'Father of Modern Bhutan', who initiated the country's modernization." },
  { id: 'saga-dawa',           title: 'Saga Dawa — Buddha Parinirvana',      location: '', type: 'holiday', start: '2027-05-20', end: '2027-05-20', color: '#16A34A',
    description: "The holiest day of the Buddhist calendar, marking the birth, enlightenment, and parinirvana of Buddha; devotees spend the day in prayer, pilgrimage, and merit-making." },
  { id: 'guru-rinpoche',       title: 'Guru Rinpoche Birthday',              location: '', type: 'holiday', start: '2027-06-13', end: '2027-06-13', color: '#16A34A',
    description: "Celebrates the birthday of Guru Padmasambhava, who introduced Vajrayana Buddhism to Bhutan in the 8th century, observed with prayers at temples and monasteries." },
  { id: 'first-sermon',        title: 'First Sermon of Lord Buddha',         location: '', type: 'holiday', start: '2027-08-06', end: '2027-08-06', color: '#16A34A',
    description: "Commemorates Buddha's first teaching at Sarnath after attaining enlightenment, observed nationwide with prayers and monastic ceremonies." },
  { id: 'blessed-rainy',       title: 'Blessed Rainy Day',                   location: '', type: 'holiday', start: '2027-09-23', end: '2027-09-23', color: '#16A34A',
    description: "A traditional holiday marking the end of the monsoon season, when Bhutanese bathe in rivers and streams believed to carry cleansing, blessed water on this day." },
  { id: 'dashain',             title: 'Dashain',                             location: '', type: 'holiday', start: '2027-10-10', end: '2027-10-10', color: '#16A34A',
    description: "A major Hindu festival celebrated mainly by Bhutan's Lhotshampa community in southern Bhutan, honouring the goddess Durga's victory over evil." },
  { id: 'coronation',          title: 'Coronation Day',                      location: '', type: 'holiday', start: '2027-11-01', end: '2027-11-01', color: '#16A34A',
    description: "Marks the coronation of His Majesty King Jigme Khesar Namgyel Wangchuck in 2008." },
  { id: '4th-king',            title: "4th King's Birthday / GNH Day",       location: '', type: 'holiday', start: '2027-11-11', end: '2027-11-11', color: '#16A34A',
    description: "A double celebration marking the birthday of His Majesty the Fourth King, Jigme Singye Wangchuck, architect of Gross National Happiness, and National GNH Day." },
  { id: 'lhabab-duchen',       title: 'Descending Day of Lord Buddha',       location: '', type: 'holiday', start: '2027-11-20', end: '2027-11-20', color: '#16A34A',
    description: "Lhabab Duchen, the Buddhist observance of Buddha's descent from the Tushita heaven back to earth, one of the four great deeds of the Buddha's life." },
  { id: 'national-day',        title: 'National Day of Bhutan',              location: '', type: 'holiday', start: '2027-12-17', end: '2027-12-17', color: '#16A34A',
    description: "Bhutan's National Day, commemorating the coronation of the first hereditary king, Ugyen Wangchuck, in 1907, celebrated nationwide with parades and cultural performances." },
];
