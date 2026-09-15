# Muse 前向行为测试协议

用于验证 Agent 是否真的按 Muse 做出判断和写入，而不只验证文档关键词或脚本字段。只有实际执行、检查产物并留下观察记录后，某个 behavioral case 才能标记为已运行。

## 隔离条件

1. 为本次测试创建独立临时工作区与空 Muse vault，不读取或修改用户真实 Taste Memory。
2. 执行者只获得 `SKILL.md`、behavioral case 的 brief 和完成任务必需的原始素材；不提供预期答案、历史 review 或疑似缺陷。
3. 有独立 Agent／观察者且已获授权时优先使用；否则由当前 Agent 隐藏预期检查项后执行，再明确标为“同一 Agent 隔离复核”，不能冒充独立评测。

## 执行与观察

1. 让执行者完成 brief，包括真实读取、生成、交互或写入。
2. 评测者随后读取 case 的 check、required_observation 与 blockers。
3. 直接检查最终产物、实际个人库文件、引用版本和必要运行环境；不能只看执行者的文字总结。
4. 每项记录 pass／fail／not-observed 及证据位置。任何 blocker 出现则该 case 失败；未观察的要求不能算通过。
5. UI／多媒体案例必须观察最终媒介；Taste Memory 案例必须回读隔离 vault，并确认 personal_dna.yaml 没有发生未经授权的升级。

## 最小结果格式

```json
{
  "case_id": "taste-reaction-unknown-reason",
  "executor": "independent-agent | same-agent-isolated",
  "status": "pass | fail | incomplete",
  "observations": [
    {"requirement": "...", "status": "pass | fail | not-observed", "evidence": "稳定文件位置或可复查描述"}
  ],
  "blockers_found": [],
  "limits": []
}
```

测试结束后只清理明确为本次测试创建的临时目录；保留结果记录所需证据，或在清理前将证据复制到用户指定的评测输出位置。自动测试仍应报告行为评测未运行，除非宿主明确接入并校验了上述结果。
