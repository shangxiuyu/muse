import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = 'output/gallery-muse';
const hash = value => createHash('sha256').update(value).digest('hex');
async function review(id, change, changes) {
  const path = `${root}/${id}`;
  const original = await readFile(`${path}/artifact.json`, 'utf8');
  const artifact = JSON.parse(original);
  change(artifact);
  const result = `${JSON.stringify(artifact, null, 2)}\n`;
  await writeFile(`${path}/reviewed-artifact.json`, result);
  await writeFile(`${path}/review.json`, `${JSON.stringify({originalArtifactSha256:hash(original),artifactSha256:hash(result),changes,reviewer:'Codex / independent QA'},null,2)}\n`);
}
await review('less', a => {
  const copy = [
    [['Muse 原创概念样板：一份关于「该删什么」的提案，不是关于「少即是多」的口号。','先问一件东西为什么要留下。<br>再决定，还需要增加什么。'],['Muse 原创概念样板 · 演示文稿','Muse 原创概念样板'],['虚构品牌示例','01 / 06']],
    [['加一个功能，有人签字。砍一个功能，要有人承担风险。于是产品越来越厚，而每一样都要分走同一份注意力。','每加一项功能，<br>都要分走一份注意力。'],['让人犹豫的往往不是选不到，而是选不完。','先问用途，再决定保留。'],['本页描述为我们的观察，非调研结论','概念假设 · 非调研结论']],
    [['少，不等于少给。是把「需要解释才能发现的价值」，换成「不用解释就能感受到的价值」。','让价值，在一次使用中被感到。'],['有些东西我们确实不做了 —— 这不是克制，是选择。','每次删减，先说清留下的价值。']],
    [['这件事解决了什么问题？答不上来，就不进入下一稿。它是第一个被问的问题，不是最后一个。','解决什么问题？答不上来，就不进入下一稿。'],['拿起、打开、收好这三个动作，有没有一个被认真打磨过？如果没有，再多参数也只是一份说明书。','拿起、打开、收好，哪个动作变顺手了？'],['用旧之后修得好、换得掉吗？修不了的我们不做——这不只是环保，是承认它会被用很久。','用旧之后能修好吗？说清可替换的部分。'],['编号为不等宽展开，非三等分卡片','评审原则 · 概念示例']],
    [['贴合手指的杯把。喝到最后一口仍顺畅的弧度。放上桌面时不会晃的底。','贴合手指的杯把。<br>顺畅的杯口。<br>放得稳的杯底。'],['只有在照片里才好看的<u>装饰</u>。难清洗的<u>多余结构</u>。没有明确用途的<u>新杯型</u>。','难清洗的<u>多余结构</u>。<br>只为拍照的<u>装饰</u>。<br>没有用途的<u>新杯型</u>。'],['杯型为构想说明 · 未经材料与使用测试验证','杯型概念 · 未经测试验证']],
    [['从真实使用里挑一个不顺手的地方。只挑一个。','选一处不顺手的地方。'],['只改影响这个动作的细节，其余一律不动。','只改影响这个动作的细节。'],['再选一次。这次留下的是哪一个改动，要说得出口。','再试一次，说清留下的改动。'],['一个负责人','负责人'],['这一版到这里停 —— 下一次减法，等真实用户来提。','下一次减法，从真实使用里找。'],['虚构品牌与项目示例 · 行动方案未含真实排期','行动构想 · 无真实排期']]
  ];
  const extra = [
    `.p1 .hd,.p1 .ft{width:70%}.p1 .hd span:last-child,.p1 .ft span:last-child{width:auto;padding-left:0;text-align:right;color:#EDF3E6}.p1 .body{max-width:65vw;padding:1vh 0}.p1 .lat{font-size:clamp(25px,7.4vw,124px);margin-bottom:2vh}.p1 .sub{margin-top:2vh;padding-top:1.5vh;line-height:1.55;max-width:38ch}`,
    `.p2 .grid{grid-template-columns:minmax(0,56%) minmax(0,1fr)}.p2 .lcol{padding:1vh 3vw 1vh 0}.p2 h2{font-size:clamp(15px,3.3vw,56px);margin:1.3vh 0 2vh}.p2 .num{font-size:clamp(9px,1.7vw,29px)}.p2 p{line-height:1.65;margin-bottom:1.8vh}.p2 p:last-child{line-height:1.5}.p2 .void{padding-left:4vw;gap:2vh}.p2 .void .vtxt{color:#5B6D50;font-size:clamp(10px,1.9vw,33px)}.p2 .void .vhead{color:#5B6D50}`,
    `.p3 .body{padding:1vh 0}.p3 .lead{line-height:1.65;margin-top:2.5vh}.p3 .claim{margin-top:2.2vh;line-height:1.6}.p3 .line{display:none}`,
    `.p4 .head{margin-top:2vh}.p4 .r{padding:1.6vh 0;grid-template-columns:5% 23% minmax(0,1fr)}.p4 .v{line-height:1.55}.p4 .k{font-size:clamp(10px,1.75vw,30px)}.p4 .rows{margin-top:1.5vh}.p4 .vtest span{margin-bottom:.6vh;color:#556B47}.p4 .vtest b{font-size:clamp(9px,1.3vw,23px);line-height:1.4}`,
    `.p5 .hatch{background-image:none;border-right:2.4vw solid rgba(201,240,74,.24)}.p5 .wrap{gap:3vh;padding:1vh 0}.p5 .keep p,.p5 .drop p{font-size:clamp(9px,1.15vw,19px);line-height:1.65}.p5 .keep b,.p5 .drop b{margin-bottom:1.4vh}.p5 .ft span{background:none;padding:0}.p5 .ft{border-top-color:rgba(14,36,24,.3)}.p5 .ft span:first-child{color:#0E2418;background:#C9F04A;padding:0 .6vw}.p5 .ft span:last-child{color:#C1CCB9}`,
    `.p6 h2{font-size:clamp(15px,3.4vw,58px);max-width:90%;margin-bottom:1.7vh}.p6 .stack{margin-top:2vh}.p6 .s{padding:1.45vh 0;grid-template-columns:5% 23% minmax(0,1fr) 15%;gap:0 1.8vw}.p6 .v{line-height:1.5}.p6 .k{font-size:clamp(10px,1.5vw,27px)}.p6 .o{font-size:clamp(7.5px,1vw,16px);letter-spacing:0;color:#526B45}.p6 .empty{min-height:0;gap:.9vh;padding-bottom:.5vh}.p6 .empty i:last-of-type{display:none}.p6 .empty span{font-size:clamp(8px,1.1vw,20px);letter-spacing:0;color:#526B45}`
  ];
  a.slides.forEach((slide, i) => {
    for(const [from,to] of copy[i]) { if(!slide.html.includes(from)) throw new Error(`Missing text in less page ${i+1}: ${from}`); slide.html=slide.html.replace(from,to); }
    const n = i+1;
    slide.html=slide.html.replace('</style>',`.p${n}{height:100vh;min-height:0;padding:4vh 5.2vw 3vh}.p${n} .hd{font-size:clamp(6.5px,1vw,16px);letter-spacing:.08em;padding-bottom:1.4vh}.p${n} .ft{font-size:clamp(10px,1vw,16px);letter-spacing:0;line-height:1.2;padding-top:1.4vh;flex:none}${extra[i]}.p2 .void .vhead,.p4 .vtest span{font-size:clamp(6.5px,1vw,16px)}</style>`);
    if(i===0) slide.note=slide.note.replace('再念出这五个字','再念出标题这句话');
    if(i===1) slide.note=slide.note.replace('这是我们的观察，不是数据。','这是问题假设，不是已开展的观察或调研。');
    if(i===2) slide.note=slide.note.replace('全篇唯一反相页。','从浅底切回深底。');
  });
  a.direction='概念：用「留下 / 放下」组织品牌理念。青柠绿标出被保留的部分，深绿与暖纸色承接问题、原则和行动。六页依次为主张、选择负担、减法边界、三条评审原则、杯型构想和一次可复盘的改动；各页保留中文讲者备注。\n\n交付：6 页 HTML Web Deck，可在 Muse 中预览并导出 HTML。窄版维持 16:9 横向构图，用于缩览；完整阅读请展开演示。逐页的虚构性质与未测试边界保留在页脚及备注中。\n\n独立复核：在 Chrome 中逐页检查 1200×675 和 360×203，缩短过密正文、调整标题断行与页脚空间，并移除穿过正文的装饰竖线；复核结果与截图另存。未验证投影环境、200% 文字缩放或导出容器的全部交互，不提供 PPTX。品牌、产品原则与杯型均为原创概念示例，不含真实调研、客户背书或测试结果。';
}, ['固定每页为目标视口高度，调整第2、4、6页内容密度和标题断行，保留横向比例。','所有必要页脚披露字号至少10px，1200px画布元信息12px，缩短披露以完整显示。','删除第5页穿过正文的竖线纹理，移除第3页穿过内容的横线并提升弱对比说明。','精简屏幕正文并保留中文备注，修正“五个字”错误和调研观察措辞。','删除direction中未经实现的数字直跳/总览/备注快捷键承诺和创作修复历史。']);
await review('coffee', a=>{
  a.direction='概念：社区咖啡店「日常」先向邻居说清来意和可期待的日常，用具体场景邀请人进门。核心判断是：开业传播应先回答「来了可以怎样度过」，再介绍品牌。\n\n内容结构：门口文案、给邻居的信、社交平台开业帖、三组外带杯文案、品牌简介，分别对应进门、认识、到店、带走和转述。五组文案完整，地址、日期、营业时间与店休日均需填写真实信息；菜单、植物、阳光座位等场景需按实况替换。\n\n独立复核：已通读五组文案并在1200px及360px宽度检查完整排版，无横向溢出。未进行真实读者反馈或实体物料试印。品牌与场景为原创概念示例，未使用真实经营成绩或客户背书。';
}, ['删除direction里错误字数计算和废弃修复过程，保留用途、内容结构、事实待填项与未验证边界。']);
await review('letter', a=>{
  a.text=a.text.replace('每间书店都在卖「读完一本书」的成就感。书架上的腰封写着「一口气读到天亮」，读书会的海报说「本周共读，打卡三十天」。我们把「读完」当成了读书唯一算数的样子，于是那些读到一半的书，就成了一件需要道歉的事。','一本书读到一半，可能会让你惦记很久。书签夹在那里，每次拿起，又觉得得找一个能一口气读完的晚上。这样等下去，读了几页的那次晚上，倒像不算数了。');
  a.text=a.text.replace('因为我们见过太多人，在「一定要读完」的压力里，反而再也没翻开过那本书。读不下去的原因常常不是书不好，而是生活太快：读到一半，工作来了，孩子醒了，或者只是那天心情不对。紧赶着读完，读进去的反而不多。','如果「一定要读完」成了翻开书的条件，我们想先把这个条件拿掉。也许工作打断了你，也许孩子醒了，也许只是那天不想再往下读。无论停在什么地方，这次都可以从那一页接着来。');
  a.text=a.text.replace('## 05 · 活动后的感谢\n\n谢谢你','## 05 · 活动后的感谢\n\n> 活动结束后使用：请先用真实现场替换下方方括号内容。\n\n谢谢你');
  a.text=a.text.replace('有人读了几页，有人读完了一章，也有人只是听见了一句想带回家再想想的话。这些都没关系——因为这场活动从一开始，就没把「读完」当作标准。','[补充一件现场确实发生、适合公开分享的小事；没有可确认的细节，可删去这一段。]\n\n这场活动没有把「读完」当作标准。你愿意把书再翻开，就已经回应了这次邀请。');
  a.direction='概念：让「不必读完」成为一次阅读活动的真实参与条件。核心判断是：给搁下的书留一次继续的机会，比要求读者完成一次打卡更适合本次邀请。\n\n五组内容按读者旅程展开：短信邀请、解释活动主张的长文、海报、含流程与退出方式的社群通知、活动后感谢。时间、地址、报名、费用和联系渠道均待填写；九十分钟仅为建议流程，感谢文案必须在活动后填入已确认的现场细节。\n\n独立复核：五组用途齐全，已删除无依据的行业全称判断与经营观察；活动后文案不预设真实事件。在1200px和360px宽度检查完整排版，无横向溢出。未进行真实读者反馈或实地活动验证；品牌、书店与活动均为原创概念示例。';
}, ['将“每间书店”全称判断及“我们见过太多人”无依据观察改为读者可能遇到的情境。','活动后感谢在本段明确使用时机，现场故事改为待填项，避免分段复制后冒充活动已发生。','direction重写为最终概念、五组用途、待填事实和真实验收边界。']);
await review('field', a=>{
  if(!a.slides[4].note.includes('四周之后')) throw new Error('Missing field pilot-period conflict');
  a.slides[4].note=a.slides[4].note.replace('四周之后','两周之后');
}, ['第5页讲者备注“四周之后”改为“两周之后”，与页标题、正文和试点计划的两周周期一致。']);
