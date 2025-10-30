// ===== 判定ロジック（成人カットオフ） =====
// severe:   peak <= 9
// moderate: 9 < peak <= 16
// normal:   peak > 16
function judgeByPeak(peak){
  if (peak <= 9) return {level:'重症 GHD', cls:'bad',
    comment:'成人の重症カットオフ（≤9 ng/mL）に該当します。'};
  if (peak <= 16) return {level:'中等症 GHD', cls:'warn',
    comment:'成人の中等域（>9〜≤16 ng/mL）に該当します。'};
  return {level:'正常反応', cls:'ok',
    comment:'成人基準では GHRP-2 に対する分泌反応は保たれています。'};
}

// 入力値収集＋バリデーション
function readInputs(){
  const points = [
    {t:'0分',  id:'t0'},
    {t:'15分', id:'t15'},
    {t:'30分', id:'t30'},
    {t:'45分', id:'t45'},
    {t:'60分', id:'t60', optional:true},
  ];
  const vals = [];
  const errors = [];
  for(const p of points){
    const el = document.getElementById(p.id);
    const raw = el.value.trim();
    if(raw === ''){
      if(p.optional) continue;
      errors.push(`${p.t} の値が未入力です`);
      continue;
    }
    const v = Number(raw);
    if(!isFinite(v) || v < 0){ errors.push(`${p.t} の値が不正です`); continue; }
    vals.push({time:p.t, value:v});
  }
  return {vals, errors};
}

// 小数1桁フォーマット
const fmt = (x)=> (Math.round(x*10)/10).toFixed(1);

window.addEventListener('DOMContentLoaded', ()=>{
  const calcBtn = document.getElementById('calc');
  const clearBtn = document.getElementById('clear');

  calcBtn.addEventListener('click', ()=>{
    const {vals, errors} = readInputs();
    const errBox = document.getElementById('err');
    errBox.textContent = '';

    const resultBox = document.getElementById('result');

    if(errors.length){
      errBox.textContent = errors.join(' / ');
      resultBox.hidden = true;
      return;
    }
    if(vals.length < 4){
      errBox.textContent = '少なくとも 0,15,30,45 分の計4点を入力してください。';
      resultBox.hidden = true;
      return;
    }

    // GH頂値算出
    let peak = -Infinity, peakTime = '';
    for(const {time,value} of vals){
      if(value > peak){ peak = value; peakTime = time; }
    }

    // 判定
    const j = judgeByPeak(peak);

    // 表示
    const badge = document.getElementById('badge');
    badge.className = 'pill ' + j.cls;
    badge.textContent = j.level;

    document.getElementById('comment').textContent = j.comment;

    const facts = document.getElementById('facts');
    facts.innerHTML = `
      <div class="k">GH 頂値</div><div class="v"><b>${fmt(peak)}</b> ng/mL（${peakTime}）</div>
      <div class="k">入力点</div><div class="v">${vals.map(v=>`${v.time}: ${fmt(v.value)}`).join(' ／ ')}</div>
      <div class="k">成人基準</div><div class="v">≤9 重症 ／ 9&lt;～≤16 中等症 ／ &gt;16 正常</div>
    `;

    resultBox.hidden = false;
  });

  clearBtn.addEventListener('click', ()=>{
    document.getElementById('result').hidden = true;
    document.getElementById('err').textContent = '';
  });
});
