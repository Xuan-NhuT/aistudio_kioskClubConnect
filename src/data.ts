import { Student, Club, CampusBuilding, CampusEvent, CheckIn } from "./types";

export const SAMPLE_STUDENTS: { [netId: string]: Student } = {
  sarahw: {
    netId: "sarahw",
    name: "Sarah Wang",
    email: "sarahw@uw.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sarahw",
    interests: ["Robotics", "Hiking", "Machine Learning", "3D Printing", "Specialty Coffee"],
    classes: ["CSE 311 - Foundations", "CSE 351 - Hardware/Software Interface", "MATH 126 - Calculus III", "AES 150 - Asian Amer History"],
    bio: "Sophomore in CS. Love tinkering with Arduino and finding the best espresso on Ave. Let's study for midterm together!"
  },
  alexc: {
    netId: "alexc",
    name: "Alex Chen",
    email: "alexc@uw.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alexc",
    interests: ["Robotics", "Game Development", "Cybersecurity", "Board Games"],
    classes: ["CSE 143 - Computer Programming II", "PHYS 121 - Mechanics", "DRAMA 101 - Intro to Theater"],
    bio: "Freshman exploring Engineering. Always down to discuss sci-fi movies, rogue-like game design, or play Catan!"
  },
  elenar: {
    netId: "elenar",
    name: "Elena Rostova",
    email: "elenar@uw.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=elenar",
    interests: ["Hiking", "Photography", "Sustainability", "Rock Climbing"],
    classes: ["BIOL 180 - Introductory Biology", "CHEM 142 - General Chemistry", "ENVIR 100 - Environmental Studies"],
    bio: "Junior majoring in Environmental Science. Capturing PNW landscapes on film. Hit me up if you want to climb at IMA!"
  },
  marcusv: {
    netId: "marcusv",
    name: "Marcus Vance",
    email: "marcusv@uw.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcusv",
    interests: ["Boba Tea", "Acapella", "Product Management", "Web Design"],
    classes: ["INFO 200 - Intellectual Foundations", "INFO 290 - Interactive Design", "ECON 200 - Microeconomics"],
    bio: "Sophomore in Informatics. Directing a campus acapella group. Passionate about beautiful UI, accessible design, and jasmine milk tea."
  },
  chloep: {
    netId: "chloep",
    name: "Chloe Patel",
    email: "chloep@uw.edu",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chloep",
    interests: ["Machine Learning", "Hackathons", "Boba Tea", "Acapella", "UI/UX Design"],
    classes: ["CSE 446 - Machine Learning", "STAT 391 - Probability and Stats", "CSE 332 - Data Structures"],
    bio: "Senior in CS. Preparing for full-stack industry roles. Coffee addict, hackathon organizer, and amateur cook."
  }
};

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "HUB",
    name: "Husky Union Building",
    shortName: "HUB",
    x: 62,
    y: 48,
    description: "The heart of student life, featuring dining, study lounges, gameroom, and club headquarters."
  },
  {
    id: "ODG",
    name: "Odegaard Undergraduate Library",
    shortName: "Odegaard Library",
    x: 40,
    y: 38,
    description: "The active 24/7 learning center with flexible study spaces, technology checkout, and a coffee kiosk."
  },
  {
    id: "SUZ",
    name: "Suzzallo Library",
    shortName: "Suzzallo Library",
    x: 42,
    y: 52,
    description: "Iconic gothic library hosting the legendary quiet Graduate Reading Room and Starbucks."
  },
  {
    id: "CSE",
    name: "Paul G. Allen Center (CSE)",
    shortName: "Allen CSE",
    x: 75,
    y: 60,
    description: "State-of-the-art labs, interaction spaces, and collaboration zones for Computer Science & Engineering."
  },
  {
    id: "PAR",
    name: "PACCAR Hall",
    shortName: "PACCAR Hall",
    x: 35,
    y: 22,
    description: "Foster School of Business flagship building featuring a soaring glass atrium and Orin's Place Café."
  },
  {
    id: "KAN",
    name: "Kane Hall",
    shortName: "Kane Hall",
    x: 46,
    y: 32,
    description: "Facing Red Square, it holds the largest campus lecture chambers and audiovisual archives."
  },
  {
    id: "MGH",
    name: "Mary Gates Hall",
    shortName: "Mary Gates Hall",
    x: 52,
    y: 42,
    description: "Home of undergraduate education, career pathways, advising, and modern multi-purpose study lounges."
  },
  {
    id: "IMA",
    name: "Intramural Activities Building",
    shortName: "IMA Gym",
    x: 88,
    y: 35,
    description: "Massive campus sports facility with weight rooms, racquetball courts, a pool, and climbing walls."
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: "husky-robotics",
    name: "Husky Robotics Club",
    description: "Designing, building, and programing next-gen Mars Rovers for the University Rover Challenge.",
    longDescription: "We are an interdisciplinary team of engineers, developers, and designers working on realistic robotic rovers. Members get hands-on experience in ROS, printed circuit boards, CNC milling, and complex field deployments. We compete annually in Utah!",
    category: "Engineering & Tech",
    logo: "🤖",
    memberCount: 42,
    members: ["sarahw", "alexc", "chloep"],
    meetingTime: "Thursdays, 6:00 PM - 8:00 PM",
    meetingLocation: "Allen CSE Building, Room 003 (Rover Cave)"
  },
  {
    id: "cse-association",
    name: "CSE Association (CS Club)",
    description: "The primary computer science and tech community group for majors and enthusiasts alike.",
    longDescription: "The Computer Science & Engineering Association bridges coursework with real-world community. We host hardware tear-downs, study nights with unlimited pizza, technical resume reviews, and quarterly hack nights. All skill levels welcome!",
    category: "Science & Math",
    logo: "💻",
    memberCount: 156,
    members: ["sarahw", "chloep", "alexc", "marcusv"],
    meetingTime: "Tuesdays, 5:30 PM - 7:00 PM",
    meetingLocation: "Mary Gates Hall, Room 389"
  },
  {
    id: "husky-hiking",
    name: "Huskies Hiking & Outdoors",
    description: "Explore the incredible beauty of the Pacific Northwest and the Cascade Range with friendly students.",
    longDescription: "UW's primary community for nature lovers. We coordinate weekend carpools for hikes ranging from beautiful easy trail walks to challenging peak summits. We provide gear rentals, hiking tips, and PNW ecology discussions.",
    category: "Sports & Recreation",
    logo: "🏔️",
    memberCount: 84,
    members: ["sarahw", "elenar"],
    meetingTime: "Mondays, 5:00 PM - 6:00 PM",
    meetingLocation: "Husky Union Building (HUB), Room 114"
  },
  {
    id: "boba-lovers",
    name: "Boba Tea Enthusiasts",
    description: "Dedicated to tasting, reviewing, and brewing the finest boba tea drinks around the Seattle U-District.",
    longDescription: "We explore the diverse boba spots on the Ave, host home-brewing tapioca workshops, and vote on the quarterly rankings of Seattle bubble tea shops. It's a sweet community to hang out and relieve work study stress!",
    category: "Social & Food",
    logo: "🧋",
    memberCount: 110,
    members: ["alexc", "marcusv", "chloep"],
    meetingTime: "Wednesdays, 4:00 PM - 5:00 PM",
    meetingLocation: "Husky Union Building (HUB) Food Court"
  },
  {
    id: "game-dev-club",
    name: "UW Game Dev Club",
    description: "Design games, build prototypes, and connect with local Seattle game studios and developers.",
    longDescription: "UW Game Dev Club brings together programmers, musicians, environmental artists, writers, and designers. We host annual game jams, retro gaming nights, and showcase projects to professional indie studios here in the Pacific Northwest.",
    category: "Art & Media",
    logo: "🎮",
    memberCount: 64,
    members: ["alexc", "marcusv"],
    meetingTime: "Fridays, 4:30 PM - 6:00 PM",
    meetingLocation: "Odegaard Library (ODG), Room 220"
  },
  {
    id: "dubs-fan-club",
    name: "Dubs Fan Club",
    description: "Appreciating and spreading joy for Dubs II, the official live Alaskan Malamute mascot of the Huskies.",
    longDescription: "The ultimate fan club for the goodest boy on campus. We coordinate puppy-socialization breaks, cheer at athletic games, design unofficial mascot merchandise, and share custom husky stickers. Dubs occasionally visits our meetings!",
    category: "Community Service",
    logo: "🐾",
    memberCount: 220,
    members: ["elenar", "marcusv"],
    meetingTime: "Tuesdays, 12:30 PM - 1:15 PM",
    meetingLocation: "Red Square (in front of Suzzallo)"
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "evt-robotics-bbq",
    title: "Rover Demo & Red Square BBQ",
    description: "See our newly completed prototype rover navigate Red Square with robot obstacle avoidance!",
    longDescription: "The Husky Robotics team is hosting an outdoor live demonstration! Watch our 6-wheeled rocker-bogie suspension system drive across Red Square, climb stairs, and perform robotic arm manipulation tasks. Plus, free hamburgers, veggie burgers, and cold drinks!",
    time: "4:30 PM - 6:30 PM (Today)",
    locationId: "KAN", // Kane Hall / Red Square
    clubId: "husky-robotics",
    attendees: ["sarahw", "alexc", "chloep"],
    coverImage: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=400",
    tag: "Live Demo"
  },
  {
    id: "evt-cs-hacknight",
    title: "Spring Hack-Night & Stickers Swap",
    description: "Come build mini-projects, test APIs, swap custom laptop stickers, and enjoy unlimited pagliacci pizza.",
    longDescription: "Join the CSE Association for our quarterly Hack-Night. Bring your laptop and your active side projects, or form a team on-the-spot to compete for the 'Most Over-Engineered App' prize. We supply power strips, boards, custom-designed UW coding stickers, and drinks!",
    time: "6:00 PM - 9:00 PM (Today)",
    locationId: "ODG", // Odegaard Library
    clubId: "cse-association",
    attendees: ["sarahw", "chloep", "marcusv"],
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400",
    tag: "Social"
  },
  {
    id: "evt-hiking-cascades",
    title: "Cascades Day Hike Information Session",
    description: "Essential briefing for this Saturday's carpool hike to Mt. Si and Cascade foothills peaks.",
    longDescription: "Planning to go hiking this weekend? Join us to learn about trail gear, packing the ten essentials, carpool coordination, and trail safety. We welcome novice hikers! We will assign riders to drivers during this interactive planning session.",
    time: "5:00 PM - 6:00 PM (Today)",
    locationId: "HUB", // Husky Union Building (HUB)
    clubId: "husky-hiking",
    attendees: ["sarahw", "elenar"],
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400",
    tag: "Coordinating"
  },
  {
    id: "evt-boba-workshop",
    title: "Tapioca Pearls Cooking & Tasting",
    description: "Learn how to brew premium brown sugar boba tea at home and blind-taste the U-District's cafes.",
    longDescription: "The Boba Tea Enthusiasts are taking over! Discover the biology and science of tapioca starch hydration. We will simmer brown sugar syrup, whip up sea salt cheese foam, brew rich Assam black tea, and conduct a blind sip-test of 5 local bubble tea vendors to rank them.",
    time: "3:00 PM - 4:30 PM (Today)",
    locationId: "HUB", // Husky Union Building
    clubId: "boba-lovers",
    attendees: ["alexc", "marcusv", "chloep"],
    coverImage: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
    tag: "Workshop"
  }
];

export const INITIAL_CHECKINS: CheckIn[] = [
  {
    id: "chk-1",
    netId: "alexc",
    studentName: "Alex Chen",
    studentEmail: "alexc@uw.edu",
    studentAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alexc",
    clubName: "Husky Robotics Club",
    locationId: "CSE",
    timeFrom: "17:30",
    stayDuration: "3 hours",
    note: "Reviewing rover chassis CAD at the CSE library workspace. Come look at 3D renderings!",
    checkedInAt: new Date(Date.now() - 40 * 60 * 1000)
  },
  {
    id: "chk-2",
    netId: "chloep",
    studentName: "Chloe Patel",
    studentEmail: "chloep@uw.edu",
    studentAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=chloep",
    clubName: "CSE Association (CS Club)",
    locationId: "ODG",
    timeFrom: "18:00",
    stayDuration: "2 hours",
    note: "Grabbing coffee in Odegaard cafe before the Spring Hack-Night starts. Sitting near the tall tables!",
    checkedInAt: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: "chk-3",
    netId: "elenar",
    studentName: "Elena Rostova",
    studentEmail: "elenar@uw.edu",
    studentAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=elenar",
    clubName: "Huskies Hiking & Outdoors",
    locationId: "HUB",
    timeFrom: "17:45",
    stayDuration: "1 hour",
    note: "Hanging in the HUB lounge near the fire place. Prepping the Cascade Map presentation.",
    checkedInAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "chk-4",
    netId: "marcusv",
    studentName: "Marcus Vance",
    studentEmail: "marcusv@uw.edu",
    studentAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcusv",
    clubName: "Boba Tea Enthusiasts",
    locationId: "HUB",
    timeFrom: "18:00",
    stayDuration: "1.5 hours",
    note: "HUB Gameroom! Practicing acapella scales on headphones, down for a quick break.",
    checkedInAt: new Date(Date.now() - 10 * 60 * 1000)
  }
];
