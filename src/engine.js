import {BY_ID,SLOTS} from './catalog.js';
export const PARTS = ids => Object.fromEntries(Object.entries(ids).filter(([slot,id])=>SLOTS.some(s=>s.id===slot&&s.type===BY_ID[id]?.type)).map(([slot,id])=>[slot,BY_ID[id]]));
export function inspect(ids) {
  const b=PARTS(ids), errors=[], warnings=[];
  const add=(test,message)=>{if(test)errors.push(message);};
  const {cpu,board,ram,gpu,psu,cooler,fan}=b, box=b.case;
  add(cpu&&board&&cpu.socket!==board.socket,'El socket del procesador no coincide con el de la placa.');
  add(cpu&&ram&&cpu.memory!==ram.memory,`${cpu?.name} requiere ${cpu?.memory}; este kit es ${ram?.memory}.`);
  add(board&&ram&&board.memory!==ram.memory,`La placa utiliza ${board?.memory}; la RAM es ${ram?.memory}.`);
  add(board&&ram&&(ram.modules>board.slots||ram.capacity>board.maxRam),'El kit supera las ranuras o la capacidad de RAM de la placa.');
  add(board&&box&&!box.forms.includes(board.form),`${board?.form} no cabe en ${box?.name}.`);
  add(cpu&&cooler&&!cooler.sockets.includes(cpu.socket),'El disipador no admite el socket del procesador.');
  add(box&&cooler?.kind==='air'&&cooler.height>box.coolerMax,`${cooler?.name} mide ${cooler?.height} mm; ${box?.name} permite ${box?.coolerMax} mm.`);
  add(box&&cooler?.kind==='aio'&&!box.rad.front.includes(cooler.rad),'El gabinete no admite ese radiador en el frontal, posición usada por el simulador.');
  const gpuSpace=box?box.gpuMax-(cooler?.kind==='aio'?cooler.thickness:0):null;
  add(gpu&&box&&gpu.length>gpuSpace,`La GPU mide ${gpu?.length} mm; quedan ${gpuSpace} mm con esta refrigeración.`);
  add(psu&&box&&psu.length>box.psuMax,'La fuente supera la longitud máxima del gabinete.');
  const drives=Number(!!b.ssd)+Number(!!b.ssd2);
  add(board&&drives>board.nvme,'No hay suficientes puertos M.2 para las unidades seleccionadas.');
  add(gpu&&psu&&gpu.connector==='8pin'&&psu.pin8<1,'Falta el conector PCIe de 8 pines.');
  if(gpu&&psu&&gpu.connector==='16pin') {
    if(!psu.pin16) warnings.push('La GPU necesita 16 pines. Verifica adaptador oficial, cables independientes y sus requisitos; no se ha validado ese montaje.');
    else add(gpu.watts>psu.pin16Limit,'La GPU supera la potencia especificada para el cable nativo de 16 pines.');
  }
  const fanUse=(box?.includedFans||0)+(cooler?.kind==='aio'?2:0)+(fan?1:0);
  add(box&&fanUse>box.fanSlots,'No quedan posiciones para todos los ventiladores del montaje conservador.');
  if(fan) warnings.push('Verifica posición de 120 mm libre y corriente del header; no se supone un splitter incluido.');
  const watts=Object.values(b).reduce((n,p)=>n+p.watts,0);
  const power=Math.max(gpu?.minPsu||0,Math.ceil(watts*1.3/50)*50);
  add(psu&&psu.power<power,`Fuente insuficiente: se requieren al menos ${power} W según las referencias de GPU y el margen del simulador.`);
  if(cpu&&board) warnings.push('Verifica BIOS compatible con el CPU exacto antes de comprar.');
  if(ram&&board) warnings.push('Revisa QVL y perfil de RAM: la velocidad anunciada no está garantizada.');
  if(cooler?.kind==='air'&&ram) warnings.push('Verifica altura de RAM bajo el ventilador del disipador.');
  if(cooler?.kind==='aio') warnings.push('Verifica cables USB/SATA, tubos y montaje real; el espacio de GPU usa una resta conservadora.');
  if(cpu?.stockUnknown&&!cooler) warnings.push('Comprueba si el SKU de CPU incluye disipador. El simulador no lo da por incluido.');
  if(b.monitor&&gpu) warnings.push('Conecta el monitor a la GPU. Verifica cable y frecuencia máxima según HDMI o DisplayPort.');
  if(Object.values(b).some(p=>p.usb)) warnings.push('Comprueba puertos USB libres y compatibilidad del software de periféricos con tu sistema operativo.');
  const required=['cpu','board','ram','gpu','ssd','psu','case'];
  const missing=required.filter(s=>!b[s]).map(s=>SLOTS.find(x=>x.id===s).name);
  if(!cooler&&!cpu?.stock)missing.push('Refrigeración');
  return {b,errors:[...new Set(errors)],warnings:[...new Set(warnings)],missing,watts,power,gpuSpace,stock:!!cpu?.stock&&!cooler};
}
export function cost(ids,prices,extras=0) {
  const parts=Object.values(PARTS(ids));
  const known=parts.filter(p=>Number.isFinite(prices[p.id])&&prices[p.id]>=0);
  return {subtotal:known.reduce((sum,p)=>sum+prices[p.id],0),pc:known.filter(p=>!p.external).reduce((n,p)=>n+prices[p.id],0),accessories:known.filter(p=>p.external).reduce((n,p)=>n+prices[p.id],0),total:known.reduce((sum,p)=>sum+prices[p.id],0)+extras,unknown:parts.length-known.length};
}
