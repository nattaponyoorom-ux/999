/* หน้าลูกค้า: Router + หน้าจอทั้งหมด (หน้าแรก / ตู้รถไฟ / คำนวณ / ผลลัพธ์ / FAQ) */
let STATE={};
window.addEventListener('hashchange',render);
window.addEventListener('load',render);
function render(){
  const h=(location.hash||'#/').slice(2).split('/');
  document.querySelectorAll('.lk').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+h[0]));
  document.getElementById('nav').classList.remove('open');
  const app=document.getElementById('app');
  const r=h[0];
  if(r==='') app.innerHTML=viewHome();
  else if(r==='catalog') app.innerHTML=viewCatalog();
  else if(r==='carriage') app.innerHTML=viewDetail(h[1]);
  else if(r==='calc'){app.innerHTML=viewCalc(h[1]);initCalc();}
  else if(r==='result'){app.innerHTML=viewResult();}
  else if(r==='faq') app.innerHTML=viewFaq();
  else app.innerHTML='<div class="wrap"><section><h2>404 — ไม่พบหน้าที่ต้องการ</h2></section></div>';
  window.scrollTo(0,0);
}


function viewHome(){
  const top=DB.carriages.slice(0,3).map(cardHTML).join('');
  return `
  <div class="hero"><div class="wrap"><div class="hero-in">
    <div>
      <div class="tagpill">⚡ ประเมินราคาทันที ไม่ต้องสมัครสมาชิก</div>
      <h1>คำนวณ<em>ค่าเช่าตู้รถไฟ</em><br>ได้ด้วยตัวเอง ภายใน 30 วินาที</h1>
      <p>เลือกประเภทตู้ ระบุสถานีต้นทาง–ปลายทาง ระบบจะคำนวณระยะทางจริงและประเมินค่าบริการแบบแยกรายการให้ทันที พร้อมบันทึกเป็นเอกสาร PDF เพื่อใช้ประกอบการวางแผนงบประมาณ</p>
      <div class="hero-cta">
        <a href="#/calc" class="btn btn-g">🧮 คำนวณค่าเช่ารถไฟ คลิกที่นี่</a>
        <a href="#/catalog" class="btn btn-o">🚃 ดูประเภทตู้รถไฟทั้งหมด</a>
      </div>
    </div>
    <div class="train-art">
      <div style="display:flex;justify-content:space-between;color:var(--mut);font-size:13px"><span>SRT PRESTIGE</span><span>CAR NO. 01</span></div>
      <div class="win"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div style="display:flex;justify-content:space-between;align-items:center;color:var(--gold2);font-weight:700">
        <span>🚆 ${DB.stations.length} สถานี</span><span>${DB.carriages.length} ประเภทตู้</span>
      </div>
      <div class="rail"></div>
    </div>
  </div></div></div>

  <div class="wrap"><div class="feat">
    <div class="fcard"><div class="ico">⏱️</div><b>ประเมินราคา 24 ชม.</b><small>ใช้งานได้ตลอดเวลาโดยไม่ต้องเข้าสู่ระบบ</small></div>
    <div class="fcard"><div class="ico">📋</div><b>ข้อมูลตู้ครบถ้วน</b><small>ความจุ สิ่งอำนวยความสะดวก และข้อจำกัด</small></div>
    <div class="fcard"><div class="ico">📐</div><b>คำนวณตามระยะทางจริง</b><small>อ้างอิงระยะทางสะสมรายสถานี</small></div>
    <div class="fcard"><div class="ico">🧾</div><b>บิลแยกรายการ</b><small>โปร่งใส พิมพ์/บันทึก PDF ได้ทันที</small></div>
  </div></div>

  <div class="wrap"><section>
    <div class="sec-h"><div><h2>ตู้รถไฟยอดนิยม</h2><p>เลือกดูรายละเอียดหรือกดคำนวณค่าเช่าได้ทันที</p></div>
      <a href="#/catalog" class="btn btn-o btn-s">ดูทั้งหมด →</a></div>
    <div class="grid3">${top}</div>
  </section></div>

  <div class="wrap"><section style="padding-top:0">
    <div class="panel" style="background:linear-gradient(135deg,#EAF3FF,#FFF1E6);text-align:center;padding:38px">
      <h2 style="font-size:25px;margin-bottom:8px">พร้อมวางแผนการเดินทางของคุณแล้วหรือยัง?</h2>
      <p style="color:var(--mut);margin-bottom:20px">กรอกข้อมูลเพียง 4 ช่อง ก็ทราบค่าบริการเบื้องต้นได้ทันที</p>
      <a href="#/calc" class="btn btn-g">เริ่มคำนวณค่าบริการ →</a>
    </div>
  </section></div>`;
}

function cardHTML(c){
  const img=c.images&&c.images[0]?`<img src="${esc(c.images[0])}" alt="${esc(c.name)}">`:c.emoji||'🚃';
  return `<div class="card">
    <div class="thumb">${img}${c.tag?`<span class="badge">${esc(c.tag)}</span>`:''}</div>
    <div class="card-b">
      <div><h3>${esc(c.name)}</h3><small style="color:var(--mut)">รหัสตู้ ${esc(c.code||'-')}</small></div>
      <div class="cap"><i>💺 ${num(c.seats)} ที่นั่ง</i>${c.beds>0?`<i>🛏️ ${num(c.beds)} ที่นอน</i>`:''}</div>
      <div class="fx">${(c.fac||[]).slice(0,4).map(f=>`<span class="chip">${esc(f)}</span>`).join('')}${(c.fac||[]).length>4?`<span class="chip">+${c.fac.length-4}</span>`:''}</div>
      <div class="price"><b>${num(c.pricePerKm)}</b><small>บาท/กม. · ขั้นต่ำ ${num(c.minPrice)} บาท</small></div>
      <div class="card-act">
        <a href="#/carriage/${c.id}" class="btn btn-o btn-s">ดูรายละเอียด</a>
        <a href="#/calc/${c.id}" class="btn btn-g btn-s">คำนวณค่าเช่าตู้นี้</a>
      </div>
    </div></div>`;
}

function viewCatalog(){
  return `<div class="wrap"><section>
    <div class="sec-h"><div><h2>รายการประเภทตู้รถไฟ</h2>
      <p>ทั้งหมด ${DB.carriages.length} ประเภท · ข้อมูลความจุและสิ่งอำนวยความสะดวกอัปเดตจากระบบหลังบ้าน</p></div></div>
    <div class="grid3">${DB.carriages.map(cardHTML).join('')}</div>
  </section></div>`;
}

function viewDetail(id){
  const c=car(id); if(!c) return '<div class="wrap"><section><h2>ไม่พบข้อมูลตู้รถไฟ</h2></section></div>';
  const imgs=(c.images&&c.images.length)?c.images:[];
  const big=imgs[0]?`<img src="${esc(imgs[0])}" id="gbigimg">`:(c.emoji||'🚃');
  return `<div class="wrap"><section>
    <a href="#/catalog" style="color:var(--mut);font-size:14px">← กลับหน้ารายการตู้รถไฟ</a>
    <div class="grid2" style="margin-top:18px;align-items:start">
      <div>
        <div class="gbig" id="gbig">${big}</div>
        <div class="gal">${imgs.length?imgs.map((u,i)=>`<div class="g" onclick="document.getElementById('gbig').innerHTML='<img src=\\'${esc(u)}\\'>'"><img src="${esc(u)}"></div>`).join(''):
          [1,2,3,4].map(()=>`<div class="g">${c.emoji||'🚃'}</div>`).join('')}</div>
      </div>
      <div class="panel">
        <span class="chip" style="color:var(--gold2);border-color:rgba(194,65,12,.35)">${esc(c.tag||'มาตรฐาน')}</span>
        <h2 style="font-size:27px;margin:10px 0 4px">${esc(c.name)}</h2>
        <p style="color:var(--mut);font-size:14px">รหัสตู้ ${esc(c.code||'-')}</p>
        <p style="margin:14px 0;color:var(--txt)">${esc(c.desc||'')}</p>
        <div class="frow" style="gap:12px;margin-bottom:16px">
          <div class="fcard"><small>ความจุที่นั่ง</small><b style="color:var(--gold);font-size:22px">${num(c.seats)} ที่นั่ง</b></div>
          <div class="fcard"><small>ความจุที่นอน</small><b style="color:var(--gold);font-size:22px">${c.beds>0?num(c.beds)+' ที่นอน':'—'}</b></div>
        </div>
        <label style="display:block;margin-bottom:9px">สิ่งอำนวยความสะดวก</label>
        <ul class="chk">${(c.fac||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
        <div class="note" style="background:rgba(11,94,215,.08);border-color:rgba(11,94,215,.3);color:#0B3F8F">
          <b>⚠ ข้อจำกัดการให้บริการ</b><br>${esc(c.limit||'-')}
        </div>
        <div class="price" style="margin-top:16px"><b>${num(c.pricePerKm)}</b><small>บาท/กม. · ค่าบริการขั้นต่ำ ${num(c.minPrice)} บาท/เที่ยว</small></div>
        <a href="#/calc/${c.id}" class="btn btn-g" style="width:100%;margin-top:14px">🧮 คำนวณค่าเช่าตู้นี้</a>
      </div>
    </div>
  </section></div>`;
}

function viewCalc(preId){
  const today=new Date().toISOString().slice(0,10);
  return `<div class="wrap"><section>
    <div class="sec-h"><div><h2>คำนวณค่าบริการเบื้องต้น</h2>
      <p>ไม่ต้องเข้าสู่ระบบ · กรอกข้อมูลให้ครบแล้วกดคำนวณ</p></div></div>
    <div class="grid2" style="grid-template-columns:1.25fr .75fr;align-items:start">
      <div class="panel">
        <div class="frow">
          <div class="fg"><label>🚩 สถานีต้นทาง</label>
            <input id="fromTxt" placeholder="พิมพ์ชื่อสถานี เช่น กรุงเทพ" autocomplete="off">
            <input type="hidden" id="from"><div id="fromDrop"></div></div>
          <div class="fg"><label>🏁 สถานีปลายทาง</label>
            <input id="toTxt" placeholder="พิมพ์ชื่อสถานี เช่น เชียงใหม่" autocomplete="off">
            <input type="hidden" id="to"><div id="toDrop"></div></div>
        </div>
        <div class="fg"><label>🚂 รูปแบบการเช่า</label>
          <div class="radios">
            <label class="radio on" id="m_attach"><input type="radio" name="mode" value="attach" checked hidden>
              <div><b>พ่วงไปกับขบวนปกติ</b><small>ประหยัดกว่า · ยึดตามตารางเดินรถ</small></div></label>
            <label class="radio" id="m_charter"><input type="radio" name="mode" value="charter" hidden>
              <div><b>เหมาขบวนจัดเฉพาะ</b><small>กำหนดเวลาเดินทางเองได้ · ไม่ต้องรอพ่วงขบวนปกติ</small></div></label>
          </div></div>
        <div class="frow">
          <div class="fg"><label>🚃 ประเภทตู้รถไฟ</label>
            <select id="carId">${DB.carriages.map(c=>`<option value="${c.id}" ${c.id===preId?'selected':''}>${esc(c.name)} — ${num(c.pricePerKm)} บ./กม.</option>`).join('')}</select></div>
          <div class="fg"><label>🔢 จำนวนตู้ที่ต้องการ</label><input type="number" id="qty" value="1" min="1" max="12"></div>
        </div>
        <div class="frow">
          <div class="fg"><label>📅 วันเดินทาง (ไป)</label><input type="date" id="d1" value="${today}"></div>
          <div class="fg"><label>📅 วันเดินทางกลับ (ถ้ามี)</label><input type="date" id="d2"></div>
        </div>
        <div class="fg"><label>⚙️ ตัวเลือกเพิ่มเติม</label>
          <div class="cks">
            <label class="ck"><input type="checkbox" id="roundTrip" checked> เดินทางไป-กลับ</label>
            <label class="ck"><input type="checkbox" id="overnightChk"> จอดพ่วงค้างคืนปลายทาง</label>
          </div></div>
        <div class="fg hide" id="nightsBox"><label>🌙 จำนวนคืนที่จอดค้าง</label><input type="number" id="nights" value="1" min="0" max="30"></div>
        <div class="frow">
          <div class="fg"><label>👤 ชื่อผู้ติดต่อ (ไม่บังคับ)</label><input id="cname" placeholder="เช่น คุณสมชาย"></div>
          <div class="fg"><label>🏢 หน่วยงาน/องค์กร (ไม่บังคับ)</label><input id="corg" placeholder="เช่น บริษัท ตัวอย่าง จำกัด"></div>
        </div>
        <button class="btn btn-g" style="width:100%" onclick="doCalc()">🧮 คำนวณค่าบริการ</button>
        <p id="err" style="color:var(--red);font-size:13.5px;margin-top:10px"></p>
      </div>
      <div class="panel">
        <h3 style="font-size:17px;margin-bottom:12px">📌 อัตราค่าบริการปัจจุบัน</h3>
        <table class="bt" style="font-size:13.5px">${rateRows()}</table>
        <div class="note" style="background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.3);color:#065F46">
          ระยะทางขั้นต่ำในการคิดค่าบริการคือ ${num(DB.pricing.minDistance)} กม. หากระยะทางจริงน้อยกว่านี้ ระบบจะคิดที่ขั้นต่ำ
        </div>
      </div>
    </div>
  </section></div>`;
}

function initCalc(){
  ['from','to'].forEach(k=>{
    const txt=document.getElementById(k+'Txt'), hid=document.getElementById(k), box=document.getElementById(k+'Drop');
    const show=q=>{
      const list=DB.stations.filter(s=>s.name.includes(q)||q==='').slice(0,40);
      box.innerHTML=`<div class="drop">${list.map(s=>`<div data-id="${s.id}" data-n="${esc(s.name)}">${esc(s.name)}<small>สาย${s.line==='hub'?'ศูนย์กลาง':esc(s.line)} · กม.${num(s.km)}</small></div>`).join('')||'<div><small>ไม่พบสถานี</small></div>'}</div>`;
      box.querySelectorAll('[data-id]').forEach(d=>d.onclick=()=>{txt.value=d.dataset.n;hid.value=d.dataset.id;box.innerHTML='';});
    };
    txt.oninput=()=>{hid.value='';show(txt.value)};
    txt.onfocus=()=>show(txt.value);
    document.addEventListener('click',e=>{if(!box.contains(e.target)&&e.target!==txt)box.innerHTML='';});
  });
  document.querySelectorAll('input[name=mode]').forEach(r=>r.onchange=()=>{
    document.getElementById('m_attach').classList.toggle('on',r.value==='attach'&&r.checked||document.querySelector('input[name=mode]:checked').value==='attach');
    document.getElementById('m_charter').classList.toggle('on',document.querySelector('input[name=mode]:checked').value==='charter');
  });
  document.getElementById('overnightChk').onchange=e=>document.getElementById('nightsBox').classList.toggle('hide',!e.target.checked);
}

function doCalc(){
  const g=id=>document.getElementById(id);
  const f={from:g('from').value,to:g('to').value,carId:g('carId').value,
    qty:Math.max(1,+g('qty').value||1),
    mode:document.querySelector('input[name=mode]:checked').value,
    d1:g('d1').value,d2:g('d2').value,
    roundTrip:g('roundTrip').checked,
    nights:g('overnightChk').checked?Math.max(0,+g('nights').value||0):0,
    cname:g('cname').value,corg:g('corg').value};
  if(!f.from||!f.to){g('err').textContent='⚠ กรุณาเลือกสถานีต้นทางและปลายทางจากรายการที่ระบบแนะนำ';return;}
  if(f.from===f.to){g('err').textContent='⚠ สถานีต้นทางและปลายทางต้องไม่ซ้ำกัน';return;}
  const q=quote(f); if(!q){g('err').textContent='⚠ ไม่พบข้อมูลตู้รถไฟ';return;}
  STATE.result=q;
  DB.quotes.unshift({id:uid('q'),at:new Date().toISOString(),from:stn(f.from).name,to:stn(f.to).name,
    km:q.totalKm,car:q.carriage.name,qty:f.qty,mode:f.mode,total:q.total,cname:f.cname,corg:f.corg});
  DB.quotes=DB.quotes.slice(0,200); save();
  location.hash='#/result';
}

function viewResult(){
  const q=STATE.result;
  if(!q) return `<div class="wrap"><section class="panel" style="text-align:center">
    <h2>ยังไม่มีผลการคำนวณ</h2><p style="color:var(--mut);margin:10px 0 18px">กรุณากรอกแบบฟอร์มเพื่อประเมินราคา</p>
    <a href="#/calc" class="btn btn-g">ไปหน้าคำนวณ</a></section></div>`;
  const f=q.form, no='QT-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
  return `<div class="wrap"><section>
    <div class="noprint" style="margin-bottom:16px"><a href="#/calc" style="color:var(--mut);font-size:14px">← แก้ไขข้อมูลการคำนวณ</a></div>
    <div class="bill">
      <div class="bill-h">
        <div>
          <div class="route">${esc(f.fromName||stn(f.from).name)} <span class="ar">→</span> ${esc(stn(f.to).name)}</div>
          <p style="color:var(--mut);font-size:14px;margin-top:5px">
            ระยะทางเที่ยวเดียว ${num(q.km)} กม. · ${q.legs===2?'เดินทางไป-กลับ รวม':'รวม'} ${num(q.totalKm)} กม.
            · ${f.mode==='charter'?'เหมาขบวนจัดเฉพาะ':'พ่วงกับขบวนปกติ'}
          </p>
        </div>
        <div style="text-align:right;font-size:13.5px;color:var(--mut)">
          <b style="color:var(--gold);font-size:15px">เลขที่ ${no}</b><br>
          วันที่ออกเอกสาร ${new Date().toLocaleDateString('th-TH')}<br>
          เดินทาง ${f.d1?new Date(f.d1).toLocaleDateString('th-TH'):'-'}${f.d2?' – '+new Date(f.d2).toLocaleDateString('th-TH'):''}
        </div>
      </div>
      ${(f.cname||f.corg)?`<div style="padding:14px 22px;border-bottom:1px solid var(--line);font-size:14px;color:var(--mut)">
        ผู้ขอประเมินราคา: <b style="color:var(--txt)">${esc(f.cname||'-')}</b> ${f.corg?'· '+esc(f.corg):''}</div>`:''}
      <table class="bt">
        <thead><tr><th style="width:52%">รายการ</th><th>การคำนวณ</th><th class="n">จำนวนเงิน (บาท)</th></tr></thead>
        <tbody>
          ${q.items.map(i=>`<tr><td><b>${esc(i.t)}</b></td><td style="color:var(--mut);font-size:13px">${esc(i.d)}</td><td class="n">${money(i.v)}</td></tr>`).join('')}
          <tr class="sum"><td colspan="2" style="text-align:right">ยอดรวมค่าประเมินเบื้องต้น</td><td class="n">${money(q.total)}</td></tr>
        </tbody>
      </table>
    </div>
    ${q.minApplied?`<div class="note" style="background:rgba(194,65,12,.08);border-color:rgba(194,65,12,.35);color:#7C2D12">
      ℹ️ ระยะทางที่เลือกทำให้ค่าเช่าต่ำกว่าอัตราขั้นต่ำ ระบบจึงคิดที่ราคาเหมาขั้นต่ำ ${num(q.carriage.minPrice)} บาท/ตู้/เที่ยว</div>`:''}
    <div class="note">
      <b>หมายเหตุสำคัญ (Disclaimer)</b><br>
      นี่คือราคาประเมินเบื้องต้นเพื่อใช้ในการวางแผนงบประมาณเท่านั้น อัตราค่าบริการจริงอาจเปลี่ยนแปลงตามประกาศของหน่วยงาน
      ความพร้อมของตู้โดยสาร ตารางเดินรถ และเงื่อนไขเฉพาะของแต่ละเส้นทาง
      กรุณาติดต่อฝ่ายบริการลูกค้าเพื่อยืนยันการจองอย่างเป็นทางการ
    </div>
    <div class="noprint" style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button class="btn btn-g" onclick="window.print()">🖨️ บันทึกเป็น PDF / พิมพ์เอกสาร</button>
      <a href="#/calc" class="btn btn-o">↺ คำนวณใหม่</a>
      <a href="#/catalog" class="btn btn-o">🚃 ดูตู้ประเภทอื่น</a>
    </div>
  </section></div>`;
}

function viewFaq(){
  const qa=[
    ['ต้องสมัครสมาชิกไหม?','ไม่ต้อง ระบบคำนวณราคาเปิดให้ใช้งานฟรีตลอด 24 ชั่วโมง การเข้าสู่ระบบมีเฉพาะเจ้าหน้าที่ผู้ดูแลเท่านั้น'],
    ['ระบบคำนวณระยะทางอย่างไร?','ใช้ระยะทางสะสม (กม.) ของแต่ละสถานีจากสถานีศูนย์กลาง หากต้นทาง–ปลายทางอยู่คนละสายทาง ระบบจะคำนวณเป็นผลรวมของระยะทางผ่านสถานีศูนย์กลาง'],
    ['ราคาที่ได้ใช้ยืนยันการจองได้เลยไหม?','ไม่ได้ เป็นราคาประเมินเบื้องต้นเท่านั้น ต้องติดต่อเจ้าหน้าที่เพื่อยืนยันความพร้อมของตู้และตารางเดินรถ'],
    ['ต่างกันอย่างไรระหว่างพ่วงขบวนปกติกับเหมาขบวน?','แบบพ่วงจะนำตู้ไปต่อกับขบวนที่วิ่งตามตารางอยู่แล้ว ราคาถูกกว่าแต่ต้องยึดตามเวลาเดินรถ ส่วนเหมาขบวนจัดเฉพาะจะกำหนดเวลาเดินทางเองได้'],
    ['มีภาษีหรือค่าธรรมเนียมอื่นไหม?','การรถไฟไม่เก็บภาษี 7% ค่าหัวรถจักร ค่าทำความสะอาด ค่าเจ้าหน้าที่ประจำตู้ และค่าธรรมเนียมช่วงเทศกาล ราคาที่ประเมินจึงมีเฉพาะรายการที่แสดงในใบประเมิน'],
    ['อัปเดตราคาบ่อยแค่ไหน?','เจ้าหน้าที่สามารถแก้ไขอัตราค่าบริการผ่านระบบหลังบ้านได้ทันที และหน้าเว็บจะใช้ค่าล่าสุดในการคำนวณเสมอ']
  ];
  return `<div class="wrap"><section>
    <div class="sec-h"><div><h2>คำถามที่พบบ่อย</h2><p>รวมข้อสงสัยเกี่ยวกับการเช่าและการคำนวณราคา</p></div></div>
    <div style="display:grid;gap:12px">${qa.map(([q,a])=>`<div class="panel"><b style="font-size:16px">❓ ${q}</b><p style="color:var(--mut);margin-top:7px">${a}</p></div>`).join('')}</div>
  </section></div>`;
}


function rateRows(){
  return (DB.pricing.consts||[]).filter(x=>x.show!==false).map((x,i,a)=>`<tr><td style="padding:9px 0${i==a.length-1?';border:none':''}">${esc(x.label)}</td><td class="n" style="padding:9px 0${i==a.length-1?';border:none':''}">${num(x.v)} ${esc(x.unit)}</td></tr>`).join('')
    ||'<tr><td style="border:none">ไม่มีค่าบริการเพิ่มเติม</td></tr>';
}
