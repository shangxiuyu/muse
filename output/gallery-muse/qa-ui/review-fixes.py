import json, hashlib
from pathlib import Path
base=Path('output/gallery-muse')
changes={}
for name in ['reading','objects','retreat','festival']:
    original=(base/name/'artifact.json').read_bytes()
    artifact=json.loads(original)
    fixes=[]
    if name in ['reading','objects','retreat']:
        artifact['css']+='\n/* Independent QA: honor hidden for flex/grid and SVG states. */\n[hidden]{display:none !important}\n'
        fixes.append('补充 [hidden]{display:none!important}，保证隐藏状态不被 flex/grid 样式覆盖。')
    if name=='reading':
        artifact['css']+='\n/* Independent QA: mobile timer occupies only its collapsed handle. */\n@media(max-width:640px){.session{top:auto;flex-wrap:nowrap;align-items:stretch}.session .cover{display:none}.session .timer{flex:none;width:100%;min-width:0}.session .timer-actions{width:100%}}\n'
        artifact['html']=artifact['html'].replace('<button class="nav-item is-current" type="button" aria-current="page">','<button class="nav-item is-current" type="button" aria-current="page" data-view="reading">').replace('<button class="nav-item" type="button">阅读札记</button>','<button class="nav-item" type="button" data-view="note">阅读札记</button>').replace('        <button class="nav-item" type="button">书摘</button>\n','').replace('type="submit" id="noteSave"','type="button" id="noteSave"')
        artifact['js']=artifact['js'].replace("$('noteForm').addEventListener('submit', function (e)","$('noteSave').addEventListener('click', function (e)")
        artifact['js']+='\n/* Independent QA: functional section navigation. */\n(function(){document.querySelectorAll("[data-view]").forEach(function(button){button.addEventListener("click",function(){document.querySelectorAll("[data-view]").forEach(function(item){var current=item===button;item.classList.toggle("is-current",current);if(current)item.setAttribute("aria-current","page");else item.removeAttribute("aria-current")});document.getElementById("rail").classList.remove("is-open");document.getElementById("railOpen").setAttribute("aria-expanded","false");document.getElementById("scrim").hidden=true;var target=document.getElementById(button.dataset.view==="note"?"noteInput":"reading-pane");target.focus({preventScroll:true});target.scrollIntoView({block:"center",behavior:"smooth"})})})})();\n'
        fixes+=['手机计时抽屉清除继承的 top:84px，修复遮挡札记保存按钮；隐藏手机上重复且裁切的装饰书封，阅读区保留完整书名与作者。','实现正文/札记导航，移除无行为的书摘入口。','札记保存改为 button/click，兼容产品 allow-scripts 且不含 allow-forms 的预览 sandbox。']
    if name=='retreat':
        artifact['js']=artifact['js'].replace("viewYun.hidden = (key !== 'yun');", "viewYun.toggleAttribute('hidden', key !== 'yun');").replace("viewSong.hidden = (key !== 'song');", "viewSong.toggleAttribute('hidden', key !== 'song');")
        artifact['html']=artifact['html'].replace('type="submit"', 'type="button" id="planGenerate"')
        artifact['js']=artifact['js'].replace("form.addEventListener('submit', function (e)", "document.getElementById('planGenerate').addEventListener('click', function (e)")
        artifact['js']+='\n/* Independent QA: Enter submits date inputs without form navigation. */\ndocument.getElementById("planForm").addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.tagName==="INPUT"){e.preventDefault();document.getElementById("planGenerate").click()}});\n'
        fixes+=['房型景观 SVG 组改用 hidden attribute 切换，修复 .hidden 属性无法更新 SVG 可见状态。','生成行程意向改为 button/click，并兼容日期输入 Enter，适配产品 allow-scripts sandbox。']
    if fixes:
        out=(json.dumps(artifact,ensure_ascii=False,indent=2)+'\n').encode()
        (base/name/'reviewed-artifact.json').write_bytes(out)
        review={'originalArtifactSha256':hashlib.sha256(original).hexdigest(),'artifactSha256':hashlib.sha256(out).hexdigest(),'changes':fixes,'reviewer':'Codex / independent QA'}
        (base/name/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    html=artifact['html'];css=artifact['css'];js=artifact['js']
    if '<html' in html:
        html=html.replace('</head>',f'<style>{css}</style></head>').replace('</body>',f'<script>{js}</script></body>')
    else:
        html=f'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body>{html}<script>{js}</script></body></html>'
    (base/'qa-ui'/name/'index.html').write_text(html)
    changes[name]=fixes
print(json.dumps(changes,ensure_ascii=False,indent=2))
