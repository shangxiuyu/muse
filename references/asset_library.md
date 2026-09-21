# 用户品味记忆：资产库协议

本文件是 [Taste Memory](taste_memory.md) 的存储与检索协议。面向任务的心智模型是“参考 → 真实反应 → 可迁移推断 → 有范围的选择 → 应用经验”；底层分别由 reference、reaction、system、preference 与 application 承载。技术结构服务于品味学习，不应主导与用户的交流。

Muse 的整体架构只有两部分：AI 基础审美推理，以及本文件描述的用户品味记忆。公共教学案例属于前者，不是个人资产；作者声音画像与用户审美反应属于后者，不是公共方法。

## 基础方法与个人资产的边界

Muse 随 skill 提供只读 [公共知识目录](public_cases.json)，目前收录 4 组 UI 与 4 组文字原创教学参考及其条件化原则。它们只训练 AI 的基础判断，不保存用户个人声音、喜好或历史。公共文字案例可以说明怎样保护作者声音，但自身仍是 `aesthetic` 方法，不能标记为 `author_voice`。

    node scripts/asset_library.js list --source public --kind system --medium web
    node scripts/asset_library.js list --source public --kind system --medium text
    node scripts/asset_library.js show --source public --id public-ui-task-hierarchy
    node scripts/asset_library.js list --source all --vault <private-dir> --kind system

`--source public` 完全不读取私人目录，开箱可用；`all` 分别读取两库，结果保留 source。默认仍是 personal，兼容现有调用。相同 id 可以存在于不同库；`show --source all` 遇到重名会报错，需指定 public 或 personal。公共与个人库各自校验历史和证据，不自动合并、不静默覆盖。损坏的个人库会使 all 查询失败；仍可单独查 public。

公共 source locator 有两种合法形式，`node scripts/audit.js` 会校验它可解析：

1. **技能根目录相对路径**，指向技能内实际存在的文件，升级可搬迁整个技能而不失联。
2. **自包含锚点** `references/public_cases.json#<entry-id>[/<observation-id>]`，用于教学材料本身就内嵌在该条目 `data` 里的情况——当前全部公共条目都是这一种。公共案例曾指向从未随技能发布的 `exemplars/` 文件，等于宣称了取不到的证据；6.0 起改为自包含，观察文本就在条目内，可被直接核对。

个人资产仍使用稳定绝对路径。公共知识目录随技能更新，条目修改应增加 revision 并保留旧记录，不能覆盖历史。脚本仅开放公共读取，put 只写个人库，不接受 --source。

应用记录当前只能引用同一个人库内的系统。要长期记录对公共系统的应用，先将选中的系统和它所引用的参考快照整理为个人 bundle，在出处说明中记录原公共 id、版本与教学性质；个人新条目从 revision 1 开始，处理已有 id 冲突并按导入后的个人版本重建证据引用，再执行 put。不要仅复制系统、让证据悬空，也不要把导入解释为确认用户偏好。未导入时可直接参考公共系统完成设计，无需为使用而初始化个人库。

## 个人库所有权与位置

个人库在技能目录之外，升级 Muse 不覆盖它。位置依次使用用户指定路径（--vault）、MUSE_VAULT_DIR、默认 ~/Documents/Muse。使用默认值前可运行 location 命令得到绝对路径；首次保存回执告知位置。用户已选路径持续沿用，避免创建第二个库。脚本不修改全局环境变量，也不扫描磁盘寻找用户资料。

默认目录提供跨项目稳定位置；只有需要保存且已有授权时初始化。若已存在却不是合法 Muse 库，保留内容，询问或采用用户已授权的另一个位置；不得清空重建。只读查询不存在的库返回空结果，不创建文件。目录名以实际操作系统为准，用户可换到 Obsidian 或其他私有位置。

    node scripts/asset_library.js location
    node scripts/asset_library.js init --vault <private-dir>

## 个人库中的资产类型与应用记录

| 层 | 保存内容 | 含义 |
|---|---|---|
| reference | 来源、时间、覆盖、可定位观察、未知项 | 分析过／收藏过 |
| reaction | 反应对象、实际发生时间、情境、用户原话、感受、解释状态、范围与可追溯矛盾 | 用户在特定相遇中真实喜欢、排斥、迟疑或被触动过 |
| system | 意图、场景、媒介、原则、证据引用、边界；含 aesthetic 与 author_voice 两种 system_type | 可供选择的审美系统或个人作者声音画像 |
| preference | personal_dna.yaml／personal_taboos.yaml 内的候选与确认 | 用户自己的选择，按场景生效 |
| application | 使用的系统版本、产物、适配、结果、反馈来源 | 系统在真实任务中的使用记录 |

对用户优先使用“参考／收藏、品味信号、审美系统、使用记录”等自然语言；只在需要解释存储、命令或调试时暴露内部类型名。

这些资产不能相互自动晋升。reference／reaction／application 的 active 只是未归档；system 的 ready 只是可供参考。`reaction` 证明用户在特定情境中表达过某种反应，不等于 candidate preference；`author_voice` 表示有证据的场景化声音画像，也不自动等于用户主动偏好。用户说“喜欢这张图的排版”只支持该层面，不支持该图全部特征；从反应提炼的判断可记录 candidate，明确“以后采用”才能成为 confirmed。system 原则可以直接引用 reaction 的具体版本，从而保留推断来源，但这种引用不证明 AI 对原因的解释正确。偏好命令见 [偏好协议](memory_protocol.md)。作者声音的保存边界见 [作者声音画像](personal_assets/author_voice_profile.md)。source 可引用 `reaction:<id>@<revision>` 或 `system:<id>@<revision>` 加用户反馈位置，保留两者关联。

本地原件、产物和反馈文件使用稳定的绝对路径；会话来源使用可追溯的任务／消息标识。不要只记 work/example.txt 这类依赖当前工作目录的路径。脚本检查引用关系与字段，不能验证链接将来始终可访问。

## 保存与版本

Agent 将实际分析写成 [数据格式](asset_schema.md) 定义的 JSON bundle，然后执行：

    node scripts/asset_library.js put --vault <private-dir> --file <bundle.json>
    node scripts/asset_library.js show --vault <private-dir> --id <system-id>

参考、反应、系统和应用记录存于 aesthetic_assets.json；同批校验与原子写入，避免反应、矛盾关系或系统已存但对象／证据缺失。新写入使用 schema 2；schema 1 旧库与 4.3 过渡 reaction 可读，并在下一次真实写入时透明升级。共用偏好写锁，保留写入前备份。新条目 expected_revision 为 0；修改先 show，传当前 revision 与完整 data。重复同一 id 和内容无变更；不同内容的过期版本阻断，重新读取后合并，不盲目重试。每次真实修改增加版本，旧系统与 reaction 始终引用当时的资产版本。

优先检查同一来源／主题是否已经存在，再复用稳定 id。脚本只按 id 去重，不声称能发现 URL 别名、近似图片或同义系统。相似项可以并存，使用前由 Agent 判断。

归档：以当前 revision 保存完整 data 并把 status 改成 archived。普通列表排除归档，历史证据与应用仍保留；明确回顾时可查询。不静默删除矛盾项。需要恢复旧表达时 show --revision N，再作为当前条目的新版本保存，保留修改历史。

脚本不提供彻底擦除功能；归档仍保留原内容和备份。用户要求删除时需处理当前记录、引用、历史及备份，不能把归档称为删除。损坏文件或锁冲突直接停止该次写入，保留源文件；不要自动移除未知锁或用空库覆盖。

## 按任务检索与应用

    node scripts/asset_library.js list --vault <private-dir> --kind system --medium text
    node scripts/asset_library.js list --vault <private-dir> --kind system --system-type author_voice --medium text
    node scripts/asset_library.js list --vault <private-dir> --kind system --query "具体动作"
    node scripts/asset_library.js list --vault <private-dir> --kind reaction --medium web --valence liked
    node scripts/asset_library.js show --vault <private-dir> --id <system-id>
    node scripts/asset_library.js show --vault <private-dir> --id <reference-id> --revision 1

list 是字面筛选，不是语义搜索或推荐分数；query 的空格分词全部匹配，tag、system-type 与 valence 为精确匹配。medium 可筛选 system 的 media 或 reaction 的 context.medium。无结果时减少筛选，再看完整记录；不要将“没有关键词命中”解释成“没有适用资产”。旧 system 没有 system_type 时按 aesthetic 返回。

Agent 结合当前目的、受众、媒介、密度、品牌限制筛选少量候选，再读原则、反向情境和必要证据。优先当前明确要求与适用 confirmed 偏好。ready 可作参考但不是命令；draft 只能辅助探索并说明缺口。归档系统不默认新用，历史 application 仍可回看。未找到合适系统就根据基础判断创作，不硬套用户库。

先完成作品，再依据实际观察与用户反馈记录应用结果。系统修订与个人偏好写入是两个独立动作；一个成功另一个失败时分别说明，不能声称全流程成功。
