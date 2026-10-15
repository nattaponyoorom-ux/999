/* เครื่องคำนวณราคา — สูตรทั้งหมดอ่านจาก DB.pricing ที่เจ้าหน้าที่ตั้งค่าในหลังบ้าน
   ตัวแปรในสูตร: km totalKm legs qty nights days pricePerKm minPrice seats charter attach rent subtotal + ตัวแปรคงที่ที่ตั้งเอง
   ฟังก์ชัน: max min round ceil floor abs   เช่น  subtotal*0.07  หรือ  qty>5 ? 2000 : 0 */
const FX=['max','min','round','ceil','floor','abs'];
function evalFormula(expr,scope){
  expr=String(expr||'').trim(); if(!expr) return 0;
  if(!/^[\w\s+\-*/%().,<>=!&|?:]*$/.test(expr)||/constructor|prototype|__/.test(expr)) throw new Error('สูตรมีอักขระที่ไม่อนุญาต');
  const names=Object.keys(scope);
  const r=new Function(...names,...FX,'"use strict";return ('+expr+');')(...names.map(n=>scope[n]),...FX.map(n=>Math[n]));
  if(typeof r==='boolean') return r?1:0;
  if(!Number.isFinite(r)) throw new Error('ผลลัพธ์ไม่ใช่ตัวเลข');
  return r;
}
function quote(f,strict){
  const P=DB.pricing, c=car(f.carId); if(!c) return null;
  const km=Math.max(distance(f.from,f.to),P.minDistance), legs=f.roundTrip?2:1, totalKm=km*legs;
  const sc={km,totalKm,legs,qty:f.qty,nights:f.nights,days:Math.max(1,f.nights+1),pricePerKm:c.pricePerKm,minPrice:c.minPrice,
    seats:c.seats,charter:f.mode==='charter'?1:0,attach:f.mode==='charter'?0:1,rent:0,subtotal:0};
  (P.consts||[]).forEach(x=>{sc[x.k]=+x.v||0});
  const minApplied=c.pricePerKm*totalKm*f.qty<c.minPrice*f.qty*legs;
  const rent=evalFormula(P.rent,sc); sc.rent=rent; sc.subtotal=rent;
  const items=[{t:`ค่าเช่า ${c.name} × ${f.qty} ตู้`,
    d:minApplied?`คิดตามอัตราขั้นต่ำ ${num(c.minPrice)} บาท/ตู้/เที่ยว`:`${num(c.pricePerKm)} บาท/กม. × ${num(totalKm)} กม. × ${f.qty} ตู้`,v:rent}];
  (P.fees||[]).filter(x=>x.on).forEach(x=>{
    let v=0; try{v=evalFormula(x.formula,sc)}catch(e){ if(strict) throw new Error(`"${x.name}": ${e.message}`); console.warn(x.name,e.message); }
    if(v){items.push({t:x.name,d:x.desc||x.formula,v}); sc.subtotal+=v;}
  });
  return {km,totalKm,legs,items,sub:sc.subtotal,total:sc.subtotal,carriage:c,minApplied,form:f};
}
