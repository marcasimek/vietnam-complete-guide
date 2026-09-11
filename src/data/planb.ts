import type { PlanBScenario } from '@/model/types'

export const planB: PlanBScenario[] = [
  {
    id: 'planb-rain-mountains',
    title: 'Déšť, sesuvy nebo zavřená horská silnice',
    trigger: 'Na loopu nebo u Sa Py prší tak, že se nedá bezpečně jet.',
    steps: [
      'Loop: rozhodnutí patří operátorovi a řidičům, ne nám. Přijmi zkrácení etapy.',
      'Trek 27. 9.: zkrátit trasu na Lao Chải → Tả Van bez navazujících vesnic, nebo vyměnit za volnější den v Sa Pě.',
      'Coaster 26. 9.: za deště vypadává. Přesuň na ráno 28. 9., kde je volitelný program.',
      'Nepřesouvej kvůli počasí přesun mezi oblastmi. Ten drží celý zbytek plánu.',
    ],
    affectsBookings: ['bk-loop', 'bk-sapa-trek'],
    losses: ['část výhledů', 'případně coaster'],
  },
  {
    id: 'planb-no-train',
    title: 'Noční vlak nepojede nebo není volno',
    trigger: 'Spoj 28./29. 9. je zrušený, nebo se nepodaří zarezervovat kupé.',
    steps: [
      'Varianta A: noční limousine autobus Sa Pa → Hanoj. Je to horší spaní, ale funguje a jezdí častěji.',
      'Varianta B: denní přejezd 29. 9. ráno a zkrácení odpočinkového bloku v Tam Cốc o půlden.',
      'Varianta C: noc navíc v Sa Pě a posun celého bloku Ninh Bình o den. Tohle sáhne i na Cát Bà — použij až jako poslední.',
      'U všech variant přebookuj návazný transfer do Tam Cốc.',
    ],
    affectsBookings: ['bk-night-train', 'bk-transfer-tamcoc', 'bk-tamcoc-stay'],
    losses: ['zážitek z nočního vlaku', 'u varianty C jeden den v Ninh Bình'],
  },
  {
    id: 'planb-boat-cancelled',
    title: 'Zrušená plavba Lan Hạ',
    trigger: 'Počasí nebo moře 3. 10. nedovolí vyplout.',
    steps: [
      'Použij rezervní den 4. 10. — přesně proto je na Cát Bà třetí noc.',
      'Když odpadne i 4. 10., náhrada je národní park nebo jeskyně a pláž.',
      'Neruš kvůli tomu návrat 5. 10. do Hanoje. Poslední noc na pevnině je pevný bod.',
    ],
    affectsBookings: ['bk-lanha-boat'],
    losses: ['kajak a laguny, pokud odpadnou oba dny'],
  },
  {
    id: 'planb-island-cutoff',
    title: 'Přerušené spojení z ostrova',
    trigger: 'Trajekty z Cát Bà nejezdí kvůli počasí.',
    steps: [
      'Zjisti stav spojení hned ráno 5. 10., ne až odpoledne.',
      'Když nejede nic, informuj poslední hotel v Hanoji o pozdním příjezdu.',
      'Kritický je let 6. 10. ve 20:40. Pokud hrozí, že spojení nepojede ani 6. 10. ráno, řeš odjezd už 4. 10. večer — radši oželet poslední ostrovní den než let.',
    ],
    affectsBookings: ['bk-return-hanoi', 'bk-transfer-han'],
    losses: ['poslední den na ostrově', 'poslední večeře v Hanoji'],
  },
  {
    id: 'planb-illness',
    title: 'Nemoc nebo únava',
    trigger: 'Někdo nemůže pokračovat v programu.',
    steps: [
      'Vynech nepovinnou atrakci, ne bezpečný přestup a ne poslední noc v Hanoji.',
      'Nejlepší den na odpočinek je 29. 9. v Tam Cốc a 4. 10. na Cát Bà — obojí je záměrně měkké.',
      'Na loopu to řeš s operátorem: někdy jde pokračovat autem místo motorky.',
      'Při horečkách nebo dehydrataci nečekej do večera. Ve větších městech jsou mezinárodní kliniky.',
    ],
    losses: ['část programu'],
  },
  {
    id: 'planb-split',
    title: 'Páry se chtějí rozdělit',
    trigger: 'Jedna dvojice chce jiný program než druhá.',
    steps: [
      'Dny, kde to jde bez komplikací: 20. 9. Hanoj, 27. 9. odpoledne Sa Pa, 1. 10. Ninh Bình, 4. 10. Cát Bà.',
      'Dny, kde to nejde: všechny přesuny mezi oblastmi a loop.',
      'Domluv se předem na čase a místě srazu a měj obě dvojice dosažitelné — na loopu a v horách signál nebývá.',
      'Večer 26. 9. je na tohle dělaný: dva na bylinkovou koupel, dva do baru.',
    ],
  },
]
