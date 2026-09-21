# 资产写入格式

用 JSON 文件传给 asset_library.js put，不把原文拼接到命令行。下列字段由脚本校验；真实性、审美判断和用户授权由 Agent 基于实际材料确认。脚本不抓取网页、不调用图像模型、不自动判断喜好。

顶层为 {"entries": [...]}。每项包含 id、kind、expected_revision、data。id 使用 1–80 位小写字母、数字、连字符或下划线；跨类型唯一。新建 expected_revision=0，修改传现版本。未列字段会报错，避免把 confidence 或 preferred 等自造字段当成已支持状态。

所有 data 有 title（非空）、tags（字符串数组）、status。reference／reaction／application 可用 active、archived；system 可用 draft、ready、archived。个人作者声音画像使用 system，并明确设置 `system_type: author_voice`。新建或发生真实修改的个人资产库使用 `schema_version=2`。Muse 4.4 可读 schema 1；旧库在下一次真实写入时透明升级，不需要单独迁移。4.3 曾在 schema 1 中写入 reaction，因此这类过渡记录也继续可读；升级后不保证 4.2 或更早 reader 可以降级读取。

## reference.data

- source：kind=website/image/article/mixed；locator=原 URL、稳定文件路径或明确的教学来源；captured_at=ISO 时间；coverage=rendered/text-only/image-viewed/partial/unavailable。
- observations：{id, locator, observation} 数组，id 在该参考内唯一；locator 定位段落、区域、截图。记录观察，不混入偏好或操作命令。
- limits：未知项字符串数组；coverage=unavailable 时 observations 必须为空。

## reaction.data

`reaction` 只允许写入个人库，保存用户在具体情境中真实表达过的反应。它不是 preference，也没有 candidate／confirmed 状态。

- subject：反应所针对的作品。`kind=reference` 或 `application` 时使用 `asset_id` 与 `asset_revision`，并且必须链接同一个人库中的有效版本；`kind=artifact` 时只使用稳定 `locator`。两种链接方式不能混用。
- target：反应对象，含 kind=whole/region/text/image/interaction/transition/sound/unknown 与非空 locator。locator 写“价格表第二列”“保存完成后的反馈”等可复查位置；无法定位时明确写 unknown。
- context：含 medium=web/text/slides/image，以及 task、audience、environment、moment。未知信息写 unknown，不补造设备、心境或使用目的。
- occurred_at：反应实际发生的 ISO 时间；无法可靠确定时写 `unknown`。它不同于条目 updated_at，后者只是入库或修订时间。
- user_quote：用户原话；不能用 AI 总结替换。valence=liked/disliked/mixed/neutral/unknown；strength=low/medium/high/unknown。
- felt_effect：用户明确表达的感受数组；没有就用空数组，不把 AI 猜测放入其中。
- reason：含 status=user_stated/ai_inferred/co_formed/unknown 与 text。原因未知时保留 `{status:"unknown", text:"unknown"}`；AI 推断不能覆盖用户原话。
- scope：这次反应能够支持的适用范围，通常保持窄。
- contradictions：与其他 reaction 的结构化关系数组，可为空。每项为 `{reaction_id, reaction_revision, relation, note}`；relation=conflicts/qualifies/contextualizes。脚本验证所指版本存在且不是自身。与偏好但尚无对应 reaction 的冲突先写在 scope／note 中，不能伪造链接。

同一参考可以有多条指向不同局部、情境或时间的 reaction。整体喜欢与局部排斥应分别记录，不合并成一个平均态。只有用户授权长期保存时写入；当前会话中的临时反馈可直接用于修作品，无需初始化个人库。

```json
{
  "entries": [
    {
      "id": "reaction-poster-pause",
      "kind": "reaction",
      "expected_revision": 0,
      "data": {
        "title": "视线在海报右下角停住",
        "status": "active",
        "tags": ["海报", "停顿"],
        "subject": {"kind": "artifact", "locator": "/stable/path/to/poster.png"},
        "target": {"kind": "region", "locator": "右下角日期与空白交界"},
        "context": {"medium": "image", "task": "浏览展览海报", "audience": "用户本人", "environment": "手机屏幕", "moment": "第一次完整观看"},
        "occurred_at": "2026-09-13T10:00:00+08:00",
        "user_quote": "我说不清为什么，但视线到右下角这里时突然停住了，我很喜欢这种停顿。",
        "valence": "liked",
        "strength": "high",
        "felt_effect": ["停留"],
        "reason": {"status": "unknown", "text": "unknown"},
        "scope": "本次海报观看；能否迁移到其他海报未知",
        "contradictions": []
      }
    }
  ]
}
```

## system.data

- system_type：可选值 aesthetic／author_voice。旧资产省略时按 aesthetic 读取；新建作者声音画像必须显式使用 author_voice。
- media：web/text/slides/image 中的非空数组，表示预期应用媒介，不代表所有媒介已验证。
- scope：受众、任务和适用范围；intent：想形成的体验或完成的任务。
- principles：每项含 name、rule、rationale、applies_when、avoid_when（均非空），confidence=supported/provisional，evidence 为非空数组。
- evidence 支持两类可校验证据：`{kind:"reference_observation", reference_id, reference_revision, observation_id}`，或 `{kind:"reaction", reaction_id, reaction_revision}`。脚本验证所指版本存在；旧的无 kind reference evidence 继续可读。引用 reaction 证明用户确实这样反应过，不等于证明 AI 对原因的解释正确，因此通常先用 provisional。
- limits：未覆盖维度和判断限制；ready 必须有原则。局部证据充分可以 ready，但不得省略未知范围。

`author_voice` 只允许写入用户个人库，media 必须包含 text。它记录特定作者在明确 scope 中有证据的读者关系、判断姿态、段落推进和节奏选择；不得只用“自然、真诚、高级”等无证据形容词，也不得自动生成 confirmed preference。具体流程见 [作者声音画像](personal_assets/author_voice_profile.md)。

## application.data

- system_id、system_revision：使用的具体系统版本，必须存在。
- artifact：稳定产物位置；context：本次目标与场景。
- adaptations：保留或调整的要素，字符串数组。
- outcome：实际观察结果或明确未验证；feedback_source：真实反馈位置，尚无用户反馈时明确写明。不能把 Agent 自评冒充用户评价。

## 最小教学示例

下面的两段是人为编写的教学材料，不是用户的文章或偏好：

第一段：“她把裂开的杯沿对齐，用细绳固定。”
第二段：“修补的意义，要从这些耐心的小动作里看。”

相应可运行 bundle 见 [example_asset_bundle.json](example_asset_bundle.json)。它展示可定位观察 → 有条件的叙述原则；可在临时库试用，不自动加入用户真实库。修改时先 show 获取完整 data，不只提交要改的单个字段。

## 公共知识目录与来源隔离

[公共知识目录](public_cases.json) 使用同一 library schema：schema_version=2、updated_at、entries；每项含 id、kind、revision、data、history、updated_at。公共教学条目只含 reference 和 `system_type: aesthetic` 的 system；省略 system_type 的旧条目也按 aesthetic 读取。公共目录禁止 `reaction`、`application` 与 `author_voice`，因为它们都需要特定用户所有权或真实使用记录。reference 的 locator 相对技能根目录解析，须指向技能内实际存在的文件，或使用自包含锚点 `references/public_cases.json#<id>[/<observation-id>]`；观察的 locator 也须可解析到该条目内的真实 observation id。自审会校验这一点，指向不存在的文件将报错。当前目录仅有文字教学证据，不能宣称 rendered 或用户验证。目录不收页面骨架、推荐色板、字体套餐或可直接复制的品牌造型；UI 教学文件按任务问题命名，不用品牌或流行风格名作为检索入口。

查询的 `--source public|personal|all` 是读取范围，不是写入字段。返回中的 source 用来区分来源，不属于 entry.data 或 put bundle；保存前不要整段照抄查询结果。未指定 source 维持原 personal 行为。两库的 id、版本和证据各自独立，不能跨库填 reference_id 或 system_id；公共系统的长期应用记录需先把相关证据快照与系统导入个人库，见 [检索与保存说明](asset_library.md)。
