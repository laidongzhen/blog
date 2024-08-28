/*
 * @Author: laidz laidz@yelinked.com
 * @Date: 2024-08-28 11:42:02
 * @LastEditors: laidz laidz@yelinked.com
 * @LastEditTime: 2024-08-28 11:42:14
 * @Description: 
 */
module.exports = {
    "types": ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
    "scope": {
        "required": false,
        "allowed": ["*"],
        "validate": false,
        "multiple": false
    },
    "warnOnFail": false,
    "maxSubjectLength": 100,
    "subjectPattern": ".+",
    "subjectPatternErrorMsg": "subject does not match subject pattern!",
    "helpMessage": "",
    "autoFix": false
}