// Fuentes oficiales enlazadas en cada ficha. Precios NO cotizados: el usuario los introduce.
const msi = (family, slug) => `https://www.msi.com/${family}/${slug}/Specification`;
const amd = slug => `https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-${slug}.html`;
const nv3 = 'https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd';
const corsairCase = 'https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-black-cc-9011200-ww';
export const SLOTS = [
  ['cpu','Procesador','CPU','◈'], ['board','Placa madre','BOARD','▦'],
  ['ram','Memoria','RAM','▤'], ['gpu','Gráfica','GPU','▣'],
  ['ssd','SSD principal','SSD','▬'], ['psu','Fuente','PSU','ϟ'],
  ['case','Gabinete','CASE','▥'], ['cooler','Refrigeración','COOL','❄'],
  ['ssd2','Segundo SSD','SSD +','⊕'], ['fan','Ventilador extra','FAN','✳'],
  ['monitor','Monitor','PANTALLA','▱'], ['keyboard','Teclado','TECLADO','⌨'],
  ['mouse','Mouse','MOUSE','◒'], ['headset','Audífonos','AUDIO','Ω'],
].map(([id,name,short,icon]) => ({id,name,short,icon,type:id==='ssd2'?'ssd':id}));
const row = (id,type,brand,name,source,data) => ({id,type,brand,name,source,color:'#57efcf',watts:0,...data});
export const CATALOG = [
  row('7600','cpu','AMD','Ryzen 5 7600',amd('5-7600'),{
    socket:'AM5',memory:'DDR5',cores:6,threads:12,stock:true,tdp:65,watts:90,dim:[40,40,5],
    notes:'La presentación retail en caja incluye Wraith Stealth. Las versiones OEM pueden diferir.',
    specs:{Socket:'AM5',Núcleos:'6 / 12 hilos',Memoria:'DDR5',TDP:'65 W',Disipador:'Wraith Stealth (retail)'},
  }),
  row('7600x','cpu','AMD','Ryzen 5 7600X',amd('5-7600x'),{
    socket:'AM5',memory:'DDR5',cores:6,threads:12,stock:false,tdp:105,watts:145,dim:[40,40,5],
    notes:'Necesita refrigeración adicional. El TDP no equivale al consumo eléctrico máximo.',
    specs:{Socket:'AM5',Núcleos:'6 / 12 hilos',Memoria:'DDR5',TDP:'105 W',Disipador:'No incluido'},
  }),
  row('7700','cpu','AMD','Ryzen 7 7700',amd('7-7700'),{
    socket:'AM5',memory:'DDR5',cores:8,threads:16,stock:false,stockUnknown:true,tdp:65,watts:90,dim:[40,40,5],
    notes:'Comprueba el contenido del SKU exacto. El simulador no da por incluido un disipador en este modelo.',
    specs:{Socket:'AM5',Núcleos:'8 / 16 hilos',Memoria:'DDR5',TDP:'65 W',Disipador:'Verificar SKU'},
  }),
  row('b650m','board','MSI','PRO B650M-A WIFI',msi('Motherboard','PRO-B650M-A-WIFI'),{
    socket:'AM5',memory:'DDR5',form:'mATX',maxRam:256,slots:4,nvme:2,headers:3,watts:45,dim:[244,244,30],
    notes:'Dos puertos M.2 disponibles con los Ryzen 7000 del catálogo. Revisa BIOS y lista de memoria validada.',
    specs:{Socket:'AM5',Memoria:'DDR5 · 4 DIMM',Formato:'micro-ATX',Almacenamiento:'2 × M.2',Red:'Wi-Fi 6E'},
  }),
  row('tomahawk','board','MSI','MAG B650 TOMAHAWK WIFI',msi('Motherboard','MAG-B650-TOMAHAWK-WIFI'),{
    socket:'AM5',memory:'DDR5',form:'ATX',maxRam:256,slots:4,nvme:3,headers:6,watts:55,dim:[244,305,35],
    notes:'Placa ATX: no cabe en el Q300L. BIOS y perfiles de memoria requieren verificación adicional.',
    specs:{Socket:'AM5',Memoria:'DDR5 · 4 DIMM',Formato:'ATX',Almacenamiento:'3 × M.2',Red:'Wi-Fi 6E'},
  }),
  row('corsair32','ram','Corsair','Vengeance DDR5 32 GB', 'https://www.corsair.com/us/en/p/memory/cmk32gx5m2b5600c36/vengeance-32gb-2x16gb-ddr5-dram-5600mhz-c36-memory-kit-black-cmk32gx5m2b5600c36',{
    memory:'DDR5',capacity:32,modules:2,height:35,watts:10,dim:[135,35,7],
    notes:'CMK32GX5M2B5600C36. 5600 MT/s es el perfil anunciado; no se garantiza esa velocidad por encajar físicamente.',
    specs:{Generación:'DDR5',Capacidad:'32 GB',Kit:'2 × 16 GB',Perfil:'5600 MT/s · CL36',SKU:'CMK32GX5M2B5600C36'},
  }),
  row('lpx16','ram','Corsair','Vengeance LPX DDR4 16 GB','https://www.corsair.com/us/en/p/memory/cmk16gx4m2b3200c16/vengeancea-lpx-16gb-2-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk16gx4m2b3200c16',{
    memory:'DDR4',capacity:16,modules:2,height:34,watts:8,dim:[135,34,7],color:'#b899ff',
    notes:'Referencia DDR4 para comparar generaciones. Ninguna placa AM5 de este catálogo la admite.',
    specs:{Generación:'DDR4',Capacidad:'16 GB',Kit:'2 × 8 GB',Perfil:'3200 MT/s · CL16',SKU:'CMK16GX4M2B3200C16'},
  }),
  row('4060','gpu','MSI','RTX 4060 VENTUS 2X BLACK 8G OC',msi('Graphics-Card','GeForce-RTX-4060-VENTUS-2X-BLACK-8G-OC'),{
    watts:120,length:199,connector:'8pin',minPsu:550,fans:2,dim:[199,120,41],
    notes:'MSI indica 115 o 120 W; usamos 120 W como referencia. Conector de 8 pines.',
    specs:{VRAM:'8 GB GDDR6',Dimensiones:'199 × 120 × 41 mm',Alimentación:'1 × 8 pines',Fuente:'550 W recomendados',Video:'HDMI + 3 DisplayPort'},
  }),
  row('4070','gpu','MSI','RTX 4070 VENTUS 2X 12G OC',msi('Graphics-Card','GeForce-RTX-4070-VENTUS-2X-12G-OC'),{
    watts:200,length:242,connector:'8pin',minPsu:650,fans:2,dim:[242,125,43],color:'#b899ff',
    notes:'Este modelo específico utiliza un conector de 8 pines. Otros modelos RTX 4070 pueden variar.',
    specs:{VRAM:'12 GB GDDR6X',Dimensiones:'242 × 125 × 43 mm',Alimentación:'1 × 8 pines',Fuente:'650 W recomendados',Video:'HDMI + 3 DisplayPort'},
  }),
  row('4070super','gpu','MSI','RTX 4070 SUPER GAMING X SLIM',msi('Graphics-Card','GeForce-RTX-4070-SUPER-12G-GAMING-X-SLIM'),{
    watts:245,length:307,connector:'16pin',minPsu:650,fans:3,dim:[307,125,46],color:'#ed81c8',
    notes:'Ficha MSI: 245 W y un conector de 16 pines. Los adaptadores requieren comprobación manual.',
    specs:{VRAM:'12 GB GDDR6X',Dimensiones:'307 × 125 × 46 mm',Alimentación:'1 × 16 pines',Fuente:'650 W recomendados',Video:'HDMI + 3 DisplayPort'},
  }),
  ...[500,1000,2000,4000].map(gb=>row(`nv3-${gb}`,'ssd','Kingston',`NV3 ${gb<1000?'500 GB':`${gb/1000} TB`}`,nv3,{
    capacity:gb,watts:6,dim:[80,22,2],notes:'Seleccionada la versión M.2 2280, no la variante 2230. Se utiliza un puerto M.2 por unidad.',
    specs:{Capacidad:gb<1000?'500 GB':`${gb/1000} TB`,Formato:'M.2 2280',Interfaz:'PCIe 4.0 ×4 NVMe',SKU:`SNV3S/${gb<1000?'500G':`${gb/1000}T`}`},
  })),
  row('a650','psu','MSI','MAG A650BN',msi('Power-Supply','MAG-A650BN'),{
    power:650,pin8:2,pin16:0,length:140,form:'ATX',dim:[150,86,140],
    notes:'Dos conectores PCIe 6+2. No tiene salida nativa de 16 pines. Cableado fijo.',
    specs:{Potencia:'650 W',Formato:'ATX · 140 mm',Certificación:'80 PLUS Bronze',GPU:'2 × 6+2 pines',Cableado:'Fijo'},
  }),
  row('a750','psu','MSI','MAG A750BN PCIE5',msi('Power-Supply','MAG-A750BN-PCIE5'),{
    power:750,pin8:2,pin16:1,pin16Limit:300,length:140,form:'ATX',dim:[150,86,140],color:'#b899ff',
    notes:'Su cable nativo de 16 pines está especificado para 300 W, no para cualquier GPU de alto consumo.',
    specs:{Potencia:'750 W',Formato:'ATX · 140 mm',Certificación:'80 PLUS Bronze',GPU:'16 pines (300 W) + 2 × 6+2',Cableado:'Fijo'},
  }),
  row('q300l','case','Cooler Master','MasterBox Q300L','https://www.coolermaster.com/en-global/products/masterbox-q300l.html',{
    forms:['mATX','ITX'],gpuMax:360,coolerMax:159,psuMax:160,fanSlots:6,includedFans:1,rad:{front:[120,240],top:[]},dim:[230,381,387],style:'compact',watts:3,
    notes:'Chasis compacto con lateral acrílico. Para AIO de 240 mm se utiliza el frontal.',
    specs:{Formato:'Mini Tower',Placas:'micro-ATX / Mini-ITX',GPU:'Hasta 360 mm',Disipador:'Hasta 159 mm',Fuente:'ATX · hasta 160 mm'},
  }),
  row('4000d','case','Corsair','4000D Airflow',corsairCase,{
    forms:['ATX','mATX','ITX'],gpuMax:360,coolerMax:170,psuMax:220,fanSlots:6,includedFans:2,rad:{front:[120,240,280,360],top:[120,240,280]},dim:[230,466,453],style:'airflow',watts:6,
    notes:'Torre ATX con cristal templado y frontal ventilado. La vista 3D es interpretativa.',
    specs:{Formato:'Mid Tower',Placas:'ATX / micro-ATX / Mini-ITX',GPU:'Hasta 360 mm',Disipador:'Hasta 170 mm',Fuente:'ATX · hasta 220 mm'},
  }),
  row('ak400','cooler','DeepCool','AK400','https://www.deepcool.com/products/Cooling/cpuaircoolers/AK400-Performance-CPU-Cooler-1700-AM5/2021/15222.shtml',{
    kind:'air',sockets:['AM5','AM4'],height:155,towers:1,fans:1,watts:2,dim:[127,155,97],
    notes:'Torre de 155 mm. En este catálogo verificamos AM4/AM5; revisa la revisión y el kit de montaje.',
    specs:{Tipo:'Aire · una torre',Altura:'155 mm',Ventiladores:'1 × 120 mm',Heatpipes:'4',Montaje:'AM4 / AM5'},
  }),
  row('ak620','cooler','DeepCool','AK620','https://www.deepcool.com/products/Cooling/cpuaircoolers/AK620-High-Performance-CPU-Cooler-1700-AM5/2021/13067.shtml',{
    kind:'air',sockets:['AM5','AM4'],height:160,towers:2,fans:2,watts:3,dim:[129,160,138],color:'#b899ff',
    notes:'Doble torre de 160 mm: excede los 159 mm del Q300L. Verificar espacio sobre la RAM.',
    specs:{Tipo:'Aire · doble torre',Altura:'160 mm',Ventiladores:'2 × 120 mm',Heatpipes:'6',Montaje:'AM4 / AM5'},
  }),
  row('h100i','cooler','Corsair','iCUE H100i RGB ELITE','https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/icue-h100i-rgb-elite-liquid-cpu-cooler-cw-9060058-ww',{
    kind:'aio',sockets:['AM5','AM4'],rad:240,thickness:52,fans:2,watts:12,dim:[277,120,52],color:'#ed81c8',
    notes:'Radiador de 27 mm y ventiladores de 25 mm. Montaje frontal en la simulación; reduce 52 mm el espacio de GPU por criterio conservador.',
    specs:{Tipo:'Líquida AIO',Radiador:'240 mm',Grosor:'27 + 25 mm (ventiladores)',Ventiladores:'2 × 120 mm',Montaje:'AM4 / AM5'},
  }),
  row('p12','fan','ARCTIC','P12 PWM PST','https://www.arctic.de/en/P12-PWM-PST/ACFAN00120A',{
    size:120,watts:2,dim:[120,120,25],notes:'Una unidad extra de 120 mm. Revisa posición libre y corriente disponible del header antes de instalar.',
    specs:{Tamaño:'120 mm',Conexión:'4 pines PWM',PST:'Conexión en cadena',Cantidad:'1 unidad'},
  }),
  row('g244','monitor','MSI','G244F E2',msi('Monitor','G244F-E2'),{
    external:true,inputs:['HDMI','DP'],dim:[541.9,424.3,231.9],notes:'Full HD hasta 180 Hz por HDMI o DisplayPort según ficha. El monitor utiliza alimentación externa, no la fuente interna de la PC.',
    specs:{Panel:'23.8 pulgadas · Rapid IPS',Resolución:'1920 × 1080',Frecuencia:'Hasta 180 Hz',Entradas:'HDMI 2.0b / DisplayPort 1.2a'},
  }),
  row('g274','monitor','MSI','G274QPF E2',msi('Monitor','G274QPF-E2'),{
    external:true,inputs:['HDMI','DP'],dim:[613.5,406.6,227.9],color:'#b899ff',notes:'QHD hasta 180 Hz por DisplayPort y hasta 144 Hz por HDMI. USB-C requiere salida DP Alt Mode: no se presupone en la placa.',
    specs:{Panel:'27 pulgadas · Rapid IPS',Resolución:'2560 × 1440',Frecuencia:'180 Hz DP / 144 Hz HDMI',Entradas:'HDMI / DP / USB-C DP Alt'},
  }),
  row('g213','keyboard','Logitech','G213 Prodigy','https://www.logitechg.com/en-us/shop/p/g213-rgb-gaming-keyboard.920-008083',{
    external:true,usb:true,dim:[452,218,33],notes:'Teclado USB con reposamuñecas integrado. Comprueba distribución de teclas e idioma del SKU que compres.',
    specs:{Conexión:'USB con cable',Teclas:'Mech-Dome',Iluminación:'LIGHTSYNC RGB',Formato:'Completo'},
  }),
  row('g203','mouse','Logitech','G203 LIGHTSYNC','https://www.logitechg.com/en-us/shop/p/g203-lightsync-rgb-gaming-mouse',{
    external:true,usb:true,dim:[62,117,38],notes:'Mouse USB con seis botones. Las funciones avanzadas de personalización requieren software compatible.',
    specs:{Conexión:'USB con cable',Botones:'6',Sensor:'200–8000 DPI',Iluminación:'LIGHTSYNC RGB'},
  }),
  row('g432','headset','Logitech','G432','https://www.logitechg.com/en-us/shop/p/g432-7-1-surround-sound-gaming-headset.981-000769',{
    external:true,usb:true,dim:[182,172,82],notes:'Audífonos con cable. Revisa el adaptador USB y los accesorios incluidos en la presentación adquirida.',
    specs:{Conexión:'USB / 3.5 mm',Micrófono:'Integrado',Tipo:'Over-ear',Uso:'Audio y comunicación'},
  }),
];
export const BY_ID = Object.fromEntries(CATALOG.map(p=>[p.id,p]));
export const money = n => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
