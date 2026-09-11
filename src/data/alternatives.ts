import type { Alternative } from '@/model/types'

/**
 * Alternativní oblasti. Jsou tu jako varianty k prodiskutování, ne jako
 * automatické přeskupení plánu.
 */
export const alternatives: Alternative[] = [
  {
    id: 'alt-ta-xua',
    title: 'Tà Xùa místo části Hà Giang',
    condition: 'Kdyby se čtyřdenní loop ukázal jako moc jízdy a chtěli jsme kratší blok hor.',
    replaces: 'Dva dny z Hà Giang Loopu.',
    cost: 'Minimálně 2 noci a dva delší přejezdy z Hanoje a zpět. Tà Xùa je v provincii Sơn La, jiným směrem než Hà Giang.',
    gains: [
      'Kratší jízdní etapy než na loopu.',
      'Známé body pro „cloud hunting": Dinosaur Spine, Dolphin Rock, Windy Peak, Lonely Tree, mechový les.',
    ],
    losses: [
      'Mã Pí Lèng a Nho Quế — to jsou nejsilnější místa celé cesty.',
      'Kontinuitu trasy: Tà Xùa nenavazuje na Sa Pu tak přirozeně jako Hà Giang.',
    ],
    detail: [
      'Pozor na identitu bodů: turistická oblast pro lov mraků a vícedenní výstup na horu stejného jména nejsou automaticky totéž.',
      'Moře mraků není garantované. Fotografie z jiného období nepředpovídá zářijové počasí.',
    ],
  },
  {
    id: 'alt-pu-luong',
    title: 'Pù Luông jako pěší blok navíc',
    condition: 'Kdybychom chtěli víc chůze mezi vesnicemi a míň přesunů.',
    replaces: 'Jeden až dva dny v Ninh Bình, nebo záložní den na Cát Bà.',
    cost: '2 noci a přejezd z Hanoje (nebo návaznost z Ninh Bình). Není to zastávka na půl dne.',
    gains: [
      'Pěší výlety mezi vesnicemi, terasy, tradiční domy na kůlech a vodní kola.',
      'Výrazně menší provoz než Sa Pa.',
    ],
    losses: [
      'Odpočinkový blok s bazénem v Tam Cốc, nebo rezervu na plavbu u Cát Bà.',
    ],
    detail: [
      'Bambusový vor na řece není peřejový rafting. To jsou dvě různé věci.',
      'Trasa 10–20 km denně z cestovatelských videí není náš povinný výkon.',
      'Bat Cave a oblast Kho Mường je potřeba ověřit — přístupnost se mění.',
    ],
  },
  {
    id: 'alt-cao-bang',
    title: 'Cao Bằng a vodopád Bản Giốc',
    condition: 'Jen jako výměna za jiný blok, ne jako přídavek.',
    replaces: 'Dva dny — realisticky blok Ninh Bình nebo část Hà Giangu.',
    cost: '2 noci a dlouhé přejezdy. Cao Bằng je od Hà Giangu daleko po špatných silnicích.',
    gains: ['Bản Giốc je jeden z nejpůsobivějších vodopádů v jihovýchodní Asii.'],
    losses: ['Ninh Bình s lodí a bazénem, nebo část loopu.'],
    detail: ['Průtok vodopádu se během roku výrazně mění — konec září bývá po období dešťů dobrý, ale garance to není.'],
  },
  {
    id: 'alt-mai-chau',
    title: 'Mai Châu jako krátká zastávka',
    condition: 'Kdybychom potřebovali měkký den mezi Hanojí a jihem.',
    replaces: 'Jeden den v Ninh Bình.',
    cost: '1 noc, přejezd z Hanoje zhruba 3–4 hodiny.',
    gains: ['Údolí s rýžovými poli a domy na kůlech, blíž k Hanoji než Pù Luông.'],
    losses: ['Jeden den v Ninh Bình, což je náš odpočinkový blok.'],
  },
  {
    id: 'alt-rafting-video',
    title: 'Rafting a downhill autíčka „u Hanoje"',
    condition: 'Vzpomínka z videa, kterou jsme nedokázali potvrdit.',
    replaces: 'Nic — tohle není návrh na změnu trasy.',
    cost: 'Doložený raftingový screenshot je označený Đà Nẵng, tedy střed Vietnamu. To je mimo náš region a nemá smysl kvůli tomu měnit cestu.',
    gains: [],
    losses: [],
    detail: [
      'Hòa Phú Thành bylo dřív navrženo jako možná identifikace místa z videa. Není to potvrzené a není to nic, co by pocházelo od cestujících.',
      'K downhill autíčkům: v Sa Pě je alpine coaster na kolejnici, ne bezkolejová autíčka. Detail je u kroku 26. 9.',
      'Kvůli tomuhle videu nepřidáváme střed Vietnamu.',
    ],
  },
]

export const alternativeById = new Map(alternatives.map((a) => [a.id, a]))
