// Public detail-page checks are not evidence of account access or a licensed download.
const candidate = (id, slug, title, credit, collection, releaseInfo, stems) => ({
  id, source: `https://www.gettyimages.com/detail/photo/${slug}-royalty-free-image/${id}`,
  title, credit, collection, releaseInfo, stems: stems.split(";"),
  checkedOn: "2026-10-24", family: "Creative", licenseType: "Royalty-free",
  editorialOnlyNoticeObserved: false, downloadStatus: "Completed download evidence and independent file verification: images-getty/provenance.json",
});

export const candidates = [
  candidate("1321502100", "bedroom-at-night-illuminated-by-electric-lamp-with", "Blue-walled bedroom at night", "Edwin Tan", "E+", "Property released", "boutique-hotel-room-1"),
  candidate("1795754166", "king-size-hotel-bedroom", "King-size hotel bedroom", "Kenishirotie", "iStock / Getty Images Plus", "No release required", "boutique-hotel-room-2;hotel-room-2;apartment-interior-2"),
  candidate("1453121684", "modern-hotel-room-with-double-bed-night-tables-and", "Hotel bedroom with double bed and day sofa", "Edwin Tan", "E+", "Property released", "boutique-hotel-room-3;hotel-room-1;apartment-interior-1"),
  candidate("1365312403", "luxury-classic-interior-lounge-lobby-reception-with", "Classic lounge with leather sofa and bookshelves", "Edwin Tan", "E+", "Property released", "hotel-lobby-luxury;luxury-hotel-2"),
  candidate("1392723392", "building-architecture-with-yellow-fa%C3%A7ade-in-lisbon", "Yellow residential facade in Lisbon", "Artur Debat", "Moment", "No release required", "luxury-hotel-1;apartment-interior-3"),
  candidate("588286104", "bunk-beds-in-room", "Bunk beds in a room", "Glasshouse Images", "The Image Bank", "No release required", "backpacker-hostel-2;backpacker-hostel-4"),
  candidate("1045047954", "young-backpackers-in-hostel", "Young backpackers in a hostel", "vgajic", "E+", "Model and property released", "backpacker-hostel-1;backpacker-hostel-3"),
  candidate("2206023257", "sunny-streets-of-alfama-lisbon-portugal", "Sunny streets of Alfama, Lisbon", "Alexander Spatari", "Moment", "No release required", "alfama-street-1;alfama-street-3"),
  candidate("2194079200", "street-with-tile-decorated-residential-houses-in", "Tile-decorated houses in Alfama, Lisbon", "Alexander Spatari", "Moment", "No release required", "shopping-street-boutique"),
  candidate("520670710", "portugal-lisbon-25-april-bridge-on-the-tagus-river", "25 April Bridge over the Tagus, Lisbon", "Tuul & Bruno Morandi", "The Image Bank", "No release required", "bridge-river-aerial"),
  candidate("1455011765", "traditional-portuguese-pastry-on-window-shop", "Traditional Portuguese pastries in a shop window", "Carol Yepes", "Moment", "No release required", "bakery-pastries-display;bakery-pastry;pastel-de-nata"),
  candidate("527640900", "waitress-selecting-loaf-of-bread", "Bakery worker selecting a loaf of bread", "Helen King", "The Image Bank", "Model and property released", "bread-bakery"),
  candidate("1125725514", "the-it-place", "Modern restaurant interior", "SrdjanPav", "E+", "Property released", "restaurant-interior"),
  candidate("1257163921", "chairs-and-tables-in-a-closed-restaurant", "Chairs and tables in a closed Lisbon restaurant", "Bloomberg Creative", "Bloomberg Creative Photos", "No release required", "coffee-shop-interior"),
  candidate("200372075-001", "portugal-lisbon-st-catarina-outdoor-cafe", "Outdoor cafe in Santa Catarina, Lisbon", "Rick Lew", "Photodisc", "No release required", "outdoor-cafe-terrace"),
  candidate("1354751821", "ribeira-market-fruit-vegetables", "Fruit and vegetables at Ribeira Market, Lisbon", "Image by Ramesh Thadani", "Moment", "No release required", "market-food-stalls;farmers-market-produce;market-food"),
  candidate("137737392", "chef-preparing-dish-in-kitchen", "Chef preparing a dish in a kitchen", "Photo_Concepts", "Connect Images", "Model and property released", "restaurant-plating-fine-dining"),
  candidate("1124710877", "fado-musician-playing-on-unique-portuguese-guitar", "Fado musician playing Portuguese guitar in Alfama", "Jacek Sopotnicki", "imageBROKER", "Model released", "fado-guitar-player;fado-music;live-music-venue-night"),
  candidate("2220476619", "portuguese-guitar-a-plucked-string-instrument-with", "Portuguese twelve-string guitar", "Javier Ghersi", "Moment", "No release required", "fado-music-2"),
  candidate("483495210", "concert-crowd", "Cheering concert audience", "egon69", "E+", "No release required", "concert-crowd-silhouette"),
  candidate("1182278389", "lisbon-festival-decorations", "Lisbon street festival decorations", "Luis Dafos", "Moment", "No release required", "street-festival-lights"),
  candidate("2226481345", "grilled-sardines-being-served-at-a-lively-street", "Sardines at a Santos Populares street festival, Lisbon", "Kvach Hanna", "iStock / Getty Images Plus", "No release required", "night-market-stalls"),
  candidate("1426540586", "tourists-enjoying-the-european-summer", "Family visiting Belem Tower, Lisbon", "MesquitaFMS", "E+", "Model released", "family-walking-city;family-travel"),
  candidate("1489193662", "happy-children-swinging-in-the-park", "Children on swings in a park", "MelkiNimages", "E+", "Model released", "children-playground-park"),
  candidate("1227552766", "summer-holidays-are-happy-days", "Family spending a day at the beach", "pixdeluxe", "E+", "Model released", "family-beach-vacation"),
  candidate("2156783104", "woman-relishing-the-view-of-lisbons-alfama-district", "Woman looking over Lisbon's Alfama district", "Mystockimages", "E+", "Model released", "woman-traveling-alone-city;solo-traveler"),
  candidate("1450789031", "young-african-woman-working-on-laptop-at-office", "Woman working on a laptop in an office cafe", "alvarez", "E+", "Model and property released", "digital-nomad-laptop-cafe;digital-nomad;remote-work-laptop"),
  candidate("2081127070", "group-of-diverse-businesspeople-working-in-a-busy", "People working in an open-plan office", "Goodboy Picture Company", "E+", "Model and property released", "coworking-space"),
  candidate("1495954819", "woman-enjoying-art-in-gallery", "Woman looking at paintings in an art gallery", "Pressmaster", "iStock / Getty Images Plus", "Model and property released", "art-gallery-painting"),
  candidate("114208719", "portugal-lisbon-underground-train-into-station", "Underground train entering a Lisbon station", "Vincenzo Lombardo", "Photographer's Choice RF", "No release required", "metro;lisbon-metro"),
  candidate("1578532135", "belem-tower-at-sunset-lisbon-portugal", "Belem Tower at sunset, Lisbon", "Marco Bottigelli", "Moment", "No release required", "belem-tower;belem"),
  candidate("997451208", "palacio-da-pena-sintra-portugal", "Pena Palace in Sintra, Portugal", "Carol Yepes", "Moment", "No release required", "sintra-palace;castle-sintra-portugal;sintra"),
  candidate("1680780214", "drone-view-of-beach-cascais-portugal", "Aerial view of a Cascais beach", "CHUNYIP WONG", "E+", "No release required", "cascais-beach"),
  candidate("1267635029", "surfer-woman-runs-on-the-beach-at-sunrise-ready-for", "Woman carrying a surfboard on a Portuguese beach", "Mystockimages", "E+", "Model released", "surfing-lesson-beach-1;surfing-lesson-beach-3"),
  candidate("2190480336", "woman-lying-on-a-surfboard-with-her-male-coach", "Surf coach beside a woman on a surfboard", "bernardbodo", "iStock / Getty Images Plus", "Model released", "surfing-lesson-beach-2;surfing-lesson-beach-6"),
  candidate("519622494", "capturing-a-beautiful-view", "Photographer taking pictures from a mountain", "pixdeluxe", "E+", "Model and property released", "camera-photographer-sunset"),
  candidate("1460007178", "library-books-on-table-and-background-for-studying", "Books on a table in a library", "Kobus Louw", "E+", "Property released", "history-archive"),
  candidate("183319682", "old-map-of-the-world", "Old world map with compass", "AlexSava", "E+", "No release required", "old-map-history-archive"),
  candidate("183263623", "collection-of-old-black-and-white-photographs", "Old black-and-white photographs on a table", "michellegibson", "E+", "Model and property released", "vintage-photograph-sepia"),
  candidate("871168786", "woman-traveler-with-backpack-checks-map-to-find", "Traveller consulting a paper map outdoors", "Wojciech Kozielczyk", "iStock / Getty Images Plus", "Model released", "city-map-guide"),
  candidate("187806729", "red-and-blue-umbrella", "Umbrellas in a rainy Lisbon street, seen from a tram", "Jani Mäki", "Moment", "No release required", "rain-umbrella-street"),
  candidate("2187398021", "beautiful-blue-sky-with-fluffy-white-clouds-on-a", "Blue sky with white clouds", "Witthaya Prasongsin", "Moment", "No release required", "weather-sky"),
  candidate("1737350812", "threatening-dark-clouds-covering-the-sky", "Dark clouds covering the sky", "Frazao Studio Latino", "E+", "No release required", "cloudy-sky-weather"),
  candidate("102426612", "rua-augusta-in-baixa-district", "Rua Augusta shopping street, Lisbon", "Jorg Greuel", "Stone", "No release required", "shopping-street"),
  candidate("688398000", "dresses-hanged-in-a-clothing-store", "Dresses on a clothing-store rack", "filadendron", "E+", "Property released", "clothing-store-rack"),
  candidate("1392999887", "colorful-azulejo-souvenir-tiles-background", "Portuguese azulejo souvenir tiles", "Iggi_Boo", "iStock / Getty Images Plus", "No release required", "market-souvenirs"),
  candidate("642007444", "tourist-with-backpack-walking-on-a-hiking-trail", "Hiker on a coastal trail at Cabo da Roca, Sintra", "Alexander Spatari", "Moment", "Model released", "outdoor-hiking"),
  candidate("1320833203", "footpath-in-national-natural-park-in-sintra", "Woodland footpath in Sintra Natural Park", "Leonid Sorokin", "iStock / Getty Images Plus", "No release required", "hiking-trail-viewpoint"),
  candidate("1044275790", "vines-in-a-vineyard-in-alentejo-region-portugal-at", "Vineyard at sunset in Alentejo, Portugal", "Sohadiszno", "iStock / Getty Images Plus", "No release required", "wine-vineyard;vineyard-rows-sunset"),
  candidate("133889384", "the-douro-river", "Douro River and vineyards, Portugal", "PRG-Estudio", "iStock / Getty Images Plus", "No release required", "douro-valley-vineyard"),
  candidate("467101890", "wooden-wine-barrels-stacked-in-neat-lines-in-a-port", "Wine barrels in a cellar in Porto", "saiko3p", "iStock / Getty Images Plus", "No release required", "wine-cellar-barrels"),
  candidate("658613560", "pouring-wine-in-glasses", "Red wine being poured into a glass", "Ridofranz", "iStock / Getty Images Plus", "No release required", "wine-tasting-glasses;wine-glass-restaurant"),
  candidate("1903184810", "sailing-boat-in-lisbon-under-the-bridge-25-de-abril", "Sailing boat on the Tagus by 25 April Bridge", "artur carvalho", "Moment", "No release required", "river-cruise-boat;sailing-boat-river"),
  candidate("543659548", "wide-angle-shot-of-front-of-the-yacht", "View over the front deck of a yacht", "PhotoGoricki", "iStock / Getty Images Plus", "No release required", "river-cruise-boat-deck"),
  candidate("2193515508", "young-asian-woman-is-using-a-smartphone-to-check", "Traveller checking an airport departure board", "Jackyenjoyphotography", "Moment", "Model released", "airport-departure-terminal;airport-terminal"),
  candidate("1352121711", "female-passenger-with-baggage-standing-before", "Traveller with a suitcase beside an airport taxi", "yacobchuk", "iStock / Getty Images Plus", "Model and property released", "taxi-airport"),
  candidate("607210824", "rossio-central-station-lisbon", "Rossio railway station, Lisbon", "Carol Yepes", "Moment", "No release required", "train-station-platform"),
  candidate("2198962183", "happy-university-teacher-communicating-with-her", "Teacher talking with adult students in a classroom", "Drazen Zigic", "iStock / Getty Images Plus", "Model and property released", "language-classroom;language-classroom-students"),
  candidate("1194472286", "students-in-cookery-class-mixing-ingredients-for", "Students mixing ingredients during a cookery class", "monkeybusinessimages", "iStock / Getty Images Plus", "Model and property released", "cooking-class-kitchen"),
  candidate("894870474", "two-women-at-a-pottery-workshop-making-clay-pots", "Two women making clay pots in a pottery workshop", "jacoblund", "iStock / Getty Images Plus", "Model and property released", "cultural-workshop"),
  candidate("663267954", "wheelchair-woman-sitting-with-arms-up", "Woman in a wheelchair on a beach", "Wavebreakmedia", "iStock / Getty Images Plus", "Model released", "accessible-travel"),
  candidate("1035083396", "concret-ramp-way-with-stainless-steel-handrail-with", "Ramp with handrails and a wheelchair symbol", "Bill_Vorasate", "iStock / Getty Images Plus", "No release required", "wheelchair-accessible-ramp"),
  candidate("1409765501", "female-male-wheelchair-access-wc-sign", "Restroom sign including a wheelchair-access symbol", "photoman", "iStock / Getty Images Plus", "No release required", "accessible-bathroom"),
  candidate("1347627626", "portrait-of-happy-senior-couple-tourists-outdoors", "Older tourists in a historic town", "Halfpoint", "iStock / Getty Images Plus", "Model released", "senior-traveler"),
  candidate("2160989369", "multigenerational-group-of-travelers-on-a-busy", "Passengers holding handrails on a busy bus", "Jose carlos Cerdeno", "iStock / Getty Images Plus", "Model released", "public-bus-transit"),
  candidate("2148703154", "business-persons-on-meeting-in-the-office", "Business team meeting in an office", "VioletaStoimenova", "E+", "Model released", "business-meeting"),
  candidate("2148854866", "chairs-table-and-technology-in-empty-boardroom-of", "Empty boardroom with chairs and a meeting table", "Bevan Goldswain", "E+", "Property released", "conference-room-meeting;hotel-business-center"),
  candidate("923748932", "businesswoman-waiting-at-airport-lounge", "Businesswoman waiting in an airport lounge", "jacoblund", "iStock / Getty Images Plus", "Model and property released", "airport-lounge"),
  candidate("1916729901", "meeting-success-two-business-persons-shaking-hands", "Businesspeople shaking hands outdoors", "da-kuk", "E+", "Model released", "business-handshake"),
];

export const existingAssignments = [
  { id: "1172009391", stems: ["hero-lisbon-skyline", "hero-skyline", "alfama-street-2", "miradouro-viewpoint", "miradouro"] },
  { id: "183584154", stems: ["azulejo-tiles"] },
  { id: "945023048", stems: ["portuguese-food"] },
  { id: "1494877133", stems: ["tram-28"] },
  { id: "1315418850", stems: ["cascais-coastline", "sunny-beach-day"] },
];

export function replacementFor(path) {
  const name = path.split("/").at(-1).replace(/\.[^.]+$/, "");
  const matches = [...candidates, ...existingAssignments].flatMap(asset =>
    asset.stems.filter(stem => name === stem || name.replace(/-\d+$/, "") === stem)
      .map(stem => ({ id: asset.id, specificity: stem.length })));
  matches.sort((a, b) => b.specificity - a.specificity);
  if (matches[0]?.specificity === matches[1]?.specificity && matches[0]?.id !== matches[1]?.id) {
    throw new Error(`Ambiguous Getty replacement: ${path}`);
  }
  return matches[0]?.id;
}
