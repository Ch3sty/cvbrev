/**
 * Scoring Engine V4 - Optimized for Multi-Level Occupation Matching
 *
 * NYTT POÄNGSYSTEM (max 100p):
 * 1. Occupation Level Match (45p) - Olika poäng beroende på matchningsnivå
 *    - occupation-name exact: 45p (Butikschef = Butikschef)
 *    - occupation-group match: 35p (Chefer inom handel)
 *    - occupation-field match: 25p (Chefer och verksamhetsledare)
 * 2. Title/Headline Match (25p) - Yrkestiteln i rubrik/occupation
 * 3. Kompetenser (15p) - Matchade skills från CV
 * 4. Geografi (10p) - Avstånd eller remote
 * 5. Must-Have Bonus (5p) - Extra för strukturerade krav som matchar
 *
 * MÅLVÄRDEN (justerade för bredare sökning):
 * - 80-100p: Perfekt match (exakt samma roll + bra skills/geo)
 * - 60-79p: Mycket bra match (samma grupp eller liknande roll)
 * - 40-59p: Bra match (samma field eller relaterad roll)
 * - 25-39p: OK match (samma field, lite färre skills)
 * - 10-24p: Svag match (långt avstånd eller få gemensamma faktorer)
 * - 0-9p: Mycket svag match (filtreras bort)
 */ // ALLA SVERIGES 290 KOMMUNER MED KOORDINATER
const SWEDISH_MUNICIPALITIES = {
  // Stockholms län (26 kommuner)
  "stockholm": {
    lat: 59.3293,
    lon: 18.0686
  },
  "solna": {
    lat: 59.3599,
    lon: 18.0000
  },
  "sundbyberg": {
    lat: 59.3609,
    lon: 17.9711
  },
  "sollentuna": {
    lat: 59.4280,
    lon: 17.9514
  },
  "täby": {
    lat: 59.4439,
    lon: 18.0687
  },
  "upplands väsby": {
    lat: 59.5177,
    lon: 17.9106
  },
  "vallentuna": {
    lat: 59.5342,
    lon: 18.0774
  },
  "österåker": {
    lat: 59.4797,
    lon: 18.2978
  },
  "värmdö": {
    lat: 59.2914,
    lon: 18.4381
  },
  "lidingö": {
    lat: 59.3667,
    lon: 18.1333
  },
  "vaxholm": {
    lat: 59.4022,
    lon: 18.3539
  },
  "nacka": {
    lat: 59.3096,
    lon: 18.1633
  },
  "tyresö": {
    lat: 59.2443,
    lon: 18.2179
  },
  "huddinge": {
    lat: 59.2364,
    lon: 17.9827
  },
  "salem": {
    lat: 59.1617,
    lon: 17.7559
  },
  "botkyrka": {
    lat: 59.2000,
    lon: 17.8333
  },
  "haninge": {
    lat: 59.1644,
    lon: 18.1439
  },
  "nynäshamn": {
    lat: 58.9027,
    lon: 17.9492
  },
  "södertälje": {
    lat: 59.1959,
    lon: 17.6255
  },
  "nykvarn": {
    lat: 59.1794,
    lon: 17.4294
  },
  "järfälla": {
    lat: 59.4138,
    lon: 17.8333
  },
  "ekerö": {
    lat: 59.2814,
    lon: 17.7944
  },
  "sigtuna": {
    lat: 59.6171,
    lon: 17.7241
  },
  "upplands-bro": {
    lat: 59.5161,
    lon: 17.6108
  },
  "norrtälje": {
    lat: 59.7581,
    lon: 18.7048
  },
  "knivsta": {
    lat: 59.7267,
    lon: 17.7942
  },
  // Uppsala län (8 kommuner)
  "uppsala": {
    lat: 59.8586,
    lon: 17.6389
  },
  "enköping": {
    lat: 59.6357,
    lon: 17.0777
  },
  "håbo": {
    lat: 59.5939,
    lon: 17.5372
  },
  "tierp": {
    lat: 60.3461,
    lon: 17.5181
  },
  "älvkarleby": {
    lat: 60.5739,
    lon: 17.4561
  },
  "heby": {
    lat: 59.9158,
    lon: 16.2889
  },
  "östhammar": {
    lat: 60.2619,
    lon: 18.3800
  },
  // Södermanlands län (9 kommuner)
  "eskilstuna": {
    lat: 59.3710,
    lon: 16.5077
  },
  "strängnäs": {
    lat: 59.3783,
    lon: 17.0339
  },
  "nyköping": {
    lat: 58.7530,
    lon: 17.0086
  },
  "katrineholm": {
    lat: 58.9959,
    lon: 16.2073
  },
  "flen": {
    lat: 59.0597,
    lon: 16.5878
  },
  "oxelösund": {
    lat: 58.6694,
    lon: 17.0986
  },
  "trosa": {
    lat: 58.8942,
    lon: 17.5547
  },
  "gnesta": {
    lat: 59.0492,
    lon: 17.3122
  },
  "vingåker": {
    lat: 59.0444,
    lon: 15.8747
  },
  // Östergötlands län (13 kommuner)
  "linköping": {
    lat: 58.4108,
    lon: 15.6214
  },
  "norrköping": {
    lat: 58.5877,
    lon: 16.1924
  },
  "motala": {
    lat: 58.5370,
    lon: 15.0364
  },
  "mjölby": {
    lat: 58.3253,
    lon: 15.1289
  },
  "finspång": {
    lat: 58.7056,
    lon: 15.7703
  },
  "vadstena": {
    lat: 58.4492,
    lon: 14.8911
  },
  "ödeshög": {
    lat: 58.2339,
    lon: 14.6569
  },
  "ydre": {
    lat: 57.8719,
    lon: 15.2281
  },
  "kinda": {
    lat: 58.0531,
    lon: 15.5469
  },
  "boxholm": {
    lat: 58.1956,
    lon: 15.0542
  },
  "åtvidaberg": {
    lat: 58.1986,
    lon: 16.0028
  },
  "valdemarsvik": {
    lat: 58.2031,
    lon: 16.6031
  },
  "söderköping": {
    lat: 58.4833,
    lon: 16.3211
  },
  // Jönköpings län (13 kommuner)
  "jönköping": {
    lat: 57.7826,
    lon: 14.1618
  },
  "värnamo": {
    lat: 57.1856,
    lon: 14.0400
  },
  "nässjö": {
    lat: 57.6531,
    lon: 14.6968
  },
  "vetlanda": {
    lat: 57.4289,
    lon: 15.0776
  },
  "tranås": {
    lat: 58.0369,
    lon: 14.9786
  },
  "gislaved": {
    lat: 57.3050,
    lon: 13.5411
  },
  "gnosjö": {
    lat: 57.3508,
    lon: 13.7350
  },
  "eksjö": {
    lat: 57.6667,
    lon: 14.9725
  },
  "sävsjö": {
    lat: 57.4044,
    lon: 14.6622
  },
  "aneby": {
    lat: 57.8353,
    lon: 14.8117
  },
  "vaggeryd": {
    lat: 57.4767,
    lon: 14.1419
  },
  "mullsjö": {
    lat: 57.9133,
    lon: 13.8819
  },
  "habo": {
    lat: 57.9108,
    lon: 14.0733
  },
  // Kronobergs län (8 kommuner)
  "växjö": {
    lat: 56.8787,
    lon: 14.8059
  },
  "ljungby": {
    lat: 56.8333,
    lon: 13.9397
  },
  "älmhult": {
    lat: 56.5506,
    lon: 14.1372
  },
  "markaryd": {
    lat: 56.4644,
    lon: 13.5967
  },
  "tingsryd": {
    lat: 56.5239,
    lon: 14.9800
  },
  "alvesta": {
    lat: 56.8989,
    lon: 14.5564
  },
  "lessebo": {
    lat: 56.7533,
    lon: 15.2644
  },
  "uppvidinge": {
    lat: 56.9306,
    lon: 15.3942
  },
  // Kalmar län (12 kommuner)
  "kalmar": {
    lat: 56.6634,
    lon: 16.3567
  },
  "oskarshamn": {
    lat: 57.2644,
    lon: 16.4486
  },
  "västervik": {
    lat: 57.7583,
    lon: 16.6378
  },
  "vimmerby": {
    lat: 57.6658,
    lon: 15.8556
  },
  "borgholm": {
    lat: 56.8789,
    lon: 16.6550
  },
  "hultsfred": {
    lat: 57.4878,
    lon: 15.8406
  },
  "mönsterås": {
    lat: 57.0403,
    lon: 16.4364
  },
  "nybro": {
    lat: 56.7439,
    lon: 15.9081
  },
  "emmaboda": {
    lat: 56.6319,
    lon: 15.5394
  },
  "torsås": {
    lat: 56.4181,
    lon: 16.0150
  },
  "mörbylånga": {
    lat: 56.5100,
    lon: 16.3819
  },
  "högsby": {
    lat: 57.1656,
    lon: 16.0156
  },
  // Gotlands län (1 kommun)
  "gotland": {
    lat: 57.6348,
    lon: 18.2948
  },
  // Blekinge län (5 kommuner)
  "karlskrona": {
    lat: 56.1621,
    lon: 15.5866
  },
  "ronneby": {
    lat: 56.2092,
    lon: 15.2761
  },
  "karlshamn": {
    lat: 56.1706,
    lon: 14.8619
  },
  "sölvesborg": {
    lat: 56.0514,
    lon: 14.5825
  },
  "olofström": {
    lat: 56.2789,
    lon: 14.5322
  },
  // Skåne län (33 kommuner)
  "malmö": {
    lat: 55.6050,
    lon: 13.0038
  },
  "lund": {
    lat: 55.7047,
    lon: 13.1910
  },
  "helsingborg": {
    lat: 56.0465,
    lon: 12.6945
  },
  "landskrona": {
    lat: 55.8708,
    lon: 12.8301
  },
  "ängelholm": {
    lat: 56.2428,
    lon: 12.8622
  },
  "höganäs": {
    lat: 56.2011,
    lon: 12.5594
  },
  "eslöv": {
    lat: 55.8392,
    lon: 13.3039
  },
  "ystad": {
    lat: 55.4296,
    lon: 13.8206
  },
  "trelleborg": {
    lat: 55.3754,
    lon: 13.1567
  },
  "kristianstad": {
    lat: 56.0294,
    lon: 14.1567
  },
  "simrishamn": {
    lat: 55.5556,
    lon: 14.3522
  },
  "hässleholm": {
    lat: 56.1590,
    lon: 13.7658
  },
  "staffanstorp": {
    lat: 55.6444,
    lon: 13.2064
  },
  "burlöv": {
    lat: 55.6436,
    lon: 13.0836
  },
  "lomma": {
    lat: 55.6722,
    lon: 13.0764
  },
  "svedala": {
    lat: 55.5064,
    lon: 13.2347
  },
  "vellinge": {
    lat: 55.4708,
    lon: 13.0169
  },
  "skurup": {
    lat: 55.4792,
    lon: 13.4967
  },
  "sjöbo": {
    lat: 55.6306,
    lon: 13.7061
  },
  "hörby": {
    lat: 55.8547,
    lon: 13.6586
  },
  "höör": {
    lat: 55.9364,
    lon: 13.5419
  },
  "tomelilla": {
    lat: 55.5453,
    lon: 13.9631
  },
  "åstorp": {
    lat: 56.1344,
    lon: 12.9453
  },
  "båstad": {
    lat: 56.4297,
    lon: 12.8506
  },
  "klippan": {
    lat: 56.1333,
    lon: 13.1267
  },
  "perstorp": {
    lat: 56.1403,
    lon: 13.3919
  },
  "örkelljunga": {
    lat: 56.2858,
    lon: 13.2800
  },
  "bjuv": {
    lat: 56.0831,
    lon: 12.9189
  },
  "kävlinge": {
    lat: 55.7919,
    lon: 13.1103
  },
  "östra göinge": {
    lat: 56.2542,
    lon: 14.0678
  },
  "bromölla": {
    lat: 56.0714,
    lon: 14.4656
  },
  "osby": {
    lat: 56.3833,
    lon: 13.9886
  },
  "svalöv": {
    lat: 55.9117,
    lon: 13.1117
  },
  // Hallands län (6 kommuner)
  "halmstad": {
    lat: 56.6745,
    lon: 12.8577
  },
  "varberg": {
    lat: 57.1057,
    lon: 12.2502
  },
  "falkenberg": {
    lat: 56.9054,
    lon: 12.4915
  },
  "kungsbacka": {
    lat: 57.4870,
    lon: 12.0772
  },
  "hylte": {
    lat: 56.9953,
    lon: 13.2508
  },
  "laholm": {
    lat: 56.5125,
    lon: 13.0444
  },
  // Västra Götalands län (49 kommuner)
  "göteborg": {
    lat: 57.7089,
    lon: 11.9746
  },
  "mölndal": {
    lat: 57.6554,
    lon: 12.0137
  },
  "partille": {
    lat: 57.7395,
    lon: 12.1064
  },
  "lerum": {
    lat: 57.7704,
    lon: 12.2694
  },
  "alingsås": {
    lat: 57.9303,
    lon: 12.5344
  },
  "härryda": {
    lat: 57.6581,
    lon: 12.3689
  },
  "öckerö": {
    lat: 57.7064,
    lon: 11.6569
  },
  "stenungsund": {
    lat: 58.0706,
    lon: 11.8189
  },
  "tjörn": {
    lat: 58.0122,
    lon: 11.6289
  },
  "orust": {
    lat: 58.2000,
    lon: 11.6167
  },
  "uddevalla": {
    lat: 58.3480,
    lon: 11.9424
  },
  "lysekil": {
    lat: 58.2753,
    lon: 11.4350
  },
  "trollhättan": {
    lat: 58.2836,
    lon: 12.2886
  },
  "vänersborg": {
    lat: 58.3808,
    lon: 12.3235
  },
  "borås": {
    lat: 57.7210,
    lon: 12.9401
  },
  "ulricehamn": {
    lat: 57.7931,
    lon: 13.4122
  },
  "skövde": {
    lat: 58.3910,
    lon: 13.8455
  },
  "lidköping": {
    lat: 58.5052,
    lon: 13.1577
  },
  "ale": {
    lat: 57.9347,
    lon: 12.0483
  },
  "kungälv": {
    lat: 57.8708,
    lon: 11.9800
  },
  "sotenäs": {
    lat: 58.4878,
    lon: 11.2483
  },
  "munkedal": {
    lat: 58.4697,
    lon: 11.6808
  },
  "tanum": {
    lat: 58.7264,
    lon: 11.3236
  },
  "dals-ed": {
    lat: 59.0483,
    lon: 11.9178
  },
  "färgelanda": {
    lat: 58.5708,
    lon: 12.4600
  },
  "mellerud": {
    lat: 58.7000,
    lon: 12.4583
  },
  "åmål": {
    lat: 59.0508,
    lon: 12.7044
  },
  "bengtsfors": {
    lat: 59.0317,
    lon: 12.2294
  },
  "strömstad": {
    lat: 58.9378,
    lon: 11.1753
  },
  "vara": {
    lat: 58.2606,
    lon: 12.9556
  },
  "götene": {
    lat: 58.5414,
    lon: 13.4392
  },
  "tibro": {
    lat: 58.4231,
    lon: 14.1603
  },
  "töreboda": {
    lat: 58.7067,
    lon: 14.1258
  },
  "gullspång": {
    lat: 58.9897,
    lon: 14.1078
  },
  "tranemo": {
    lat: 57.4878,
    lon: 13.3508
  },
  "mariestad": {
    lat: 58.7094,
    lon: 13.8236
  },
  "essunga": {
    lat: 58.2000,
    lon: 12.8500
  },
  "karlsborg": {
    lat: 58.5353,
    lon: 14.5069
  },
  "grästorp": {
    lat: 58.3394,
    lon: 12.6197
  },
  "falköping": {
    lat: 58.1733,
    lon: 13.5508
  },
  "hjo": {
    lat: 58.3011,
    lon: 14.2867
  },
  "tidaholm": {
    lat: 58.1800,
    lon: 13.9569
  },
  "svenljunga": {
    lat: 57.4969,
    lon: 13.1094
  },
  "herrljunga": {
    lat: 58.0817,
    lon: 13.0308
  },
  "bollebygd": {
    lat: 57.6683,
    lon: 12.5686
  },
  "mark": {
    lat: 57.4939,
    lon: 12.5261
  },
  "lilla edet": {
    lat: 58.1333,
    lon: 12.1333
  },
  "vårgårda": {
    lat: 58.0342,
    lon: 12.8106
  },
  // Värmlands län (16 kommuner)
  "karlstad": {
    lat: 59.3793,
    lon: 13.5036
  },
  "arvika": {
    lat: 59.6556,
    lon: 12.5906
  },
  "kristinehamn": {
    lat: 59.3097,
    lon: 14.1081
  },
  "filipstad": {
    lat: 59.7111,
    lon: 14.1664
  },
  "hagfors": {
    lat: 60.0264,
    lon: 13.6681
  },
  "säffle": {
    lat: 59.1339,
    lon: 12.9322
  },
  "kil": {
    lat: 59.5050,
    lon: 13.3225
  },
  "eda": {
    lat: 59.8669,
    lon: 12.3911
  },
  "torsby": {
    lat: 60.1306,
    lon: 12.9939
  },
  "sunne": {
    lat: 59.8408,
    lon: 13.1203
  },
  "forshaga": {
    lat: 59.5283,
    lon: 13.4961
  },
  "grums": {
    lat: 59.3481,
    lon: 13.1108
  },
  "årjäng": {
    lat: 59.3867,
    lon: 12.1378
  },
  "munkfors": {
    lat: 59.8386,
    lon: 13.5442
  },
  "storfors": {
    lat: 59.7528,
    lon: 14.2908
  },
  "hammarö": {
    lat: 59.3278,
    lon: 13.6306
  },
  // Örebro län (12 kommuner)
  "örebro": {
    lat: 59.2753,
    lon: 15.2134
  },
  "kumla": {
    lat: 59.1289,
    lon: 15.1428
  },
  "hallsberg": {
    lat: 59.0644,
    lon: 15.1089
  },
  "askersund": {
    lat: 58.8758,
    lon: 14.9061
  },
  "degerfors": {
    lat: 59.2569,
    lon: 14.4567
  },
  "karlskoga": {
    lat: 59.3267,
    lon: 14.5233
  },
  "laxå": {
    lat: 58.9792,
    lon: 14.6139
  },
  "lindesberg": {
    lat: 59.5939,
    lon: 15.2278
  },
  "ljusnarsberg": {
    lat: 59.8667,
    lon: 14.9500
  },
  "nora": {
    lat: 59.5206,
    lon: 15.0319
  },
  "hällefors": {
    lat: 59.7747,
    lon: 14.5211
  },
  "lekeberg": {
    lat: 59.0689,
    lon: 15.2581
  },
  // Västmanlands län (10 kommuner)
  "västerås": {
    lat: 59.6099,
    lon: 16.5448
  },
  "köping": {
    lat: 59.5139,
    lon: 15.9931
  },
  "sala": {
    lat: 59.9239,
    lon: 16.6050
  },
  "fagersta": {
    lat: 59.9944,
    lon: 15.7933
  },
  "arboga": {
    lat: 59.3931,
    lon: 15.8372
  },
  "kungsör": {
    lat: 59.4264,
    lon: 16.0978
  },
  "hallstahammar": {
    lat: 59.6156,
    lon: 16.2261
  },
  "norberg": {
    lat: 60.0569,
    lon: 15.9164
  },
  "skinnskatteberg": {
    lat: 59.8294,
    lon: 15.7550
  },
  "surahammar": {
    lat: 59.7406,
    lon: 16.2528
  },
  // Dalarnas län (15 kommuner)
  "falun": {
    lat: 60.6066,
    lon: 15.6265
  },
  "borlänge": {
    lat: 60.4858,
    lon: 15.4378
  },
  "ludvika": {
    lat: 60.1497,
    lon: 15.1881
  },
  "avesta": {
    lat: 60.1456,
    lon: 16.1681
  },
  "mora": {
    lat: 61.0086,
    lon: 14.5428
  },
  "säter": {
    lat: 60.3475,
    lon: 15.7547
  },
  "hedemora": {
    lat: 60.2767,
    lon: 15.9911
  },
  "rättvik": {
    lat: 60.8844,
    lon: 15.1139
  },
  "orsa": {
    lat: 61.1192,
    lon: 14.6203
  },
  "älvdalen": {
    lat: 61.2267,
    lon: 14.0483
  },
  "malung-sälen": {
    lat: 60.6833,
    lon: 13.7167
  },
  "gagnef": {
    lat: 60.5739,
    lon: 15.0953
  },
  "leksand": {
    lat: 60.7308,
    lon: 14.9989
  },
  "vansbro": {
    lat: 60.5319,
    lon: 14.2808
  },
  "smedjebacken": {
    lat: 60.1436,
    lon: 15.4089
  },
  // Gävleborgs län (10 kommuner)
  "gävle": {
    lat: 60.6749,
    lon: 17.1413
  },
  "sandviken": {
    lat: 60.6167,
    lon: 16.7667
  },
  "söderhamn": {
    lat: 61.3039,
    lon: 17.0672
  },
  "hudiksvall": {
    lat: 61.7281,
    lon: 17.1050
  },
  "bollnäs": {
    lat: 61.3489,
    lon: 16.3931
  },
  "hofors": {
    lat: 60.5500,
    lon: 16.2800
  },
  "ovanåker": {
    lat: 61.3278,
    lon: 16.3669
  },
  "ockelbo": {
    lat: 60.8919,
    lon: 16.7169
  },
  "ljusdal": {
    lat: 61.8294,
    lon: 16.0869
  },
  "nordanstig": {
    lat: 61.7667,
    lon: 17.2833
  },
  // Västernorrlands län (7 kommuner)
  "sundsvall": {
    lat: 62.3908,
    lon: 17.3069
  },
  "härnösand": {
    lat: 62.6322,
    lon: 17.9383
  },
  "kramfors": {
    lat: 62.9333,
    lon: 17.7833
  },
  "sollefteå": {
    lat: 63.1686,
    lon: 17.2657
  },
  "örnsköldsvik": {
    lat: 63.2909,
    lon: 18.7155
  },
  "ånge": {
    lat: 62.5264,
    lon: 15.6639
  },
  "timrå": {
    lat: 62.4883,
    lon: 17.3308
  },
  // Jämtlands län (8 kommuner)
  "östersund": {
    lat: 63.1792,
    lon: 14.6357
  },
  "härjedalen": {
    lat: 62.0833,
    lon: 13.6833
  },
  "strömsund": {
    lat: 63.8486,
    lon: 15.5539
  },
  "åre": {
    lat: 63.3989,
    lon: 13.0819
  },
  "krokom": {
    lat: 63.3144,
    lon: 14.4597
  },
  "berg": {
    lat: 62.8667,
    lon: 14.3167
  },
  "bräcke": {
    lat: 62.7472,
    lon: 15.4192
  },
  "ragunda": {
    lat: 63.0000,
    lon: 16.1667
  },
  // Västerbottens län (15 kommuner)
  "umeå": {
    lat: 63.8258,
    lon: 20.2630
  },
  "skellefteå": {
    lat: 64.7507,
    lon: 20.9527
  },
  "lycksele": {
    lat: 64.5989,
    lon: 18.6733
  },
  "nordmaling": {
    lat: 63.5694,
    lon: 19.5014
  },
  "bjurholm": {
    lat: 63.9458,
    lon: 19.3092
  },
  "vindeln": {
    lat: 64.2069,
    lon: 19.7139
  },
  "robertsfors": {
    lat: 64.1986,
    lon: 20.8347
  },
  "norsjö": {
    lat: 64.9036,
    lon: 19.4825
  },
  "malå": {
    lat: 65.1825,
    lon: 18.7317
  },
  "storuman": {
    lat: 65.0944,
    lon: 17.1136
  },
  "sorsele": {
    lat: 65.5361,
    lon: 17.5406
  },
  "dorotea": {
    lat: 64.2575,
    lon: 16.4117
  },
  "vännäs": {
    lat: 63.9103,
    lon: 19.7586
  },
  "vilhelmina": {
    lat: 64.6233,
    lon: 16.6522
  },
  "åsele": {
    lat: 64.1661,
    lon: 17.3472
  },
  // Norrbottens län (14 kommuner)
  "luleå": {
    lat: 65.5848,
    lon: 22.1547
  },
  "piteå": {
    lat: 65.3197,
    lon: 21.4758
  },
  "boden": {
    lat: 65.8250,
    lon: 21.6886
  },
  "kalix": {
    lat: 65.8558,
    lon: 23.1472
  },
  "haparanda": {
    lat: 65.8347,
    lon: 24.1361
  },
  "kiruna": {
    lat: 67.8558,
    lon: 20.2253
  },
  "gällivare": {
    lat: 67.1333,
    lon: 20.6500
  },
  "jokkmokk": {
    lat: 66.6039,
    lon: 19.8258
  },
  "arjeplog": {
    lat: 66.0514,
    lon: 17.8858
  },
  "älvsbyn": {
    lat: 65.6758,
    lon: 21.0069
  },
  "pajala": {
    lat: 67.2139,
    lon: 23.3742
  },
  "övertorneå": {
    lat: 66.3881,
    lon: 23.6550
  },
  "arvidsjaur": {
    lat: 65.5903,
    lon: 19.1772
  },
  "överkalix": {
    lat: 66.3267,
    lon: 22.8453
  }
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function getMunicipalityCoords(location) {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(SWEDISH_MUNICIPALITIES)){
    if (normalized.includes(city)) return coords;
  }
  return null;
}
export class ScoringEngineV3 {
  /**
   * Quick scoring UTAN AI enrichment
   * Används för initial sorting innan AI enrichment
   * Baserat på: hierarchical concept_id, headline, occupation labels
   */ quickScore(job, cvOccupations, primaryConceptId, occupationGroupId, occupationFieldId) {
    let score = 0;
    // Faktor 1: Hierarchical Concept ID match (45p för snabb prioritering)
    const jobOccupationId = job.occupation?.concept_id;
    const jobGroupId = job.occupation_group?.concept_id;
    const jobFieldId = job.occupation_field?.concept_id;
    // Nivå 1: occupation-name exact match (45p)
    if (primaryConceptId && jobOccupationId === primaryConceptId) {
      score += 45;
    } else if (occupationGroupId && jobGroupId === occupationGroupId) {
      score += 35;
    } else if (occupationFieldId && jobFieldId === occupationFieldId) {
      score += 25;
    } else {
      for (const cvOcc of cvOccupations){
        if (cvOcc.concept_id && jobOccupationId === cvOcc.concept_id) {
          score += 40;
          break;
        }
      }
    }
    // Faktor 2: Headline match (25p)
    const headline = (job.headline || '').toLowerCase();
    for (const cvOcc of cvOccupations){
      if (headline.includes(cvOcc.normalized.toLowerCase())) {
        score += 25;
        break;
      }
    }
    // Faktor 3: Occupation label match (10p)
    const occupationLabel = (job.occupation?.label || job.occupation_field?.label || '').toLowerCase();
    for (const cvOcc of cvOccupations){
      if (occupationLabel.includes(cvOcc.normalized.toLowerCase()) || cvOcc.normalized.toLowerCase().includes(occupationLabel)) {
        score += 10;
        break;
      }
    }
    return score;
  }
  calculateScore(input) {
    const breakdown = {
      occupationLevel: 0,
      titleMatch: 0,
      skillsMatch: 0,
      geography: 0,
      mustHaveBonus: 0 // 0-5p
    };
    const explanation = [];
    let distance;
    // ========================================================================
    // FAKTOR 1: Occupation Level Match (45p) - HIERARCHICAL!
    // ========================================================================
    const primaryConceptId = input.taxonomyData?.conceptId;
    const occupationGroupId = input.taxonomyData?.occupationGroupId;
    const occupationFieldId = input.taxonomyData?.occupationFieldId;
    const jobOccupationId = input.job.occupation?.concept_id;
    const jobGroupId = input.job.occupation_group?.concept_id;
    const jobFieldId = input.job.occupation_field?.concept_id;
    // Nivå 1: occupation-name exact match (45p)
    if (primaryConceptId && jobOccupationId === primaryConceptId) {
      breakdown.occupationLevel = 45;
      explanation.push(`✅ Exakt yrkesmatch: ${input.job.occupation?.label} (45p)`);
    } else if (occupationGroupId && jobGroupId === occupationGroupId) {
      breakdown.occupationLevel = 35;
      explanation.push(`✅ Samma yrkesgrupp: ${input.job.occupation_group?.label} (35p)`);
    } else if (occupationFieldId && jobFieldId === occupationFieldId) {
      breakdown.occupationLevel = 25;
      explanation.push(`✅ Samma yrkesområde: ${input.job.occupation_field?.label} (25p)`);
    } else {
      for (const cvOcc of input.cvOccupations){
        if (cvOcc.concept_id && jobOccupationId === cvOcc.concept_id) {
          const points = cvOcc.confidence === 'high' ? 40 : 35;
          breakdown.occupationLevel = points;
          explanation.push(`✅ Alt. yrkesmatch (${cvOcc.confidence}): ${input.job.occupation?.label} (${points}p)`);
          break;
        }
      }
    }
    // SPECIAL: Om headline innehåller CV-yrket men ingen concept match (API-missklassificering)
    if (breakdown.occupationLevel === 0) {
      const jobHeadline = (input.job.headline || '').toLowerCase();
      for (const cvOcc of input.cvOccupations){
        if (jobHeadline.includes(cvOcc.normalized.toLowerCase())) {
          breakdown.occupationLevel = 30;
          explanation.push(`✅ Headline-match (bred API-kategori): ${cvOcc.normalized} (30p)`);
          break;
        }
      }
    }
    // ========================================================================
    // FAKTOR 2: Title Match (25p)
    // ========================================================================
    if (input.cvOccupations.length > 0) {
      const primaryOccupation = input.cvOccupations[0].normalized.toLowerCase();
      const jobOccupation = (input.job.occupation?.label || input.job.occupation_field?.label || '').toLowerCase();
      const jobHeadline = (input.job.headline || '').toLowerCase();
      const jobDescription = (input.job.description?.text || '').toLowerCase();
      // Exakt match i occupation-fält
      if (jobOccupation === primaryOccupation) {
        breakdown.titleMatch = 25;
        explanation.push(`✅ Exakt titel: ${input.job.occupation?.label || input.job.occupation_field?.label} (25p)`);
      } else if (jobOccupation.includes(primaryOccupation) || primaryOccupation.includes(jobOccupation)) {
        breakdown.titleMatch = 20;
        explanation.push(`✅ Liknande titel (20p)`);
      } else if (jobHeadline === primaryOccupation) {
        breakdown.titleMatch = 23;
        explanation.push(`✅ Exakt rubrik: "${primaryOccupation}" (23p)`);
      } else if (jobHeadline.includes(primaryOccupation)) {
        breakdown.titleMatch = 18;
        explanation.push(`✅ Rubrik innehåller: "${primaryOccupation}" (18p)`);
      } else if (jobDescription.includes(primaryOccupation)) {
        breakdown.titleMatch = 10;
        explanation.push(`✅ Yrke i beskrivning (10p)`);
      }
      // Kolla även andra CV-yrken
      if (breakdown.titleMatch < 15) {
        for(let i = 1; i < input.cvOccupations.length; i++){
          const altOccupation = input.cvOccupations[i].normalized.toLowerCase();
          if (jobHeadline.includes(altOccupation)) {
            const points = 15;
            breakdown.titleMatch = Math.max(breakdown.titleMatch, points);
            explanation.push(`✅ Alt. roll i rubrik: "${altOccupation}" (${points}p)`);
            break;
          }
        }
      }
    }
    // ========================================================================
    // FAKTOR 3: Skills Match (15p)
    // ========================================================================
    let matchedSkills = 0;
    const matchedSkillNames = [];
    let mustHaveMatches = 0;
    if (input.cvSkills && input.cvSkills.length > 0) {
      // PRIORITET 1: Kolla strukturerad must_have data från JobSearch API
      if (input.job.must_have?.skills && input.job.must_have.skills.length > 0) {
        const mustHaveLabels = input.job.must_have.skills.map((s)=>s.label.toLowerCase());
        for (const cvSkill of input.cvSkills){
          if (mustHaveLabels.some((label)=>label.includes(cvSkill.toLowerCase()) || cvSkill.toLowerCase().includes(label))) {
            matchedSkills++;
            mustHaveMatches++;
            matchedSkillNames.push(cvSkill);
          }
        }
      }
      // PRIORITET 2: Kolla nice_to_have
      if (input.job.nice_to_have?.skills && input.job.nice_to_have.skills.length > 0) {
        const niceToHaveLabels = input.job.nice_to_have.skills.map((s)=>s.label.toLowerCase());
        for (const cvSkill of input.cvSkills){
          if (!matchedSkillNames.includes(cvSkill)) {
            if (niceToHaveLabels.some((label)=>label.includes(cvSkill.toLowerCase()) || cvSkill.toLowerCase().includes(label))) {
              matchedSkills++;
              matchedSkillNames.push(cvSkill);
            }
          }
        }
      }
      // FALLBACK: Text-baserad matching
      if (matchedSkills === 0) {
        const jobText = `${input.job.headline || ''} ${input.job.description?.text || ''}`.toLowerCase();
        for (const skill of input.cvSkills){
          if (jobText.includes(skill.toLowerCase())) {
            matchedSkills++;
            matchedSkillNames.push(skill);
          }
        }
      }
      // Poängsättning
      if (matchedSkills >= 4) {
        breakdown.skillsMatch = 15;
        explanation.push(`✅ ${matchedSkills} skills: ${matchedSkillNames.slice(0, 3).join(', ')}${matchedSkills > 3 ? '...' : ''} (15p)`);
      } else if (matchedSkills === 3) {
        breakdown.skillsMatch = 12;
        explanation.push(`✅ ${matchedSkills} skills: ${matchedSkillNames.join(', ')} (12p)`);
      } else if (matchedSkills === 2) {
        breakdown.skillsMatch = 8;
        explanation.push(`✅ ${matchedSkills} skills: ${matchedSkillNames.join(', ')} (8p)`);
      } else if (matchedSkills === 1) {
        breakdown.skillsMatch = 4;
        explanation.push(`✅ 1 skill: ${matchedSkillNames[0]} (4p)`);
      }
    }
    // ========================================================================
    // FAKTOR 4: Geography (10p)
    // ========================================================================
    const REMOTE_KEYWORDS = [
      "distans",
      "remote",
      "hemarbete",
      "hemifrån"
    ];
    const jobText = `${input.job.headline || ''} ${input.job.description?.text || ''}`.toLowerCase();
    const isRemote = REMOTE_KEYWORDS.some((keyword)=>jobText.includes(keyword));
    if (isRemote) {
      breakdown.geography = 10;
      explanation.push(`✅ Remote-jobb (10p)`);
    } else if (input.cvLocation && input.job.workplace_address?.municipality) {
      const cvCoords = getMunicipalityCoords(input.cvLocation);
      const jobCoords = getMunicipalityCoords(input.job.workplace_address.municipality);
      if (cvCoords && jobCoords) {
        distance = calculateDistance(cvCoords.lat, cvCoords.lon, jobCoords.lat, jobCoords.lon);
        if (distance < 10) {
          breakdown.geography = 10;
          explanation.push(`✅ Samma stad: ${Math.round(distance)}km (10p)`);
        } else if (distance < 30) {
          breakdown.geography = 8;
          explanation.push(`✅ <30km: ${Math.round(distance)}km (8p)`);
        } else if (distance < 50) {
          breakdown.geography = 6;
          explanation.push(`⚠️ <50km: ${Math.round(distance)}km (6p)`);
        } else if (distance < 100) {
          breakdown.geography = 3;
          explanation.push(`⚠️ <100km: ${Math.round(distance)}km (3p)`);
        } else {
          breakdown.geography = 1;
          explanation.push(`❌ För långt: ${Math.round(distance)}km (1p)`);
        }
      }
    }
    // ========================================================================
    // FAKTOR 5: Must-Have Bonus (5p)
    // ========================================================================
    if (mustHaveMatches >= 2) {
      breakdown.mustHaveBonus = 5;
      explanation.push(`🌟 ${mustHaveMatches} must-have skills (+5p)`);
    }
    // ========================================================================
    // TOTAL BERÄKNING
    // ========================================================================
    const total = Math.min(100, Math.round(breakdown.occupationLevel + breakdown.titleMatch + breakdown.skillsMatch + breakdown.geography + breakdown.mustHaveBonus));
    return {
      total,
      breakdown,
      explanation,
      distance
    };
  }
}
