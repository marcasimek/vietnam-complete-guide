import type { GuideCard } from '@/model/types'

/**
 * Praktické karty. Stručné a akční — ne encyklopedie.
 * U zdravotních a právních věcí se drží striktně toho, co má oporu,
 * a jasně odděluje veřejnou informaci od individuální rady.
 */
export const guideCards: GuideCard[] = [
  {
    id: 'guide-method',
    category: 'entry',
    title: 'Jak jsme tohle ověřovali',
    lead: 'Přečti si to jednou. Vysvětluje, čemu v aplikaci můžeš věřit a čemu ne.',
    sections: [
      {
        heading: 'Tři různé věci, které se pletou',
        bullets: [
          'Důvěryhodnost údaje — odkud cena nebo provozní doba pochází.',
          'Dostupnost — jestli je pro náš konkrétní termín volno. Ověřená cena tohle neříká.',
          'Rezervace — co jsme skutečně objednali. Default je „k řešení", ne „rezervováno".',
        ],
      },
      {
        heading: 'Štítky u údajů',
        bullets: [
          '„ověřeno ve zdroji" — údaj je přímo v uvedeném zdroji.',
          '„zveřejněný ceník" — cena od poskytovatele nebo prodejce, ale bez ověřené dostupnosti pro nás.',
          '„odhad" — náš vlastní odhad. Řádová orientace.',
          '„neověřeno" — nemáme zdroj, je to potřeba potvrdit.',
          '„náš plán" — co chceme my. Nic víc.',
        ],
      },
      {
        heading: 'Omezení, které je férové přiznat',
        bullets: [
          'Data vznikla 11. 9. 2026 v prostředí, kde šlo web jen prohledávat, ne otevírat jednotlivé stránky. Údaje pocházejí z výsledků vyhledávání nad uvedenými odkazy.',
          'Proto u cen a provozních dob skoro nikde nenajdeš štítek „ověřeno ve zdroji" — bylo by to tvrzení nad rámec toho, co jsme opravdu udělali.',
          'Výjimka je to, co nám poskytovatel řekl PŘÍMO — nabídka z jeho vlastního formuláře, mail, WhatsApp. Tam štítek „ověřeno ve zdroji" stojí právem. Zatím se to týká jen nabídky Strawberry z 14. 9. 2026.',
          'Odkaz u každé ceny je tam proto, aby se dal otevřít a potvrdit. To je konkrétní další krok, ne výmluva.',
        ],
      },
      {
        heading: 'Mapy a polohy',
        bullets: [
          'Když u místa nemáme ověřený pin, aplikace otevře VYHLEDÁNÍ názvu, ne falešně přesné souřadnice.',
          'Bod města je střed oblasti, ne přesná poloha nástupiště.',
          'Spojnice mezi oblastmi na naší schematické mapě je schéma, ne sjízdná silnice ani trek.',
        ],
      },
    ],
    sourceIds: ['src-fx-2026-09-11'],
  },
  {
    id: 'guide-entry',
    category: 'entry',
    title: 'Vstup do Vietnamu',
    lead: 'Pro české občany existuje bezvízový pobyt do 45 dnů — náš pobyt je 18 dnů, takže se do toho vejdeme.',
    sections: [
      {
        heading: 'Co musí sedět',
        bullets: [
          'Pas platný nejméně 6 měsíců po datu příletu — tedy minimálně do dubna 2027.',
          'Nejméně dvě volné strany v pase.',
          'Zpáteční letenka (EY431 z 6. 10.) jako doklad o odletu.',
        ],
      },
      {
        heading: 'Než odletíš',
        bullets: [
          'Otevři stránku MZV ČR k Vietnamu a ověř aktuální znění. Vstupní režim se mění a tahle aplikace ho nenahrazuje.',
          'Zkontroluj datum platnosti pasu u všech čtyř lidí, ne jen u sebe.',
          'Pokud by se plán protáhl nad 45 dnů, bezvízový pobyt nejde prodloužit zevnitř — muselo by se řešit e-visa předem.',
        ],
      },
    ],
    caveats: [
      'Tenhle přehled je orientace z cestovatelských zdrojů, ne úřední výklad. Rozhoduje MZV ČR a vietnamské úřady.',
    ],
    sourceIds: ['src-mzv-vietnam-visa', 'src-mzv-vietnam', 'src-visa-exemption-cz'],
    tags: ['culture'],
  },
  {
    id: 'guide-flights',
    category: 'flights',
    title: 'Lety a zavazadla',
    lead: 'Čtyři úseky přes Abú Dhabí. Zavazadlový nárok závisí na konkrétním tarifu — a ten potvrzený nemáme.',
    sections: [
      {
        heading: 'Naše lety',
        bullets: [
          '18. 9. — EY156, Praha 10:10 → Abú Dhabí 18:00.',
          '18./19. 9. — EY432, Abú Dhabí 21:45 → Hanoj 07:20.',
          '6./7. 10. — EY431, Hanoj 20:40 → Abú Dhabí 00:30.',
          '7. 10. — EY155, Abú Dhabí 02:50 → Praha 07:05.',
        ],
      },
      {
        heading: 'Zavazadla — co ověřit',
        bullets: [
          'Zvažujeme balení do 7 kg příručního zavazadla. Skutečný nárok podle koupeného tarifu ale potvrzený není.',
          'Zkontroluj nárok pro všechny čtyři cestující zvlášť — tarify se mohou lišit.',
          'Powerbanky a náhradní baterie patří do příručního, ne do odbaveného. Přesná pravidla a limity ověř u Etihadu.',
          'Tekutiny v příručním podle běžných pravidel pro mezinárodní lety.',
        ],
      },
      {
        heading: 'Tranzit v Abú Dhabí',
        bullets: [
          'Na cestě tam je v Abú Dhabí zastávka zhruba 3:45. Zpátky zhruba 2:20.',
          'Zpáteční přestup je krátký a v noci — počítej s tím, že spánek v letadle bude přerušený.',
        ],
      },
    ],
    caveats: ['Časy jsou podklad od cestujících, ne živě ověřený stav letu.'],
    sourceIds: ['src-traveller-flights', 'src-etihad'],
    tags: ['transport'],
  },
  {
    id: 'guide-money',
    category: 'money',
    title: 'Peníze a placení',
    lead: '100 000 VND je zhruba 80 Kč. Většina levných jídelen a všechny homestaye na loopu berou jen hotovost.',
    sections: [
      {
        heading: 'Kurz, se kterým počítá tahle aplikace',
        bullets: [
          '1 USD = 20,88 CZK a 1 USD = 26 001 VND ke dni 11. 9. 2026 (střední kurz).',
          'Z toho vychází 100 000 VND ≈ 80 Kč. Tenhle kurz se v aplikaci NEAKTUALIZUJE — online i offline se používá stejná uložená hodnota s datem.',
          'Mentální pomůcka: odděl posledních pět nul a přičti k tomu zhruba 80 %. 250 000 VND → 2,5 × 80 = 200 Kč.',
        ],
      },
      {
        heading: 'Bankomaty a poplatky',
        bullets: [
          'Vždycky odmítni převod na koruny přímo v bankomatu nebo terminálu (DCC). Nech transakci proběhnout v dongách — kurz karty bývá lepší.',
          'Poplatky za výběr se liší banku od banky. Ověř si podmínky své karty před odletem; žádný bankomat není „vždycky zdarma".',
          'Vybírej větší částky méně často, když má tvoje banka fixní poplatek za výběr.',
        ],
      },
      {
        heading: 'Hotovost na cestě',
        bullets: [
          'Rozděl hotovost mezi lidi a mezi zavazadla. Nemějte všechno v jedné ledvince.',
          'Na loop si vezmi hotovost na celé čtyři dny — v horách bankomat nehledej.',
          'Bankovky 20 000 a 500 000 VND jsou si podobné barvou. Kontroluj nuly, hlavně večer a ve spěchu.',
        ],
      },
      {
        heading: 'Kde karta funguje',
        bullets: [
          'Hotely a větší restaurace obvykle ano. Levné jídelny, trhy, loďky a homestaye zpravidla ne.',
          'Rezervace ubytování zaplacená předem kartou je jiná věc než placení na místě.',
        ],
      },
    ],
    sourceIds: ['src-fx-2026-09-11'],
    tags: ['budget'],
  },
  {
    id: 'guide-connectivity',
    category: 'connectivity',
    title: 'SIM, eSIM a signál v horách',
    lead: 'Pro naši trasu je rozhodující jedna věc: na Hà Giang Loop má použitelné pokrytí prakticky jen Viettel.',
    sections: [
      {
        heading: 'Proč zrovna Viettel',
        bullets: [
          'Viettel má nejsilnější síť v horách a na venkově. Na úsecích mezi Đồng Văn, Mèo Vạc a Lũng Cú ostatní sítě signál ztrácejí.',
          'Airalo pro Vietnam běží na Vinaphone. To je v pohodě pro Hanoj a hlavní trasu, ale ne pro loop.',
          'Turistické tarify Viettelu se pohybují zhruba mezi 60 000 a 200 000 VND podle objemu dat a délky platnosti.',
        ],
      },
      {
        heading: 'Praktické rozhodnutí pro nás',
        bullets: [
          'Rozumná kombinace: cestovní eSIM aktivovaná ještě v Praze pro první hodiny po příletu, a fyzická Viettel SIM koupená ve městě, jakmile je čas.',
          'Aspoň dva z nás by měli mít Viettel — stačí, aby v horách fungoval jeden telefon pro celou skupinu.',
          'Ověř, jestli tarif umožňuje hotspot. U některých cestovních eSIM to není samozřejmost.',
          'Místní číslo se hodí na volání ubytování a řidičům. Cestovní eSIM ho obvykle nemá.',
        ],
      },
    ],
    caveats: [
      'Ceny a parametry tarifů se mění často. Ověř je u prodejce v době nákupu.',
      'Ani Viettel neznamená signál všude. Na loopu počítej s úseky bez připojení — proto je offline balíček téhle aplikace praktická věc, ne dekorace.',
    ],
    sourceIds: ['src-viettel-coverage', 'src-esim-coverage'],
    tags: ['transport'],
  },
  {
    id: 'guide-insurance',
    category: 'insurance',
    title: 'Pojištění',
    lead: 'Standardní cestovní pojištění často vylučuje právě to, co na téhle cestě děláme.',
    sections: [
      {
        heading: 'Co si nechat písemně potvrdit',
        bullets: [
          'Spolujízda na motorce jako pasažér. Tohle je čtyři dny našeho programu a mnoho pojistek to vylučuje nebo omezuje.',
          'Trekking do určité nadmořské výšky — trasy u Sa Py a na loopu jsou nízkohorské, ale podmínku si přečti.',
          'Lezení s jištěním a případně deep-water soloing u Cát Bà. To jsou dvě různé kategorie a pojišťovny je posuzují jinak.',
          'Rozsah asistence: repatriace, nemocnice, telefonní linka v češtině.',
        ],
      },
      {
        heading: 'Než odletíte',
        bullets: [
          'Ulož si číslo asistenční linky offline do telefonu, ne jen do mailu.',
          'Vyfoť kartičku pojištěnce a měj ji dostupnou i bez signálu.',
        ],
      },
    ],
    caveats: [
      'Rozsah krytí určuje smlouva konkrétní pojišťovny. Aplikace ti neřekne, co máš pojištěné — to musí říct tvoje pojistka.',
    ],
    tags: ['activity'],
  },
  {
    id: 'guide-health',
    category: 'health',
    title: 'Zdraví, jídlo a voda',
    lead: 'Obecné zásady, nic individuálního. Dávkování léků a očkování řeší lékař, ne cestovní aplikace.',
    sections: [
      {
        heading: 'Před cestou',
        bullets: [
          'Doporučení k očkování pro Vietnam najdeš u CDC nebo na očkovacím centru. Plán očkování si nech sestavit odborně a s předstihem.',
          'Vezmi si vlastní léky, které běžně bereš, v originálním balení a v příručním zavazadle.',
        ],
      },
      {
        heading: 'Na místě',
        bullets: [
          'Pij balenou nebo převařenou vodu. Led v zavedených podnicích bývá z čištěné vody, ale jistotu nemáš.',
          'Jez tam, kde je vysoký obrat — jídlo se pak nestojí. To platí i (a hlavně) pro levné jídelny.',
          'Ovoce loupej sám.',
          'Repelent se hodí, hlavně v Ninh Bình a Cát Bà a večer.',
        ],
      },
      {
        heading: 'Když se něco stane',
        bullets: [
          'Při průjmu je základ rehydratace a odpočinek. Když přijdou horečky, krev ve stolici nebo to trvá, je potřeba lékař.',
          'Ve větších městech jsou mezinárodní kliniky. V horách je nejbližší pomoc daleko — proto je pojištění s asistencí důležité.',
        ],
      },
    ],
    caveats: [
      'Tohle nejsou lékařské rady na míru. Preventivní antibiotika ani konkrétní dávkování tu úmyslně nejsou.',
      'Alergie: v místních jídelnách se rybí a krevetová omáčka používá běžně a komunikace o složení je obtížná. Nic tu nemůžeme zaručit.',
    ],
    sourceIds: ['src-cdc-vietnam'],
  },
  {
    id: 'guide-safety',
    category: 'safety',
    title: 'Bezpečnost a podvody',
    lead: 'Nejčastější problémy nejsou kriminální, ale obchodní: falešná agentura, jiná cena na konci, pas jako zástava.',
    sections: [
      {
        heading: 'Doprava a rezervace',
        bullets: [
          'Cenu a trasu si nech potvrdit před nástupem, ne až na konci. U taxi buď taxametr, nebo dohodnutá cena předem.',
          'Aplikace typu Grab fungují v Hanoji a Hải Phòngu dobře, ale nepředpokládej je v každé obci. V horách neplatí.',
          'Rezervace přes hotel nebo ověřenou platformu, ne přes někoho, kdo tě osloví na ulici.',
        ],
      },
      {
        heading: 'Pas',
        bullets: [
          'Nikdy nenechávej pas jako zástavu při půjčení motorky nebo skútru. Nabídni kopii nebo zálohu.',
          'V hotelu je běžné, že si pas na chvíli vezmou k registraci. Chtěj ho zpátky týž den.',
        ],
      },
      {
        heading: 'Na motorce',
        bullets: [
          'Přilbu si zkontroluj sám. Pokud drží jen na slovo, řekni si o jinou.',
          'Na loopu jedeme jako spolujezdci s místními řidiči — to je záměr, ne kompromis.',
        ],
      },
    ],
    sourceIds: ['src-mzv-vietnam'],
  },
  {
    id: 'guide-rules',
    category: 'rules',
    title: 'Místní pravidla',
    lead: 'Několik věcí, kde se pravidla liší od českých a kde se to řeší pokutou.',
    sections: [
      {
        heading: 'Řízení',
        bullets: [
          'Podle podkladů má motocyklový řidičák jen Martin a jeho rozsah není potvrzený. Mezinárodní řidičský průkaz a uznávání ve Vietnamu je nutné ověřit předem.',
          'Bez platného oprávnění nebývá krytá ani pojistka. Proto na loopu jedeme s řidiči.',
        ],
      },
      {
        heading: 'Tabák a e-cigarety',
        bullets: [
          'Pravidla pro e-cigarety a zahřívaný tabák se ve Vietnamu měnila. Před cestou si ověř aktuální stav u oficiálních zdrojů, ne z fóra.',
        ],
      },
      {
        heading: 'Osobní léky',
        bullets: [
          'Léky vozit v originálním balení. U předepsaných léků se hodí mít recept nebo lékařskou zprávu v angličtině.',
        ],
      },
    ],
    caveats: ['Pravidla se mění. Tohle je upozornění na to, co si ověřit, ne výklad zákona.'],
    sourceIds: ['src-mzv-vietnam'],
  },
  {
    id: 'guide-packing',
    category: 'packing',
    title: 'Balení',
    lead: 'Jeden velký batoh na základnu a jeden malý na loop. Vrstvy, ne tlustá bunda.',
    sections: [
      {
        heading: 'Oblečení',
        bullets: [
          'Nížina (Hanoj, Ninh Bình, Cát Bà) je v září a říjnu horká a vlhká. Hory (Hà Giang, Sa Pa) jsou večer výrazně chladnější.',
          'Systém vrstev: tričko + mikina nebo fleece + lehká nepromokavá bunda.',
          'Dešťová ochrana je nutnost, ne volba. Na motorce dostaneš pláštěnku od operátora, ale vlastní je lepší.',
          'Obuv, která drží v blátě. Trek 27. 9. může být kluzký.',
        ],
      },
      {
        heading: 'Technika',
        bullets: [
          'Insta360 plus telefon. Další fotoaparát nebo iPad není potvrzená povinnost.',
          'Powerbanka do příručního zavazadla. Na loopu se nabíjí večer na homestayi.',
          'Zálohuj fotky průběžně — aspoň jednou za oblast.',
          'Voděodolný obal nebo sáček na telefon na loď a kajak.',
        ],
      },
      {
        heading: 'Denní batoh na loop',
        bullets: [
          'Dva až tři dny oblečení, pláštěnka, léky, hotovost, nabíječka, hygiena.',
          'Velké batohy zůstávají na ověřené základně v Hà Giangu. Tohle si nech písemně potvrdit — je to čtyři dny bez přístupu k věcem.',
        ],
      },
      {
        heading: 'Co koupit až na místě',
        bullets: [
          'Repelent, opalovací krém, základní hygiena, pláštěnka navíc. Všechno je tam levnější.',
        ],
      },
    ],
  },
]

export const guideCardById = new Map(guideCards.map((c) => [c.id, c]))
