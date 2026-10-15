/* หน้าเจ้าหน้าที่ (หลังบ้าน): เข้าสู่ระบบ / ภาพรวม / ตู้+รูปภาพ / สถานี / สูตรราคา / ใบประเมิน / บัญชี */
let ADMIN=JSON.parse(sessionStorage.getItem('rq_admin')||'null'), TAB='dash';
function render(){document.getElementById('app').innerHTML=viewAdmin();window.scrollTo(0,0);}
function logout(){ADMIN=null;sessionStorage.removeItem('rq_admin');render();}
window.addEventListener('load',render);
function viewAdmin(){
  if(!ADMIN) return `<div class="wrap"><section style="max-width:430px;margin:0 auto">
    <div class="panel">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:42px">⚙️</div>
        <h2 style="font-size:22px;margin-top:6px">เข้าสู่ระบบผู้ดูแล</h2>
        <p style="color:var(--mut);font-size:13.5px">สำหรับเจ้าหน้าที่ที่ได้รับสิทธิ์เท่านั้น</p>
      </div>
      <div class="fg"><label>ชื่อผู้ใช้</label><input id="au" placeholder="admin" onkeydown="if(event.key==='Enter')login()"></div>
      <div class="fg"><label>รหัสผ่าน</label><input type="password" id="ap" placeholder="••••••••" onkeydown="if(event.key==='Enter')login()"></div>
      <button class="btn btn-g" style="width:100%" onclick="login()">🔐 เข้าสู่ระบบ</button>
      <p id="aerr" style="color:var(--red);font-size:13.5px;margin-top:10px;text-align:center"></p>
      <p style="color:var(--mut);font-size:12.5px;text-align:center;margin-top:14px">บัญชีทดสอบ: <b>admin</b> / <b>admin123</b></p>
    </div></section></div>`;

  const tabs=[['dash','📊 ภาพรวม'],['car','🚃 จัดการตู้รถไฟ'],['stn','📍 สถานี & ระยะทาง'],
              ['price','💰 โครงสร้างราคา'],['quo','🧾 ใบประเมินที่บันทึก'],['usr','👥 บัญชีผู้ดูแล']];
  return `<div class="wrap"><section>
    <div class="sec-h">
      <div><h2>ระบบหลังบ้าน</h2><p>ยินดีต้อนรับ <b style="color:var(--accent)">${esc(ADMIN.name)}</b> · ${esc(ADMIN.role)}</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-o btn-s" onclick="resetDB()">↺ รีเซ็ตข้อมูลตัวอย่าง</button>
        <button class="btn btn-d btn-s" onclick="logout()">ออกจากระบบ</button>
      </div>
    </div>
    <div class="tabs">${tabs.map(([k,l])=>`<div class="tab ${TAB===k?'on':''}" onclick="TAB='${k}';render()">${l}</div>`).join('')}</div>
    <div id="tabBody">${
      TAB==='dash'?tabDash():TAB==='car'?tabCar():TAB==='stn'?tabStn():
      TAB==='price'?tabPrice():TAB==='quo'?tabQuo():tabUsr()}</div>
  </section></div>`;
}
function login(){
  const u=document.getElementById('au').value.trim(), p=document.getElementById('ap').value;
  const a=DB.admins.find(x=>x.user===u&&x.pass===p);
  if(!a){document.getElementById('aerr').textContent='⚠ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';return;}
  ADMIN=a;sessionStorage.setItem('rq_admin',JSON.stringify(a));TAB='dash';toast('เข้าสู่ระบบสำเร็จ');render();
}
function resetDB(){if(confirm('ยืนยันคืนค่าข้อมูลทั้งหมดเป็นค่าตัวอย่างเริ่มต้น?')){DB=structuredClone(SEED);save();toast('รีเซ็ตข้อมูลแล้ว');render();}}

function tabDash(){
  const rev=DB.quotes.reduce((s,q)=>s+q.total,0), P=DB.pricing;
  return `<div class="stat">
      <div class="fcard"><small>ประเภทตู้ทั้งหมด</small><b>${DB.carriages.length}</b></div>
      <div class="fcard"><small>สถานีในระบบ</small><b>${DB.stations.length}</b></div>
      <div class="fcard"><small>ใบประเมินที่ออก</small><b>${DB.quotes.length}</b></div>
      <div class="fcard"><small>มูลค่ารวมที่ประเมิน</small><b style="font-size:19px">฿${num(Math.round(rev))}</b></div>
    </div>
    <div class="grid2">
      <div class="panel"><h3 style="font-size:17px;margin-bottom:12px">🧾 ใบประเมินล่าสุด</h3>
        ${DB.quotes.length?`<div class="scroll"><table class="tbl"><thead><tr><th>เส้นทาง</th><th>ตู้</th><th style="text-align:right">ยอดรวม</th></tr></thead><tbody>
        ${DB.quotes.slice(0,7).map(q=>`<tr><td>${esc(q.from)} → ${esc(q.to)}</td><td>${esc(q.car)}</td><td style="text-align:right;color:var(--accent)">฿${num(Math.round(q.total))}</td></tr>`).join('')}
        </tbody></table></div>`:'<p style="color:var(--mut)">ยังไม่มีข้อมูล</p>'}
      </div>
      <div class="panel"><h3 style="font-size:17px;margin-bottom:12px">💰 สูตรที่ใช้งานอยู่</h3>
        <div class="scroll"><table class="tbl"><tbody>
        <tr><td>ค่าเช่าตู้</td><td class="mono">${esc(P.rent)}</td></tr>
        ${(P.fees||[]).map(f=>`<tr><td>${esc(f.name)} ${f.on?'':'<span class="chip">ปิดอยู่</span>'}</td><td class="mono">${esc(f.formula)}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
}

/* ---- Carriage CRUD (รวมอัปโหลดรูปตู้โดยสาร) ---- */
function tabCar(){
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-g btn-s" onclick="editCar()">➕ เพิ่มประเภทตู้ใหม่</button></div>
    <div class="scroll"><table class="tbl">
      <thead><tr><th>รูป</th><th>ตู้รถไฟ</th><th>ที่นั่ง</th><th>ที่นอน</th><th>ราคา/กม.</th><th>ขั้นต่ำ</th><th style="text-align:right">จัดการ</th></tr></thead>
      <tbody>${DB.carriages.map(c=>`<tr>
        <td><div class="ctn">${c.images&&c.images[0]?`<img src="${esc(c.images[0])}">`:esc(c.emoji||'🚃')}</div><small style="color:var(--mut)">${(c.images||[]).length} รูป</small></td>
        <td><b>${esc(c.name)}</b><br><small style="color:var(--mut)">${esc(c.code||'')}</small></td>
        <td>${num(c.seats)}</td><td>${c.beds>0?num(c.beds):'—'}</td>
        <td style="color:var(--accent)">${num(c.pricePerKm)}</td><td>${num(c.minPrice)}</td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn btn-o btn-s" onclick="editCar('${c.id}')">แก้ไข</button>
          <button class="btn btn-d btn-s" onclick="delCar('${c.id}')">ลบ</button></td></tr>`).join('')}
      </tbody></table></div>`;
}
function delCar(id){if(confirm('ยืนยันลบประเภทตู้นี้?')){DB.carriages=DB.carriages.filter(c=>c.id!==id);save();toast('ลบแล้ว');render();}}
let EDIT_IMGS=[];
function compressImg(file,max=1000,q=.78){return new Promise((ok,no)=>{const r=new FileReader();r.onerror=no;
  r.onload=()=>{const im=new Image();im.onerror=no;im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement('canvas');
    cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);ok(cv.toDataURL('image/jpeg',q));};im.src=r.result;};
  r.readAsDataURL(file);});}
async function addImgs(inp){
  for(const f of inp.files){ if(EDIT_IMGS.length>=8){toast('อัปโหลดได้สูงสุด 8 รูปต่อตู้');break;}
    try{EDIT_IMGS.push(await compressImg(f));}catch(e){toast('⚠ ไฟล์ '+f.name+' ไม่ใช่รูปภาพที่รองรับ');} }
  inp.value='';drawImgs();}
function addImgUrl(){const i=document.getElementById('e_url'),u=i.value.trim();if(!u)return;if(EDIT_IMGS.length>=8){toast('สูงสุด 8 รูป');return;}EDIT_IMGS.push(u);i.value='';drawImgs();}
function rmImg(i){EDIT_IMGS.splice(i,1);drawImgs();}
function coverImg(i){EDIT_IMGS.unshift(...EDIT_IMGS.splice(i,1));drawImgs();}
function drawImgs(){document.getElementById('imgBox').innerHTML=EDIT_IMGS.map((u,i)=>`<div class="ithumb"><img src="${esc(u)}">
  ${i==0?'<span class="cov">รูปปก</span>':''}<div class="ia">${i?`<button class="btn btn-o btn-s" onclick="coverImg(${i})">ตั้งเป็นปก</button>`:''}<button class="btn btn-d btn-s" onclick="rmImg(${i})">ลบ</button></div></div>`).join('')
  ||'<small style="color:var(--mut)">ยังไม่มีรูป — จะแสดงไอคอน Emoji แทน</small>';}
function editCar(id){
  const c=car(id)||{id:'',name:'',code:'',seats:0,beds:0,pricePerKm:0,minPrice:0,tag:'',emoji:'🚃',desc:'',limit:'',fac:[],images:[]};
  EDIT_IMGS=[...(c.images||[])];
  openModal(id?'แก้ไขประเภทตู้รถไฟ':'เพิ่มประเภทตู้รถไฟ',`
    <div class="fg"><label>📷 รูปภาพตู้โดยสาร (อัปโหลดได้สูงสุด 8 รูป · ระบบย่อขนาดให้อัตโนมัติ · รูปแรก = รูปปก)</label>
      <div id="imgBox" class="igrid"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <label class="btn btn-g btn-s" style="cursor:pointer">⬆ เลือกรูปจากเครื่อง<input type="file" accept="image/*" multiple hidden onchange="addImgs(this)"></label>
        <input id="e_url" placeholder="หรือวางลิงก์รูปภาพ https://..." style="flex:1;min-width:180px"><button class="btn btn-o btn-s" onclick="addImgUrl()">เพิ่มลิงก์</button></div></div>
    <div class="frow"><div class="fg"><label>ชื่อประเภทตู้ *</label><input id="e_name" value="${esc(c.name)}"></div>
    <div class="fg"><label>รหัสตู้</label><input id="e_code" value="${esc(c.code)}"></div></div>
    <div class="frow"><div class="fg"><label>จำนวนที่นั่ง</label><input type="number" id="e_seats" value="${c.seats}"></div>
    <div class="fg"><label>จำนวนที่นอน</label><input type="number" id="e_beds" value="${c.beds}"></div></div>
    <div class="frow"><div class="fg"><label>ราคา (บาท/กม.) *</label><input type="number" id="e_ppk" value="${c.pricePerKm}"></div>
    <div class="fg"><label>ราคาขั้นต่ำ (บาท/เที่ยว)</label><input type="number" id="e_min" value="${c.minPrice}"></div></div>
    <div class="frow"><div class="fg"><label>ป้ายกำกับ (Tag)</label><input id="e_tag" value="${esc(c.tag)}" placeholder="เช่น ยอดนิยม"></div>
    <div class="fg"><label>ไอคอน (Emoji)</label><input id="e_emoji" value="${esc(c.emoji)}"></div></div>
    <div class="fg"><label>คำอธิบาย</label><textarea id="e_desc" rows="3">${esc(c.desc)}</textarea></div>
    <div class="fg"><label>ข้อจำกัดการให้บริการ</label><textarea id="e_limit" rows="2">${esc(c.limit)}</textarea></div>
    <div class="fg"><label>สิ่งอำนวยความสะดวก</label>
      <div class="cks">${FAC_MASTER.map(f=>`<label class="ck"><input type="checkbox" class="e_fac" value="${esc(f)}" ${(c.fac||[]).includes(f)?'checked':''}> ${esc(f)}</label>`).join('')}</div></div>
    <button class="btn btn-g" style="width:100%" onclick="saveCar('${id||''}')">💾 บันทึกข้อมูล</button>`);
  drawImgs();
}
function saveCar(id){
  const v=i=>document.getElementById(i).value;
  const o={id:id||uid('c'),name:v('e_name').trim(),code:v('e_code').trim(),
    seats:+v('e_seats')||0,beds:+v('e_beds')||0,pricePerKm:+v('e_ppk')||0,minPrice:+v('e_min')||0,
    tag:v('e_tag').trim(),emoji:v('e_emoji').trim()||'🚃',desc:v('e_desc').trim(),limit:v('e_limit').trim(),
    images:[...EDIT_IMGS],fac:[...document.querySelectorAll('.e_fac:checked')].map(x=>x.value)};
  if(!o.name||!o.pricePerKm){alert('กรุณากรอกชื่อตู้และราคาต่อกิโลเมตร');return;}
  const old=DB.carriages.slice(), i=DB.carriages.findIndex(c=>c.id===id);
  i>=0?DB.carriages[i]=o:DB.carriages.push(o);
  if(!save()){DB.carriages=old;return;}
  closeModal();toast('บันทึกข้อมูลตู้รถไฟแล้ว');render();
}

/* ---- Station CRUD ---- */
function tabStn(){
  const lines=[...new Set(DB.stations.map(s=>s.line))];
  return `<div class="panel" style="margin-bottom:16px">
      <b>📐 หลักการคำนวณระยะทาง</b>
      <p style="color:var(--mut);font-size:13.5px;margin-top:6px">
        กรอก "ระยะทางสะสม (กม.)" ของแต่ละสถานีนับจากสถานีศูนย์กลาง (กม.0) ระบบจะหาผลต่างอัตโนมัติเมื่ออยู่สายเดียวกัน
        และรวมระยะทางผ่านศูนย์กลางเมื่อต่างสายทาง — ไม่ต้องกรอกตารางเมทริกซ์ทั้งหมด</p></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap">
      <div style="display:flex;gap:8px;align-items:center">
        <input id="dA" list="stnList" placeholder="สถานีต้นทาง" style="width:180px">
        <input id="dB" list="stnList" placeholder="สถานีปลายทาง" style="width:180px">
        <button class="btn btn-o btn-s" onclick="testDist()">🔍 ทดสอบระยะทาง</button>
        <span id="dOut" style="color:var(--accent);font-weight:700"></span>
        <datalist id="stnList">${DB.stations.map(s=>`<option value="${esc(s.name)}">`).join('')}</datalist>
      </div>
      <button class="btn btn-g btn-s" onclick="editStn()">➕ เพิ่มสถานี</button></div>
    <div class="scroll"><table class="tbl">
      <thead><tr><th>ชื่อสถานี</th><th>สายทาง</th><th>ระยะทางสะสม (กม.)</th><th style="text-align:right">จัดการ</th></tr></thead>
      <tbody>${DB.stations.slice().sort((a,b)=>a.line.localeCompare(b.line)||a.km-b.km).map(s=>`<tr>
        <td><b>${esc(s.name)}</b></td><td><span class="chip">${s.line==='hub'?'ศูนย์กลาง':esc(s.line)}</span></td>
        <td style="color:var(--accent)">${num(s.km)}</td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn btn-o btn-s" onclick="editStn('${s.id}')">แก้ไข</button>
          <button class="btn btn-d btn-s" onclick="delStn('${s.id}')">ลบ</button></td></tr>`).join('')}
      </tbody></table></div>`;
}
function testDist(){
  const a=DB.stations.find(s=>s.name===document.getElementById('dA').value);
  const b=DB.stations.find(s=>s.name===document.getElementById('dB').value);
  document.getElementById('dOut').textContent=(a&&b)?`= ${num(distance(a.id,b.id))} กม.`:'⚠ เลือกสถานีให้ถูกต้อง';
}
function delStn(id){if(confirm('ยืนยันลบสถานีนี้?')){DB.stations=DB.stations.filter(s=>s.id!==id);save();toast('ลบแล้ว');render();}}
function editStn(id){
  const s=stn(id)||{id:'',name:'',line:'',km:0};
  const lines=[...new Set(DB.stations.map(x=>x.line))];
  openModal(id?'แก้ไขสถานี':'เพิ่มสถานีใหม่',`
    <div class="fg"><label>ชื่อสถานี *</label><input id="s_name" value="${esc(s.name)}"></div>
    <div class="frow">
      <div class="fg"><label>สายทาง *</label><input id="s_line" list="lineList" value="${esc(s.line)}" placeholder="เช่น เหนือ / ใต้ / อีสานเหนือ">
        <datalist id="lineList">${lines.map(l=>`<option value="${esc(l)}">`).join('')}</datalist></div>
      <div class="fg"><label>ระยะทางสะสมจากศูนย์กลาง (กม.) *</label><input type="number" id="s_km" value="${s.km}"></div>
    </div>
    <button class="btn btn-g" style="width:100%" onclick="saveStn('${id||''}')">💾 บันทึก</button>`);
}
function saveStn(id){
  const v=i=>document.getElementById(i).value;
  const o={id:id||uid('s'),name:v('s_name').trim(),line:v('s_line').trim()||'อื่นๆ',km:+v('s_km')||0};
  if(!o.name){alert('กรุณากรอกชื่อสถานี');return;}
  const i=DB.stations.findIndex(s=>s.id===id);
  i>=0?DB.stations[i]=o:DB.stations.push(o);
  save();closeModal();toast('บันทึกสถานีแล้ว');render();
}

/* ---- Pricing: สูตรและค่าธรรมเนียมแก้ไขได้ทั้งหมด ---- */
const SAMPLE={qty:2,mode:'attach',nights:1,roundTrip:true};
function tabPrice(){
  const P=DB.pricing, cs=P.consts||[], fs=P.fees||[];
  const i2='style="padding:7px 9px"';
  return `<div class="panel" style="margin-bottom:18px">
    <h3 style="font-size:17px;margin-bottom:6px">🧮 สูตรคำนวณราคา</h3>
    <p style="color:var(--mut);font-size:13.5px;margin-bottom:12px">ราคารวม = <b>ค่าเช่าตู้</b> + <b>รายการค่าบริการเพิ่มเติมที่เปิดใช้</b> (ไม่มีภาษี/ค่าธรรมเนียมอื่นเว้นแต่ตั้งเพิ่มเอง)</p>
    <div class="note" style="margin:0 0 16px;background:rgba(11,94,215,.07);border-color:rgba(11,94,215,.3);color:#0B3F8F">
      <b>ตัวแปรที่ใช้ในสูตรได้:</b> <code>km</code> ระยะทางเที่ยวเดียว · <code>totalKm</code> ระยะทางรวม · <code>legs</code> 1=เที่ยวเดียว 2=ไป-กลับ · <code>qty</code> จำนวนตู้ ·
      <code>nights</code> คืนที่จอดค้าง · <code>days</code> จำนวนวัน · <code>pricePerKm</code> <code>minPrice</code> <code>seats</code> ของตู้ที่เลือก ·
      <code>charter</code>/<code>attach</code> (1 หรือ 0 ตามรูปแบบเช่า) · <code>rent</code> ค่าเช่าตู้ · <code>subtotal</code> ยอดสะสมก่อนรายการนั้น · และตัวแปรคงที่ที่ตั้งเอง<br>
      <b>ฟังก์ชัน:</b> <code>max() min() round() ceil() floor() abs()</code> · เงื่อนไข <code>เงื่อนไข ? ค่า1 : ค่า2</code> · ตัวอย่างเพิ่มภาษี 7%: <code>subtotal*0.07</code></div>
    <div class="fg"><label>ระยะทางขั้นต่ำที่คิดค่าบริการ (กม.)</label><input type="number" id="p_minDistance" value="${P.minDistance}"></div>
    <div class="fg"><label>สูตรค่าเช่าตู้</label><input class="mono" id="p_rent" value="${esc(P.rent)}"></div>
  </div>
  <div class="grid2" style="align-items:start">
    <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:17px">🔣 ตัวแปรคงที่ (อัตราค่าบริการ)</h3>
      <button class="btn btn-o btn-s" onclick="priceAct('addC')">➕ เพิ่ม</button></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>ชื่อตัวแปร</th><th>คำอธิบาย</th><th>ค่า</th><th>หน่วย</th><th>โชว์</th><th></th></tr></thead><tbody>
      ${cs.map((x,i)=>`<tr><td><input class="mono" ${i2} id="ck_${i}" value="${esc(x.k)}" style="width:105px"></td><td><input ${i2} id="cl_${i}" value="${esc(x.label)}"></td>
        <td><input type="number" step="any" ${i2} id="cv_${i}" value="${x.v}" style="width:90px"></td><td><input ${i2} id="cu_${i}" value="${esc(x.unit)}" style="width:80px"></td>
        <td><input type="checkbox" id="cs_${i}" ${x.show!==false?'checked':''}></td><td><button class="btn btn-d btn-s" onclick="priceAct('delC',${i})">✕</button></td></tr>`).join('')||'<tr><td colspan="6" style="color:var(--mut)">ยังไม่มีตัวแปร</td></tr>'}
      </tbody></table></div></div>
    <div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:17px">➕ รายการค่าบริการเพิ่มเติม</h3>
      <button class="btn btn-o btn-s" onclick="priceAct('addF')">➕ เพิ่มรายการ</button></div>
      ${fs.map((x,i)=>`<div class="feerow"><div style="display:flex;gap:8px;align-items:center"><label class="ck" style="padding:6px 9px"><input type="checkbox" id="fo_${i}" ${x.on?'checked':''}> ใช้งาน</label>
        <input ${i2} id="fn_${i}" value="${esc(x.name)}" placeholder="ชื่อรายการที่แสดงในบิล"><button class="btn btn-d btn-s" onclick="priceAct('delF',${i})">ลบ</button></div>
        <input class="mono" ${i2} id="ff_${i}" value="${esc(x.formula)}" placeholder="สูตร เช่น overnight*nights" style="margin-top:7px">
        <input ${i2} id="fd_${i}" value="${esc(x.desc||'')}" placeholder="คำอธิบายใต้ชื่อรายการ (ไม่บังคับ)" style="margin-top:7px"></div>`).join('')||'<p style="color:var(--mut)">ไม่มีรายการเพิ่มเติม — ราคา = ค่าเช่าตู้อย่างเดียว</p>'}
    </div></div>
  <div style="display:flex;gap:10px;margin:18px 0"><button class="btn btn-g" onclick="savePrice()">💾 บันทึกสูตรและโครงสร้างราคา</button></div>
  <div class="panel"><h3 style="font-size:17px;margin-bottom:12px">🔍 ทดสอบสูตร</h3>
    <div class="frow" style="grid-template-columns:repeat(4,1fr)">
      <div class="fg"><label>ตู้</label><select id="t_car">${DB.carriages.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="fg"><label>จำนวนตู้</label><input type="number" id="t_qty" value="${SAMPLE.qty}" min="1"></div>
      <div class="fg"><label>คืนที่จอดค้าง</label><input type="number" id="t_n" value="${SAMPLE.nights}" min="0"></div>
      <div class="fg"><label>รูปแบบ</label><select id="t_mode"><option value="attach">พ่วงขบวนปกติ</option><option value="charter">เหมาขบวน</option></select></div></div>
    <p style="color:var(--mut);font-size:13px;margin-bottom:10px">เส้นทางทดสอบ: ${esc(DB.stations[0]?.name||'-')} ⇄ ${esc(DB.stations[DB.stations.length-1]?.name||'-')} (ไป-กลับ) · ทดสอบจากค่าที่กรอกอยู่ ยังไม่ต้องบันทึก</p>
    <button class="btn btn-o btn-s" onclick="testPrice()">▶ ทดสอบคำนวณ</button><div id="tOut" style="margin-top:12px"></div></div>
  <div class="panel" style="margin-top:18px"><h3 style="font-size:17px;margin-bottom:12px">🚃 เรทราคารายประเภทตู้</h3>
    <div class="scroll"><table class="tbl"><thead><tr><th>ตู้</th><th>บาท/กม.</th><th>ขั้นต่ำ/เที่ยว</th></tr></thead><tbody>
    ${DB.carriages.map(c=>`<tr><td>${esc(c.name)}</td><td><input type="number" ${i2} id="rk_${c.id}" value="${c.pricePerKm}"></td><td><input type="number" ${i2} id="rm_${c.id}" value="${c.minPrice}"></td></tr>`).join('')}
    </tbody></table></div>
    <button class="btn btn-g" style="width:100%;margin-top:14px" onclick="saveRates()">💾 บันทึกเรทรายตู้</button></div>`;
}
function collectPrice(){
  const P=DB.pricing,g=i=>document.getElementById(i),n=i=>+g(i).value||0;
  P.minDistance=n('p_minDistance');P.rent=g('p_rent').value.trim();
  P.consts=(P.consts||[]).map((x,i)=>({k:g('ck_'+i).value.trim(),label:g('cl_'+i).value.trim(),v:n('cv_'+i),unit:g('cu_'+i).value.trim(),show:g('cs_'+i).checked}));
  P.fees=(P.fees||[]).map((x,i)=>({id:x.id,name:g('fn_'+i).value.trim(),formula:g('ff_'+i).value.trim(),desc:g('fd_'+i).value.trim(),on:g('fo_'+i).checked}));
}
function priceAct(act,i){
  collectPrice();const P=DB.pricing;
  if(act==='addC')P.consts.push({k:'newVar'+(P.consts.length+1),label:'ค่าใหม่',v:0,unit:'บาท',show:false});
  if(act==='delC')P.consts.splice(i,1);
  if(act==='addF')P.fees.push({id:uid('f'),name:'ค่าบริการใหม่',on:true,formula:'0',desc:''});
  if(act==='delF')P.fees.splice(i,1);
  render();
}
function sampleForm(){
  const g=i=>document.getElementById(i);
  return {from:DB.stations[0]?.id,to:DB.stations[DB.stations.length-1]?.id,carId:g('t_car')?.value||DB.carriages[0]?.id,qty:Math.max(1,+g('t_qty')?.value||SAMPLE.qty),
    mode:g('t_mode')?.value||SAMPLE.mode,nights:Math.max(0,+g('t_n')?.value||0),roundTrip:true};
}
function validatePrice(){
  const P=DB.pricing,bad=P.consts.find(x=>!/^[A-Za-z_]\w*$/.test(x.k)||FX.includes(x.k)||['km','totalKm','legs','qty','nights','days','pricePerKm','minPrice','seats','charter','attach','rent','subtotal'].includes(x.k));
  if(bad) return `ชื่อตัวแปร "${bad.k}" ไม่ถูกต้อง (ใช้ได้เฉพาะ a-z 0-9 _ ขึ้นต้นด้วยตัวอักษร และห้ามซ้ำกับตัวแปรระบบ)`;
  if(new Set(P.consts.map(x=>x.k)).size<P.consts.length) return 'ชื่อตัวแปรคงที่ซ้ำกัน';
  try{ if(!P.rent) return 'กรุณากรอกสูตรค่าเช่าตู้'; quote(sampleForm(),true); }catch(e){return 'สูตรผิดพลาด → '+e.message;}
  return '';
}
function testPrice(){
  collectPrice();const err=validatePrice(),o=document.getElementById('tOut');
  if(err){o.innerHTML=`<div class="note" style="margin:0">⚠ ${esc(err)}</div>`;return;}
  const q=quote(sampleForm(),true);
  o.innerHTML=`<table class="bt"><tbody>${q.items.map(i=>`<tr><td><b>${esc(i.t)}</b></td><td style="color:var(--mut);font-size:13px">${esc(i.d)}</td><td class="n">${money(i.v)}</td></tr>`).join('')}
    <tr class="sum"><td colspan="2" style="text-align:right">ยอดรวม (ระยะทาง ${num(q.totalKm)} กม.)</td><td class="n">${money(q.total)}</td></tr></tbody></table>`;
}
function savePrice(){
  collectPrice();const err=validatePrice();
  if(err){alert('⚠ '+err);return;}
  if(save()){toast('บันทึกสูตรและโครงสร้างราคาแล้ว');render();}
}
function saveRates(){
  DB.carriages.forEach(c=>{c.pricePerKm=+document.getElementById('rk_'+c.id).value||0;c.minPrice=+document.getElementById('rm_'+c.id).value||0;});
  save();toast('บันทึกเรทรายตู้แล้ว');render();
}

/* ---- Quotes log ---- */
function tabQuo(){
  if(!DB.quotes.length) return '<div class="panel" style="text-align:center;color:var(--mut)">ยังไม่มีใบประเมินที่บันทึกไว้</div>';
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-d btn-s" onclick="if(confirm('ล้างประวัติทั้งหมด?')){DB.quotes=[];save();render();}">🗑 ล้างประวัติ</button></div>
    <div class="scroll"><table class="tbl">
    <thead><tr><th>วันที่</th><th>เส้นทาง</th><th>กม.</th><th>ตู้</th><th>รูปแบบ</th><th>ผู้ติดต่อ</th><th style="text-align:right">ยอดรวม</th></tr></thead>
    <tbody>${DB.quotes.map(q=>`<tr>
      <td><small>${new Date(q.at).toLocaleString('th-TH')}</small></td>
      <td>${esc(q.from)} → ${esc(q.to)}</td><td>${num(q.km)}</td>
      <td>${esc(q.car)} ×${q.qty}</td>
      <td><span class="chip">${q.mode==='charter'?'เหมาขบวน':'พ่วงขบวน'}</span></td>
      <td><small style="color:var(--mut)">${esc(q.cname||'-')}${q.corg?'<br>'+esc(q.corg):''}</small></td>
      <td style="text-align:right;color:var(--accent);font-weight:600">฿${num(Math.round(q.total))}</td></tr>`).join('')}
    </tbody></table></div>`;
}

/* ---- Admin accounts ---- */
function tabUsr(){
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-g btn-s" onclick="editUsr()">➕ เพิ่มบัญชีผู้ดูแล</button></div>
    <div class="scroll"><table class="tbl">
    <thead><tr><th>ชื่อ-สกุล</th><th>ชื่อผู้ใช้</th><th>สิทธิ์</th><th style="text-align:right">จัดการ</th></tr></thead>
    <tbody>${DB.admins.map(a=>`<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.user)}</td>
      <td><span class="chip" style="color:var(--accent2)">${esc(a.role)}</span></td>
      <td style="text-align:right;white-space:nowrap">
        <button class="btn btn-o btn-s" onclick="editUsr('${a.id}')">แก้ไข</button>
        ${DB.admins.length>1?`<button class="btn btn-d btn-s" onclick="delUsr('${a.id}')">ลบ</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>`;
}
function delUsr(id){
  if(ADMIN&&id===ADMIN.id){alert('ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่');return;}
  if(confirm('ยืนยันลบบัญชีนี้?')){DB.admins=DB.admins.filter(a=>a.id!==id);save();toast('ลบแล้ว');render();}
}
function editUsr(id){
  const a=DB.admins.find(x=>x.id===id)||{id:'',user:'',pass:'',name:'',role:'Staff'};
  openModal(id?'แก้ไขบัญชีผู้ดูแล':'เพิ่มบัญชีผู้ดูแล',`
    <div class="frow"><div class="fg"><label>ชื่อ-สกุล *</label><input id="u_name" value="${esc(a.name)}"></div>
    <div class="fg"><label>สิทธิ์การใช้งาน</label><select id="u_role">
      ${['Super Admin','Admin','Staff'].map(r=>`<option ${a.role===r?'selected':''}>${r}</option>`).join('')}</select></div></div>
    <div class="frow"><div class="fg"><label>ชื่อผู้ใช้ *</label><input id="u_user" value="${esc(a.user)}"></div>
    <div class="fg"><label>รหัสผ่าน *</label><input id="u_pass" value="${esc(a.pass)}"></div></div>
    <button class="btn btn-g" style="width:100%" onclick="saveUsr('${id||''}')">💾 บันทึก</button>`);
}
function saveUsr(id){
  const v=i=>document.getElementById(i).value.trim();
  const o={id:id||uid('a'),name:v('u_name'),user:v('u_user'),pass:v('u_pass'),role:v('u_role')};
  if(!o.name||!o.user||!o.pass){alert('กรุณากรอกข้อมูลให้ครบ');return;}
  if(DB.admins.some(x=>x.user===o.user&&x.id!==id)){alert('ชื่อผู้ใช้นี้ถูกใช้แล้ว');return;}
  const i=DB.admins.findIndex(x=>x.id===id);
  i>=0?DB.admins[i]=o:DB.admins.push(o);
  save();closeModal();toast('บันทึกบัญชีแล้ว');render();
}

/* ---- Modal ---- */
function openModal(title,body){
  const m=document.createElement('div');m.className='modal';m.id='modal';
  m.innerHTML=`<div class="modal-in"><div class="mh"><h3>${title}</h3><button class="x" onclick="closeModal()">×</button></div>${body}</div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
}
function closeModal(){document.getElementById('modal')?.remove()}
