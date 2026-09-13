# Hybrid 5e × Hogwarts Legacy — pracovní pravidla v0.2
Stav: pracovní implementace podle hráčových rozhodnutí z 2026-09-13. Schválené zadání: čtyři připravené možnosti, cooldowny, neškolená magie s nevýhodou, INT/WIS a volba statistik svěřená GM. Číselné provedení je GM volba pro pilot, nikoli otestované vyvážení. Při rozdílu se starší v0.1 platí v0.2 a STARTING_MANIFESTATIONS.md.

## 1. Kostky a vlastnosti
STR: síla těla; DEX: obratnost; CON: odolnost; INT: analýza a studium; WIS: postřeh a úsudek; CHA: vystupování a přesvědčování.
Modifikátor = floor((hodnota − 10) / 2).
Check: d20 + modifikátor + zdatnost, pokud se uplatní. Proficiency se nepřičítá dvakrát.
Záchrana a útok jsou odlišné druhy hodu. Výhoda/nevýhoda: dvě d20, vyšší/nižší; nekumulují se a vzájemně se vyruší.
Přirozená 20 na checku nesplní nemožné. Pro útok je 20 kritický zásah (zdvojené kostky zranění, nikoli bonus), 1 mine.
Obtížnost určí GM před hodem; orientačně lehké 10, běžně náročné 15, těžké 20. Není nutné házet, když není smysluplná nejistota.
Matthael používá standard array 15,14,13,12,10,8; GM vybral na hráčovo pověření. Hody na vlastnosti se neprovádějí. Další bonusy z ras/backgroundů 5e nejsou automaticky importovány.
Hráč hází své kostky. GM oznámí typ hodu, bonus a známé riziko před hodem; skrytou obtížnost lze ponechat skrytou, ale nesmí se zpětně přizpůsobit výsledku.

## 2. Společná kostra souboje — návrh
Iniciativa d20 + DEX. Tah: pohyb 9 m a jedna akce; bonusová akce jen pokud ji dává konkrétní pravidlo. Jedna reakce, obnoví se na začátku vlastního tahu.
Akcí je kouzlo, Basic Cast, sprint (+9 m), pomoc nebo jiný významný úkon. Žádná automatická další kouzla za popis komba.
Pilotní profil: vlastní začínající kouzelník, úroveň 1, nikoli D&D class Wizard. PB +2, AC 10 + DEX, maximum HP 12 + CON (min. 1). Matthael: AC12, maximum HP13. Aktuální HP po příběhovém úrazu nejsou odehraná ani stanovena. Růst úrovní zbývá připravit.
INT slouží porozumění a učení; WIS praktickému soustředění a sesílání. Nesčítají se. Útok = d20 + WIS + PB; kouzelnické DC = 8 + WIS + PB. Pro Matthaela +4 a DC12. INT check +1, se skutečně získanou Arcana zdatností později +3; Arcana zatím nemá. INT se neháže před každým sesláním. PB u čtyř vrozených projevů představuje pilotní přirozenou schopnost, ne znalost kouzelnické teorie.
Karta stanoví útok proti AC NEBO save cíle. Bez dalšího kontrolního hodu na běžné seslání naučeného kouzla. U vrozených projevů platí přesně jediný hod podle karty; neházet navíc selhání kontroly před útokem nebo ještě save po zásahu.
Ztráta koncentrace: při zranění CON save proti vyššímu z 10 a poloviny zranění (dolů); pouze jeden soustředěný efekt najednou.
Při 0 HP se bez zvolené hranice následků ještě nehraje; režim smrti, školních duelů a zotavení je otevřený.

## 3. Spellbook není bojová lišta
Spellbook eviduje nalezené, rozpracované a naučené kouzlo. Jen naučené kouzlo je běžně dostupné. Jedinou startovní výjimkou jsou čtyři konkrétní vrozené projevy v STARTING_MANIFESTATIONS.md; nejsou to naučená kouzla.
Čtyři připravené možnosti. Na startu všechny čtyři obsazují nepojmenované vrozené projevy včetně obrany. Protego tedy nyní není pátá bezplatná možnost. Basic Cast nemá. O případných pozdějších výjimkách rozhodneme při skutečném učení.
Mimo nebezpečí lze během minuty přestavět sestavu a použít libovolné naučené kouzlo při dodržení jeho podmínek.
V boji výměna jednoho připraveného kouzla stojí akci. Vyměněné kouzlo si pamatuje cooldown; přepínání jej neresetuje.
Čtyři pozice jsou omezení pohotovosti, ne zapomenutí ostatních zaklínadel.
Nápad mimo naučené kouzlo je nejprve posouzen jako improvizace v rozsahu toho, co umíš. Vysoký hod sám nenaučí zakázané/neznámé kouzlo.

## 4. Učení
Nalezené → trénované → naučené. Pro učení je potřeba dostupný zdroj a praktická příležitost.
Jedna krátká výuková scéna má předem stanovený úkol a kritérium; hod jen když nejistota scénu obohatí.
Neúspěch znamená konkrétní opravu nebo další příležitost, ne nekonečné opakování stejné kostky. Naučení se zapíše s datem/scénou.
Naučené kouzlo se při každém seslání znovu nezkouší jako školní test.
Přechod vrozeného projevu ke kouzlu: zdroj výuky + pochopení principu a nácvik. Pokud výuková scéna žádá nejistý hod, použije INT (typicky DC10; vyšší jen s předem uvedeným důvodem). Po dokončení se získá konkrétní formální karta, odstraní se vrozená nevýhoda a zapíše scéna. Jeden úspěch v boji sám učení neodemkne. Výuka nemění jednorázový příběhový únik na dostupnou teleportaci.
Vylepšení/talenty jsou samostatné pozdější odměny. Jejich strom teď nestavíme.

## 5. Cooldown místo běžných denních slotů
Běžná bojová kouzla nemají současně manu, sloty a cooldown. Pro běžnou magii používáme cooldown; mimořádná magie zůstává mimo tento návrh.
C0: bez čekání. C1: po použití nelze použít v následujícím vlastním tahu; dostupné v přespříštím. C2: přeskočí další dva vlastní tahy.
Zápis: tah použití t → znovu dostupné t + C + 1. Kouzlo použité v tahu 1 s C1 je dostupné v tahu 3.
Cooldown běží i když kouzlo není v sestavě. Mimo boj odpovídá jeden vlastní tah přibližně šesti sekundám; neobnovuje se jen změnou názvu scény.
Při seslání se akce a cooldown spotřebují i při minutí/úspěšném save. Při předem odhaleném neplatném cíli se hráč může rozhodnout znovu před hodem.
Cooldowny nepoužíváme na reakce v tomto návrhu; tam limituje reakce za kolo.

## 6. Obrany inspirované Legacy — vlastní tahový převod
Na startu platí namísto naučeného Protega Instinktivní zábrana z STARTING_MANIFESTATIONS.md, včetně hodu s nevýhodou. Následující formální Protego a Perfect Protego jsou budoucí obecná pravidla, ne získané schopnosti.
Protego, pokud naučeno: reakce po ohlášení jednoho blokovatelného útoku, ale PŘED hodem. +3 AC pouze proti němu. Nelze proti efektu se save ani útoku označenému jako neblokovatelný.
Úskok: alternativní reakce před hodem; +3 AC proti jednomu útoku NEBO výhoda na jeden DEX save. Vyžaduje možnost pohybu; součástí je přesun až o 1,5 m na dostupné bezpečné místo. Bez volného místa nebo při znehybnění není možný. Nevytahuje automaticky z celé oblasti a nezruší jiné podmínky.
Na jednu hrozbu se Protego a úskok nesčítají. Protivník nepřijde o následný tah.
Perfect Protego: pokud útok po aktivním Protegu mine alespoň o 5 a postava již ovládá Stupefy, může v téže reakci vrátit Stupefy. Jednou za reakci; žádné další řetězení reakcí.
Prozatímní Stupefy je slabý protiúder, nikoli plné opakované omráčení. Přesná rovnováha není otestovaná.
Silná neblokovatelná hrozba se oznámí čitelně; skrytý nepřítel nemusí odhalit celý svůj spellbook.

## 7. Kombinace, kategorie a prostředí
Karty používají kategorie Damage, Control, Force a Utility. Barvy jsou pomůcka, ne škola magie.
Příklad: Accio přitáhne cíl, čímž otevře dosah Incendia. Samotný popis nedá druhou akci; kombinace může proběhnout napříč tahy či s partnerem.
Bonusové škody nebo další efekty platí jen pokud jsou na kartě. Po úspěšném Control efektu se podmínky zapisují s přesným koncem.
Barevné štíty jsou volitelný modul, zatím bez pravidel a bez použití. Podobně Ancient Magic meter, lektvary/rostliny v boji a větší talentové stromy.
Pro improvizaci GM před hodem stanoví dosah, obranu, cenu a možný výsledek. Aplikace stejného nápadu nemění pravidla podle nálady.

## 8. Zápis po kole a návaznost
Stručně: HP; pozice; dostupná reakce; koncentrace/podmínky; 4 kouzla; cooldowny; omezené předměty.
Po scéně: co se skutečně stalo, nové znalosti, změny sheetu. Nehrané odhalení se nepřepíše mezi znalosti postavy.
Změna pravidla během hry se pojmenuje; neprovádět tichý retcon již zaplacených akcí.

## Zdroje a odlišení
D20 základ: https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game
Inspirace učením a kombinováním magie: https://www.hogwartslegacy.com/
Výše uvedený tahový převod, cooldowny, reakční hodnoty a karty jsou naše vlastní pracovní návrhy. Zbytek 5e 2014/2024 pravidel ani jejich class features se neimportuje automaticky.
